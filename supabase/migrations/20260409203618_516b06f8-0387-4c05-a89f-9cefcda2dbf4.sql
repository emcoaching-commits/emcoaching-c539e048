-- Function to sync time slot availability based on bookings
CREATE OR REPLACE FUNCTION public.sync_slot_availability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- On INSERT or UPDATE: mark new slot as unavailable if booking is active
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Mark the new time_slot as unavailable if status is active
    IF NEW.status IN ('confirmed', 'reschedule_pending') THEN
      UPDATE time_slots SET is_available = false WHERE id = NEW.time_slot_id;
    END IF;

    -- If status changed to cancelled, free the slot
    IF NEW.status = 'cancelled' THEN
      UPDATE time_slots SET is_available = true WHERE id = NEW.time_slot_id;
    END IF;

    -- If time_slot_id changed (reschedule), free the old slot
    IF TG_OP = 'UPDATE' AND OLD.time_slot_id IS DISTINCT FROM NEW.time_slot_id THEN
      -- Only free old slot if no other active booking references it
      IF NOT EXISTS (
        SELECT 1 FROM bookings 
        WHERE time_slot_id = OLD.time_slot_id 
        AND id != NEW.id 
        AND status IN ('confirmed', 'reschedule_pending')
      ) THEN
        UPDATE time_slots SET is_available = true WHERE id = OLD.time_slot_id;
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  -- On DELETE: free the slot
  IF TG_OP = 'DELETE' THEN
    IF NOT EXISTS (
      SELECT 1 FROM bookings 
      WHERE time_slot_id = OLD.time_slot_id 
      AND id != OLD.id 
      AND status IN ('confirmed', 'reschedule_pending')
    ) THEN
      UPDATE time_slots SET is_available = true WHERE id = OLD.time_slot_id;
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- Create trigger on bookings table
CREATE TRIGGER sync_slot_on_booking_change
AFTER INSERT OR UPDATE OR DELETE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.sync_slot_availability();

-- Backfill: fix all currently mismatched slots
-- Mark slots with active bookings as unavailable
UPDATE time_slots SET is_available = false
WHERE id IN (
  SELECT DISTINCT time_slot_id FROM bookings WHERE status IN ('confirmed', 'reschedule_pending')
) AND is_available = true;

-- Mark slots without active bookings as available (only if they were booked before)
UPDATE time_slots SET is_available = true
WHERE id NOT IN (
  SELECT DISTINCT time_slot_id FROM bookings WHERE status IN ('confirmed', 'reschedule_pending')
) AND is_available = false;