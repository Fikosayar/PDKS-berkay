-- API istek logları tablosu
-- Migration: 006_api_logs.sql

CREATE TABLE IF NOT EXISTS api_logs (
  id            BIGSERIAL PRIMARY KEY,
  method        VARCHAR(10) NOT NULL,
  uri           TEXT NOT NULL,
  query_params  TEXT,
  body          TEXT,
  response_code SMALLINT,
  duration_ms   INT,
  ip_address    VARCHAR(45),
  user_agent    VARCHAR(200),
  company_id    UUID REFERENCES companies(id) ON DELETE SET NULL,
  user_id       UUID,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Eski kayıtları otomatik temizle (30 günden eski)
CREATE INDEX IF NOT EXISTS idx_api_logs_created ON api_logs(created_at);
