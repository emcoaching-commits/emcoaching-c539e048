CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.trigger_sync_booking_to_calendar()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Only sync confirmed bookings
  IF NEW.status = 'confirmed' THEN
    SELECT net.http_post(
      url := 'https://gsjdinlrcbugkngvtpou.supabase.co/functions/v1/sync-booking-to-calendar',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object('booking_id', NEW.id::text)
    ) INTO request_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_booking_to_gcal ON public.bookings;
CREATE TRIGGER sync_booking_to_gcal
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.trigger_sync_booking_to_calendar();