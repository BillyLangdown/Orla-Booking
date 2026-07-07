-- Updates get_my_bookings RPC to include open-book fields.
-- DROP first because PostgreSQL won't let you change a function's return type in place.
-- If your schema uses a different tenant-user join, adjust the WHERE clause accordingly.

DROP FUNCTION IF EXISTS public.get_my_bookings();

CREATE FUNCTION public.get_my_bookings()
RETURNS TABLE (
  id uuid,
  tenant_id uuid,
  slot_id uuid,
  name text,
  email text,
  phone text,
  notes text,
  session_type text,
  created_at timestamptz,
  status text,
  amount_paid integer,
  stripe_payment_intent_id text,
  start_time timestamptz,
  end_time timestamptz,
  google_event_id text,
  proposed_date text,
  proposed_time text,
  chat_summary text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    b.id,
    b.tenant_id,
    b.slot_id,
    b.customer_name   AS name,
    b.customer_email  AS email,
    b.customer_phone  AS phone,
    b.notes,
    b.session_type,
    b.created_at,
    b.status,
    b.amount_paid,
    b.stripe_payment_intent_id,
    b.start_time,
    b.end_time,
    b.google_event_id,
    b.proposed_date,
    b.proposed_time,
    b.chat_summary
  FROM bookings b
  WHERE b.tenant_id = get_my_tenant_id()
  ORDER BY b.created_at DESC;
$$;
