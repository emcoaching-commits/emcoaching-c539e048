
-- Add proposed_slot_id for reschedule proposals
ALTER TABLE public.bookings
ADD COLUMN proposed_slot_id uuid REFERENCES public.time_slots(id) DEFAULT NULL;

-- Update the user update policy to also allow accepting/declining reschedules
DROP POLICY IF EXISTS "Users can cancel own bookings" ON public.bookings;
CREATE POLICY "Users can update own bookings"
ON public.bookings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins to update bookings (for proposing reschedules)
CREATE POLICY "Admins can update bookings"
ON public.bookings FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));
