-- Şirketlere vergi numarası ve iletişim bilgileri ekle
-- Migration: 004_tax_number.sql

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS tax_number     VARCHAR(20),
  ADD COLUMN IF NOT EXISTS phone          VARCHAR(20),
  ADD COLUMN IF NOT EXISTS address        TEXT,
  ADD COLUMN IF NOT EXISTS contact_email  VARCHAR(150);

-- Vergi numarası unique olmalı (NULL satırlar unique kısıtını atlar — doğru davranış)
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_tax
  ON companies(tax_number)
  WHERE tax_number IS NOT NULL;
