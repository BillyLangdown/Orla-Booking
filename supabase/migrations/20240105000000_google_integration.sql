-- Google OAuth: Calendar sync + Gmail read for Orla

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS google_access_token        TEXT,
  ADD COLUMN IF NOT EXISTS google_refresh_token        TEXT,
  ADD COLUMN IF NOT EXISTS google_token_expiry         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS google_connected_email      TEXT,
  ADD COLUMN IF NOT EXISTS google_calendar_connected   BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS google_event_id TEXT;
