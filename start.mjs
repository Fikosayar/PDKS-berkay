#!/usr/bin/env node
/**
 * start.mjs — Production başlatıcı
 * 1. Migration'ları çalıştır (idempotent)
 * 2. Seed çalıştır (idempotent — zaten var olanları atlar)
 * 3. Sunucuyu başlat
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const run = (label, cmd) => {
  console.log(`▶ ${label}...`);
  try {
    execSync(cmd, { cwd: __dirname, stdio: 'inherit', env: process.env });
    console.log(`✓ ${label} tamamlandı.`);
  } catch (err) {
    console.error(`✗ ${label} hatası:`, err.message ?? err);
    process.exit(1);
  }
};

// ── 1. Migration ──────────────────────────────────────────────
run("Migration'lar uygulanıyor", 'node dist/db/migrate.js');

// ── 2. Seed (idempotent — var olanları atlar) ─────────────────
run('Seed verileri kontrol ediliyor', 'node dist/db/seed.js');

// ── 3. Sunucu ─────────────────────────────────────────────────
console.log('▶ Sunucu başlatılıyor...');
await import('./dist/server.js');
