import { type KeyboardEvent, useEffect, useRef, useState } from 'react';

import './index.css';

declare global {
  interface Window {
    API_KEY?: string;
  }
}

type MessageType = 'bot' | 'user';

interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: string;
}

const API_CONFIG = {
  baseUrl: "https://177.177.0.236:60026",
  // baseUrl: "https://localhost:60026",
  endpoints: {
    chat: '/api/Chat'
  }
};

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  type: 'bot',
  content: 'Merhaba! Argetek AI asistanına hoş geldiniz. Size nasıl yardımcı olabilirim?',
  timestamp: new Date().toISOString()
};


const BotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 2a2 2 0 0 0-2 2v1.05A7.002 7.002 0 0 0 5 12v5H4a1 1 0 1 0 0 2h16a1 1 0 1 0 0-2h-1v-5a7.002 7.002 0 0 0-5-6.95V4a2 2 0 0 0-2-2Zm0 4a5 5 0 0 1 5 5v5H7v-5a5 5 0 0 1 5-5Zm-3 6a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H9Zm6 0a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H15Zm-6.5 5.5a1 1 0 0 0 0 2h7a1 1 0 1 0 0-2h-7Z"
    />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 2a5 5 0 1 1-3.535 8.536A5 5 0 0 1 12 2Zm0 12c4.337 0 7.5 2.62 7.5 6v1.5a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V20c0-3.38 3.163-6 7.5-6Z"
    />
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M3.4 20.4 21 12 3.4 3.6l-.002 6.263L15 12 3.398 14.137 3.4 20.4Z"
    />
  </svg>
);

const createMessage = (type: MessageType, content: string): ChatMessage => ({
  id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  type,
  content,
  timestamp: new Date().toISOString()
});

const formatApiResponse = (data: unknown): string => {
  if (data == null) {
    return '';
  }

  if (typeof data === 'string') {
    return data;
  }

  if (typeof data === 'object') {
    const typed = data as Record<string, unknown>;
    return (
      (typeof typed.response === 'string' && typed.response) ||
      (typeof typed.message === 'string' && typed.message) ||
      (typeof typed.content === 'string' && typed.content) ||
      (typeof typed.result === 'string' && typed.result) ||
      (typeof typed.text === 'string' && typed.text) ||
      JSON.stringify(data)
    );
  }

  return String(data);
};

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    accept: '*/*'
  };

  if (window.API_KEY) {
    headers.Authorization = window.API_KEY.startsWith('Bearer')
      ? window.API_KEY
      : `Bearer ${window.API_KEY}`;
  }

  return headers;
};

const App = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessageToAPI = async (message: string) => {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.chat}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        id: 0,
        prompt: message,
        response: '',
        createdAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`API hatası: ${response.status} ${text}`.trim());
    }

    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return formatApiResponse(data);
    }

    return await response.text();
  };

  const handleSendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage = createMessage('user', trimmedInput);
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setError(null);
    setIsLoading(true);
    setIsTyping(true);

    try {
      const apiResponse = await sendMessageToAPI(trimmedInput);
      const botMessage = createMessage('bot', apiResponse);
      setMessages((prev) => [...prev, botMessage]);
    } catch (apiError) {
      console.error(apiError);
      setError('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <div className="chat-header-icon" aria-hidden="true">
          <BotIcon />
        </div>
        <div>
          <div className="chat-header-title">Argetek AI Asistan</div>
          <div className="chat-header-subtitle">Size nasıl yardımcı olabilirim?</div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-avatar" aria-hidden="true">
              {message.type === 'bot' ? <BotIcon /> : <UserIcon />}
            </div>
            <div className="message-content">{message.content}</div>
          </div>
        ))}

        {isTyping && (
          <div className="message bot">
            <div className="message-avatar" aria-hidden="true">
              <BotIcon />
            </div>
            <div className="typing-indicator" aria-label="Yazıyor">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        {error && <div className="error-message">{error}</div>}
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Mesajınızı yazın..."
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
          />
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            aria-label="Mesaj Gönder"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;

