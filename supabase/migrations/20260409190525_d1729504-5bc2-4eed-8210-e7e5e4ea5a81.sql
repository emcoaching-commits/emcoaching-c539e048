
-- 1. Fix bookings UPDATE policy: restrict to only cancelling
DROP POLICY IF EXISTS "Users can cancel own bookings" ON public.bookings;
CREATE POLICY "Users can cancel own bookings" ON public.bookings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status = 'cancelled');

-- 2. Make avatars bucket private
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

-- 3. Remove realtime publication for sensitive tables
ALTER PUBLICATION supabase_realtime DROP TABLE public.messages;
ALTER PUBLICATION supabase_realtime DROP TABLE public.notifications;
