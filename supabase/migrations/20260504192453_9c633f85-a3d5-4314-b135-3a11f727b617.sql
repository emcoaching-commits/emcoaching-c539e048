DROP POLICY IF EXISTS "Anyone can read public settings" ON public.site_settings;
CREATE POLICY "Anyone can read public settings"
ON public.site_settings
FOR SELECT
USING (true);