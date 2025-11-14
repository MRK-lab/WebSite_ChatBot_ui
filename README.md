# Argetek AI Chatbot

Artık proje Vite + React + TypeScript yapısında çalışıyor. Tek index.html dosyası hem tam sayfada hem de iframe içinde aynı arayüzü sunuyor; tüm kod src/ altındaki modüler React bileşenlerinde tutuluyor.

## Teknoloji Yığını

- React 18 + TypeScript
- Vite geliştirme/build pipeline’ı
- Tek giriş noktası: index.html → /src/main.tsx
- UI bileşenleri: src/App.tsx
- Stil dosyaları: src/index.css

## Kurulum & Çalıştırma

`ash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ klasörü oluşturur
npm run preview    # build çıktısını test eder
`

> 
pm run dev komutu host:true ile çalışır; aynı ağdaki cihazlar da erişebilir.

## Yayına Alma / iFrame Kullanımı

Build aldıktan sonra dist/ klasörünü herhangi bir statik sunucuya koymanız yeterli. Ardından sitenizde şu şekilde kullanabilirsiniz:

`html
<iframe
  src="https://alanadiniz.com/chatbot/index.html"
  width="400"
  height="600"
  frameborder="0"
  style="border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.25);overflow:hidden;">
</iframe>
`

Iframe içinde açılan sayfa ile tam sayfa deneyimi aynıdır; responsive yapı sayesinde genişlik/yükseklik değerlerini değiştirebilirsiniz.

## API Entegrasyonu

Varsayılan endpoint yalnızca prompt alanı bekler:

`
POST https://localhost:60026/api/Chat
Content-Type: application/json
accept: */*
Body: { "prompt": "kullanıcı mesajı" }
`

src/App.tsx dosyasındaki API_CONFIG değerini değiştirerek farklı ortamlara yönlendirebilirsiniz. İsteğe bağlı olarak tarayıcı konsolundan window.API_KEY = 'Bearer xxx' yazarak Authorization başlığını otomatik ekleyebilirsiniz.

Yanıt işlemesi:
- 	ext/plain → doğrudan kullanıcıya gösterilir.
- pplication/json → 
esponse, message, content, 
esult, 	ext alanlarından ilki seçilir; hiçbiri yoksa JSON string’i olduğu gibi yazdırılır.

## Hata Yönetimi

API çağrısı başarısız olursa kullanıcı mesajı listede kalır, bot mesajı eklenmez ve ekranda “Mesaj gönderilirken bir hata oluştu…” uyarısı görünür. Demo cevapları sadece API dönüşü başarılı olduğunda ancak içerik boş gelirse devreye girer.

## Notlar

- Sertifika uyarıları: https://localhost gibi self-signed sertifikalar kullanıyorsanız tarayıcıda bir kez “güven” vermeniz gerekir.
- Kod ayrımı: Yeni yapıda ek bileşenler veya hook’lar eklemek kolaydır; src/ altında ihtiyaçlara göre klasörleyebilirsiniz.
- Test/format: TypeScript + Vite yapısı Jest/vitest, ESLint vb. araçları kolayca ekleyebilmenizi sağlar.



Docker-Compose.yml:

version: '3.9'

services:
  frontend:
    build: ./frontend
    container_name: demo_frontend
    environment:
      - VITE_API_BASE_URL=http://backend:8080
    ports:
      - "3000:80"
    depends_on:
      - backend

  backend:
    build: ./backend
    container_name: demo_backend
    environment:
      - ASPNETCORE_URLS=http://+:8080
      - ConnectionStrings__Default=Host=db;Port=5432;Database=chatbotdb;Username=postgres;Password=postgres;
    # - VLLM_URL=http://vllm:8000/v1/chat/completions # cpu desteği olmadığı için
      - VLLM_URL=http://177.177.0.234:8000/v1/chat/completions
      - VLLM_MODEL=Qwen/Qwen2.5-1.5B-Instruct
    ports:
      - "5000:8080"
    depends_on:
      - db

  db:
    image: postgres:16
    container_name: demo_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: chatbotdb
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"   # opsiyonel, ister kaldır
      
      
  # bu hali cpu da çalışmıyor. bunun için kurulu olan vlli kullanacaız
  # vllm:
    # image: vllm/vllm-openai:latest
    # container_name: demo_vllm
    # command: --model /models/qwen2.5-1.5b-instruct --port 8000 --host 0.0.0.0 --device cpu
    # environment:
      # - VLLM_USE_MODELSCOPE_HUB=1
      # - VLLM_LOGGING_LEVEL=DEBUG
    # volumes:
      # - ./models:/models
    # ports:
      # - "8000:8000"

volumes:
  db_data:
