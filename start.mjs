#!/usr/bin/env node
/**
 * start.js — Production başlatıcı
 * 1. Migration'ları çalıştır (idempotent — zaten uygulanmışları atlar)
 * 2. Sunucuyu başlat
 *
 * NOT: Bu dosya dist/ içinde yer alır, TypeScript derlenmez.
 * Dockerfile CMD: ["node", "start.js"]
 */

import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// Migration'ları çalıştır
console.log('▶ Migration\'lar uygulanıyor...');
try {
  const migrateUrl = pathToFileURL(join(__dirname, 'dist/db/migrate.js')).href;
  // migrate.js db.end() çağırdığı için ayrı process olarak çalıştırılıyor
  const { execSync } = await import('child_process');
  execSync('node dist/db/migrate.js', { stdio: 'inherit', cwd: __dirname });
} catch (err) {
  console.error('Migration hatası:', err);
  process.exit(1);
}

// Sunucuyu başlat
console.log('▶ Sunucu başlatılıyor...');
await import('./dist/server.js');
