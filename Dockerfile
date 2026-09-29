# ── Aşama 1: Build ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# ÖNEMLİ: Build aşamasında development olmalı!
# tsc ve tsx devDependencies'ten gelir, production'da yüklenmez.
ENV NODE_ENV=development

COPY package*.json ./
RUN npm ci

COPY . .

# TypeScript (backend) + esbuild (frontend app + admin) derleme
RUN npm run build

# ── Aşama 2: Production Image ──────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Güvenlik: root olmayan kullanıcı
RUN addgroup -S pdks && adduser -S pdks -G pdks

# Builder aşamasından sadece gerekli dosyaları kopyala
COPY --from=builder /app/dist       ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/start.mjs  ./start.mjs

# dist/public: frontend statik dosyalar (zaten dist içinde — build.ts kopyalıyor)
# Yükleme klasörü — volume ile kalıcı hale getirilebilir
# Yükleme ve log klasörleri — pdks kullanıcısı yazabilmeli
RUN mkdir -p uploads logs && chown -R pdks:pdks uploads logs dist

USER pdks

EXPOSE 3005

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3005/api/v1/health || exit 1

# start.mjs: önce migration çalıştırır, sonra sunucuyu başlatır
CMD ["node", "start.mjs"]
