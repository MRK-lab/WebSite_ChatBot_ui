# -------------------------------
# 1) BUILD STAGE — React (Vite)
# -------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Bağımlılık dosyalarını önce kopyala (cache için önemli)
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.* ./

# Bağımlılıkları yükle
RUN npm ci --legacy-peer-deps

# Uygulama kaynakları
COPY . .

# Build al
RUN npm run build



# -------------------------------
# 2) RUNTIME STAGE — Nginx
# -------------------------------
FROM nginx:stable-alpine

# Build edilen Vite çıktısını nginx html klasörüne kopyala
COPY --from=build /app/dist /usr/share/nginx/html

# Logları container stdout/stderr'a yönlendir
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
 && ln -sf /dev/stderr /var/log/nginx/error.log

# Port
EXPOSE 80

# Nginx başlat
CMD ["nginx", "-g", "daemon off;"]
