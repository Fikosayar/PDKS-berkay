import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL ?? '';

// SSL ayarı: DATABASE_URL'de ?sslmode=disable varsa SSL kapalı,
// yoksa production'da self-signed sertifikaya izin ver.
// Coolify iç ağı gibi SSL olmayan ortamlar için ?sslmode=disable ekleyin.
const sslDisabled =
  dbUrl.includes('sslmode=disable') ||
  dbUrl.includes('ssl=false') ||
  process.env.DB_SSL === 'false';

const ssl = sslDisabled ? false : (
  process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
);

const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Beklenmedik DB hatası:', err);
});

export const db = pool;
