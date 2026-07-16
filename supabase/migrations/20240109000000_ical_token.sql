-- Run in Supabase SQL editor: Database → SQL Editor
-- Adds a per-tenant secret token to gate the public iCal subscription feed
-- (previously /api/cal/[tenantSlug] had no auth at all — anyone who knew or
-- guessed the tenant's public booking slug could read every customer's name,
-- email, and phone number from the feed).

alter table tenants
  add column if not exists ical_token uuid not null default gen_random_uuid();
