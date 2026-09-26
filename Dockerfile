# ── Aşama 1: Build ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Bağımlılıkları kopyala ve yükle
COPY package*.json ./
RUN npm ci

# Kaynak kodları kopyala
COPY . .

# Backend TypeScript + Frontend (app + admin) build
RUN npm run build

# ── Aşama 2: Production ────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Güvenlik: root olmayan kullanıcı
RUN addgroup -S pdks && adduser -S pdks -G pdks

# Sadece gerekli dosyaları kopyala
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Yükleme klasörü (avatar, ek dosyalar) — container yeniden başlayınca silinmemesi için volume bağlanmalı
RUN mkdir -p uploads && chown pdks:pdks uploads && chown -R pdks:pdks dist

USER pdks

EXPOSE 3005

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3005/api/v1/health || exit 1

# start.mjs: önce migration çalıştır, sonra sunucuyu başlat
COPY --from=builder /app/start.mjs ./start.mjs

CMD ["node", "start.mjs"]
