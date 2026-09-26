-- SuperAdmin tablosu — şirket bağımsız, tüm sistemi yönetir
-- Migration: 005_superadmin.sql

CREATE TABLE IF NOT EXISTS superadmins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(100) NOT NULL,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_superadmins_username ON superadmins(username);
