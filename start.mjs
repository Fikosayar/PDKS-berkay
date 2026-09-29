#!/usr/bin/env node
/**
 * start.mjs — Production başlatıcı
 * 1. Migration'ları çalıştır (idempotent — zaten uygulanmışları atlar)
 * 2. Sunucuyu başlat
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── 1. Migration ──────────────────────────────────────────────
console.log('▶ Migration\'lar uygulanıyor...');
try {
  execSync('node dist/db/migrate.js', {
    cwd: __dirname,
    stdio: 'inherit',   // stdout/stderr doğrudan container loguna yaz
    env: process.env,
  });
  console.log('✓ Migration\'lar tamamlandı.');
} catch (err) {
  console.error('✗ Migration hatası:', err.message ?? err);
  process.exit(1);
}

// ── 2. Sunucu ─────────────────────────────────────────────────
console.log('▶ Sunucu başlatılıyor...');
await import('./dist/server.js');
