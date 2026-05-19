-- 1) site_settings : restreindre la lecture publique aux clés non-sensibles
DROP POLICY IF EXISTS "Anyone can read public settings" ON public.site_settings;

CREATE POLICY "Public can read non-sensitive settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (
  key NOT LIKE 'google_calendar_%'
  AND key NOT LIKE '%_secret%'
  AND key NOT LIKE '%_token%'
  AND key NOT LIKE '%_private%'
  AND key NOT LIKE '%_api_key%'
);

-- 2) Reviews : créer une vue publique sans user_id, et supprimer l'accès direct anonyme
CREATE OR REPLACE VIEW public.public_reviews
WITH (security_invoker = true) AS
SELECT
  r.id,
  r.rating,
  r.comment,
  r.created_at,
  r.is_featured,
  p.full_name AS author_name,
  p.avatar_url AS author_avatar
FROM public.reviews r
LEFT JOIN public.profiles p ON p.user_id = r.user_id
WHERE r.is_approved = true;

GRANT SELECT ON public.public_reviews TO anon, authenticated;

-- La vue ne respecte pas RLS sur profiles (security_invoker + jointure),
-- on utilise donc une fonction security definer qui retourne uniquement
-- les champs d'affichage des profils — pas d'accès direct à profiles.
DROP VIEW public.public_reviews;

CREATE OR REPLACE FUNCTION public.get_review_author(_user_id uuid)
RETURNS TABLE (full_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT full_name, avatar_url FROM public.profiles WHERE user_id = _user_id LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_review_author(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_review_author(uuid) TO anon, authenticated;

CREATE OR REPLACE VIEW public.public_reviews
WITH (security_invoker = false) AS
SELECT
  r.id,
  r.rating,
  r.comment,
  r.created_at,
  r.is_featured,
  (public.get_review_author(r.user_id)).full_name AS author_name,
  (public.get_review_author(r.user_id)).avatar_url AS author_avatar
FROM public.reviews r
WHERE r.is_approved = true;

GRANT SELECT ON public.public_reviews TO anon, authenticated;

-- Retirer la policy publique sur reviews qui expose user_id
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;

-- 3) Storage : supprimer les policies de listing sur les buckets publics
-- Les fichiers restent accessibles via leur URL publique CDN.
DROP POLICY IF EXISTS "Anyone can view about media files" ON storage.objects;
DROP POLICY IF EXISTS "Service images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public can read pricing backgrounds" ON storage.objects;

-- 4) Révoquer EXECUTE des fonctions trigger internes (anon + authenticated + public)
REVOKE EXECUTE ON FUNCTION public.notify_new_message() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_sync_booking_to_calendar() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_profile_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_slot_availability() FROM PUBLIC, anon, authenticated;

-- has_role et get_admin_id sont utilisés dans les policies RLS,
-- on retire l'exécution à anon mais on garde pour authenticated.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_id() FROM PUBLIC, anon;