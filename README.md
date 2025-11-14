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
