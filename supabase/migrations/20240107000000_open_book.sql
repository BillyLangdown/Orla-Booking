-- Open-book booking mode
-- Run in Supabase SQL editor: Database → SQL Editor

-- Add booking mode, Orla fields, and general availability to tenants
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS booking_mode          TEXT NOT NULL DEFAULT 'slotted',
  ADD COLUMN IF NOT EXISTS orla_business_context TEXT,
  ADD COLUMN IF NOT EXISTS orla_intake_prompt    TEXT,
  ADD COLUMN IF NOT EXISTS general_availability  TEXT;

-- Make slot_id, start_time, end_time nullable so open-book enquiries don't require a slot
ALTER TABLE bookings ALTER COLUMN slot_id     DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN start_time  DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN end_time    DROP NOT NULL;

-- Add open-book fields to bookings
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS proposed_date TEXT,
  ADD COLUMN IF NOT EXISTS proposed_time TEXT,
  ADD COLUMN IF NOT EXISTS chat_summary  TEXT;
