// Argetek AI Chatbot - React Component
class ArgetekChatbot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            inputValue: '',
            isTyping: false,
            isLoading: false,
            error: null,
            isConnected: false
        };
        
        this.messagesEndRef = React.createRef();
        this.inputRef = React.createRef();
        
        // API Configuration
        this.API_CONFIG = {
            baseUrl: props.apiUrl || 'https://your-api-url.com',
            endpoints: {
                chat: '/api/chat',
                health: '/api/health'
            },
            timeout: 10000 // 10 saniye timeout
        };
    }

    componentDidMount() {
        this.initializeChatbot();
        this.checkAPIConnection();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.messages !== this.state.messages) {
            this.scrollToBottom();
        }
    }

    initializeChatbot = () => {
        const welcomeMessage = {
            id: this.generateId(),
            type: 'bot',
            content: 'Merhaba! 👋 Argetek AI asistanınıza hoş geldiniz. Size nasıl yardımcı olabilirim?',
            timestamp: new Date()
        };
        this.setState({ messages: [welcomeMessage] });
    };

    checkAPIConnection = async () => {
        try {
            const response = await this.apiCall(this.API_CONFIG.endpoints.health, 'GET');
            this.setState({ isConnected: response.status === 'ok' });
        } catch (error) {
            console.warn('API bağlantısı sağlanamadı, demo modu aktif');
            this.setState({ isConnected: false });
        }
    };

    generateId = () => {
        return Date.now() + Math.random();
    };

    scrollToBottom = () => {
        this.messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // API İletişim Fonksiyonları
    apiCall = async (endpoint, method = 'POST', data = null) => {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...this.props.headers // Ekstra header'lar varsa ekle
            },
            signal: AbortSignal.timeout(this.API_CONFIG.timeout)
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${this.API_CONFIG.baseUrl}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`API hatası: ${response.status}`);
        }

        return await response.json();
    };

    sendMessageToAPI = async (message) => {
        try {
            const payload = {
                message: message,
                sessionId: this.props.sessionId || 'default',
                timestamp: new Date().toISOString(),
                context: this.getChatContext()
            };

            const response = await this.apiCall(this.API_CONFIG.endpoints.chat, 'POST', payload);
            
            return {
                content: response.response || response.message || 'Yanıt alınamadı',
                metadata: response.metadata || null
            };
            
        } catch (error) {
            console.error('API Hatası:', error);
            // Bağlantı yoksa demo moduna geç
            if (!this.state.isConnected) {
                return this.getDemoResponse(message);
            }
            throw error;
        }
    };

    getChatContext = () => {
        // Son 5 mesajı context olarak gönder
        return this.state.messages.slice(-5).map(msg => ({
            type: msg.type,
            content: msg.content
        }));
    };

    getDemoResponse = (message) => {
        const responses = [
            'Anladım, size nasıl yardımcı olabilirim?',
            'Bu konuda size yardımcı olmaktan memnuniyet duyarım.',
            'Lütfen daha fazla detay paylaşabilir misiniz?',
            'Size en iyi şekilde yardımcı olmak için buradayım.',
            'Bu sorunun cevabını araştırmam gerekecek.',
            'İlginç bir soru, düşünelim...',
            'Size en uygun çözümü bulmaya çalışayım.',
            'Bu konuda uzman ekibimize danışmam gerekebilir.'
        ];
        
        return {
            content: responses[Math.floor(Math.random() * responses.length)],
            metadata: { demo: true }
        };
    };

    handleSendMessage = async () => {
        const trimmedInput = this.state.inputValue.trim();
        if (!trimmedInput || this.state.isLoading) return;

        // Kullanıcı mesajını ekle
        const userMessage = {
            id: this.generateId(),
            type: 'user',
            content: trimmedInput,
            timestamp: new Date()
        };

        this.setState(prevState => ({
            messages: [...prevState.messages, userMessage],
            inputValue: '',
            isLoading: true,
            error: null,
            isTyping: true
        }));

        try {
            // API'ye mesaj gönder
            const response = await this.sendMessageToAPI(trimmedInput);
            
            // Bot yanıtını ekle
            const botMessage = {
                id: this.generateId(),
                type: 'bot',
                content: response.content,
                metadata: response.metadata,
                timestamp: new Date()
            };

            this.setState(prevState => ({
                messages: [...prevState.messages, botMessage],
                isTyping: false,
                isLoading: false
            }));
            
        } catch (error) {
            this.setState({
                error: 'Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.',
                isTyping: false,
                isLoading: false
            });
        }
    };

    handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSendMessage();
        }
    };

    handleInputChange = (e) => {
        this.setState({ inputValue: e.target.value });
    };

    clearChat = () => {
        this.setState({ 
            messages: [],
            error: null 
        }, () => {
            this.initializeChatbot();
        });
    };

    renderMessages = () => {
        return this.state.messages.map((message) => (
            React.createElement('div', {
                key: message.id,
                className: `message ${message.type}`
            }, [
                React.createElement('div', {
                    key: 'avatar',
                    className: 'message-avatar'
                }, [
                    React.createElement('i', {
                        key: 'icon',
                        className: `fas ${message.type === 'bot' ? 'fa-robot' : 'fa-user'}`
                    })
                ]),
                React.createElement('div', {
                    key: 'content',
                    className: 'message-content'
                }, message.content)
            ])
        ));
    };

    renderTypingIndicator = () => {
        if (!this.state.isTyping) return null;
        
        return React.createElement('div', {
            className: 'message bot'
        }, [
            React.createElement('div', {
                key: 'avatar',
                className: 'message-avatar'
            }, [
                React.createElement('i', {
                    key: 'icon',
                    className: 'fas fa-robot'
                })
            ]),
            React.createElement('div', {
                key: 'typing',
                className: 'typing-indicator'
            }, [
                React.createElement('div', { key: 'dot1', className: 'typing-dot' }),
                React.createElement('div', { key: 'dot2', className: 'typing-dot' }),
                React.createElement('div', { key: 'dot3', className: 'typing-dot' })
            ])
        ]);
    };

    renderError = () => {
        if (!this.state.error) return null;
        
        return React.createElement('div', {
            key: 'error',
            className: 'error-message'
        }, this.state.error);
    };

    render() {
        return React.createElement('div', {
            className: 'chatbot-container'
        }, [
            // Header
            React.createElement('div', {
                key: 'header',
                className: 'chat-header'
            }, [
                React.createElement('div', {
                    key: 'icon',
                    className: 'chat-header-icon'
                }, [
                    React.createElement('i', {
                        key: 'robot',
                        className: 'fas fa-robot'
                    })
                ]),
                React.createElement('div', {
                    key: 'titles'
                }, [
                    React.createElement('div', {
                        key: 'title',
                        className: 'chat-header-title'
                    }, 'Argetek AI Asistan'),
                    React.createElement('div', {
                        key: 'subtitle',
                        className: 'chat-header-subtitle'
                    }, 'Size nasıl yardımcı olabilirim?')
                ])
            ]),

            // Messages Area
            React.createElement('div', {
                key: 'messages',
                className: 'chat-messages'
            }, [
                ...this.renderMessages(),
                this.renderTypingIndicator(),
                React.createElement('div', {
                    key: 'end-ref',
                    ref: this.messagesEndRef
                })
            ]),

            // Input Area
            React.createElement('div', {
                key: 'input-container',
                className: 'chat-input-container'
            }, [
                this.renderError(),
                React.createElement('div', {
                    key: 'input-wrapper',
                    className: 'chat-input-wrapper'
                }, [
                    React.createElement('textarea', {
                        key: 'input',
                        ref: this.inputRef,
                        className: 'chat-input',
                        placeholder: 'Mesajınızı yazın...',
                        value: this.state.inputValue,
                        onChange: this.handleInputChange,
                        onKeyPress: this.handleKeyPress,
                        disabled: this.state.isLoading,
                        rows: 1
                    }),
                    React.createElement('button', {
                        key: 'send',
                        className: 'send-button',
                        onClick: this.handleSendMessage,
                        disabled: !this.state.inputValue.trim() || this.state.isLoading
                    }, [
                        React.createElement('i', {
                            key: 'icon',
                            className: 'fas fa-paper-plane'
                        })
                    ])
                ])
            ])
        ]);
    }
}

// Chatbot'u global olarak tanımla
window.ArgetekChatbot = ArgetekChatbot;