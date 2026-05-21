
CREATE TABLE IF NOT EXISTS public.profile_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS profile_visits_created_at_idx ON public.profile_visits(created_at);
ALTER TABLE public.profile_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can log own visits" ON public.profile_visits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view visits" ON public.profile_visits
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));
