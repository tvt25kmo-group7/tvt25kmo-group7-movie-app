-- Fixes drift on databases created before refresh tokens existed (schema.sql's
-- CREATE TABLE IF NOT EXISTS is a no-op on tables that already exist).
ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token TEXT;
