
-- 1. Sécuriser site_settings : seules quelques clés publiques restent lisibles
DROP POLICY IF EXISTS "Anyone can read settings" ON public.site_settings;

CREATE POLICY "Anyone can read public settings"
ON public.site_settings
FOR SELECT
USING (key IN (
  'favicon_url',
  'site_logo',
  'max_users',
  'home_marketing_title',
  'home_marketing_subtitle',
  'home_marketing_highlights',
  'home_pricing_title',
  'home_pricing_subtitle'
));

CREATE POLICY "Authenticated can read all settings"
ON public.site_settings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Sécuriser custom_links : admin uniquement
DROP POLICY IF EXISTS "Anyone can view custom links" ON public.custom_links;

CREATE POLICY "Admins can view custom links"
ON public.custom_links
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Verrouiller user_roles : empêcher tout client de créer un rôle pour autrui
-- (la policy admin existe déjà ; on s'assure qu'aucun rôle ne peut s'auto-assigner)
-- Déjà OK : INSERT requiert has_role admin. Pas de changement nécessaire.
