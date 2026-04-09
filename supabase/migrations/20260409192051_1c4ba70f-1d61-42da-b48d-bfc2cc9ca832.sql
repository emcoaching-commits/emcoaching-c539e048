
-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete bookings
CREATE POLICY "Admins can delete bookings"
ON public.bookings FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete questionnaire responses
CREATE POLICY "Admins can delete questionnaires"
ON public.questionnaire_responses FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete reviews
CREATE POLICY "Admins can delete reviews"
ON public.reviews FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete messages
CREATE POLICY "Admins can delete messages"
ON public.messages FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
