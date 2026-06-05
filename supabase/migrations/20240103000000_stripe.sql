-- Stripe Connect + payment fields

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS stripe_account_id     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_onboarded      BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS payment_mode          TEXT    NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS session_type_prices   JSONB   NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS currency              TEXT    NOT NULL DEFAULT 'gbp';

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS amount_paid               INTEGER;

-- Extend status to include awaiting_payment
-- (no CHECK constraint in original schema so this is safe)
