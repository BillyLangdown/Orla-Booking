-- Run this once in your Supabase SQL editor (Database → SQL Editor)

-- Atomically claims a slot: increments booked only when booked < capacity.
-- Returns true if the claim succeeded, false if the slot was already full.
CREATE OR REPLACE FUNCTION public.claim_slot(p_slot_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rows_updated integer;
BEGIN
  UPDATE availability_slots
  SET booked = booked + 1
  WHERE id = p_slot_id AND booked < capacity;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated > 0;
END;
$$;

-- Releases a previously claimed slot (used on booking insert failure).
CREATE OR REPLACE FUNCTION public.release_slot(p_slot_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE availability_slots
  SET booked = GREATEST(booked - 1, 0)
  WHERE id = p_slot_id;
END;
$$;
