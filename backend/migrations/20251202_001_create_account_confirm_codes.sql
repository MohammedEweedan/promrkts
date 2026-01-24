BEGIN;

CREATE TABLE IF NOT EXISTS account_confirm_codes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_account_confirm_codes_user_id ON account_confirm_codes (user_id);
CREATE INDEX IF NOT EXISTS idx_account_confirm_codes_code ON account_confirm_codes (code);

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN NOT NULL DEFAULT FALSE;

COMMIT;
