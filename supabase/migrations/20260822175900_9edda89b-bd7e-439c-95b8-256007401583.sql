ALTER TABLE public.deliveries
  ADD COLUMN IF NOT EXISTS claimed_by text,
  ADD COLUMN IF NOT EXISTS lease_until timestamptz;

CREATE INDEX IF NOT EXISTS deliveries_claim_idx
  ON public.deliveries (status, next_attempt_at, created_at);

CREATE OR REPLACE FUNCTION public.claim_delivery(
  _delivery_id uuid,
  _claimed_by text,
  _lease_seconds integer
)
RETURNS TABLE (
  id uuid,
  player_id uuid,
  delivery_type delivery_type,
  payload jsonb,
  attempts integer,
  claimed_by text,
  lease_until timestamptz,
  outcome text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.deliveries%ROWTYPE;
  _exists boolean;
BEGIN
  UPDATE public.deliveries d
     SET status = 'PROCESSING'::delivery_status,
         claimed_by = _claimed_by,
         lease_until = now() + make_interval(secs => _lease_seconds),
         updated_at = now()
   WHERE d.id = _delivery_id
     AND (
       (d.status = 'PENDING'::delivery_status
         AND (d.next_attempt_at IS NULL OR d.next_attempt_at <= now()))
       OR (d.status = 'PROCESSING'::delivery_status
         AND (d.lease_until IS NULL OR d.lease_until <= now()))
     )
  RETURNING d.* INTO _row;

  IF FOUND THEN
    RETURN QUERY SELECT _row.id, _row.player_id, _row.delivery_type, _row.payload,
                        _row.attempts, _row.claimed_by, _row.lease_until, 'CLAIMED'::text;
    RETURN;
  END IF;

  SELECT EXISTS (SELECT 1 FROM public.deliveries d WHERE d.id = _delivery_id) INTO _exists;

  IF NOT _exists THEN
    RETURN QUERY SELECT NULL::uuid, NULL::uuid, NULL::delivery_type, NULL::jsonb,
                        NULL::integer, NULL::text, NULL::timestamptz, 'NOT_FOUND'::text;
  ELSE
    RETURN QUERY SELECT NULL::uuid, NULL::uuid, NULL::delivery_type, NULL::jsonb,
                        NULL::integer, NULL::text, NULL::timestamptz, 'ALREADY_CLAIMED'::text;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_delivery(uuid, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_delivery(uuid, text, integer) TO service_role;