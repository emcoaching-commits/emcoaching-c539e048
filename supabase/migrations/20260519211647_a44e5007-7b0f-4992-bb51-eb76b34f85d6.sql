DROP VIEW IF EXISTS public.public_reviews;

CREATE VIEW public.public_reviews
WITH (security_invoker = true) AS
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

-- Réintroduire une politique SELECT minimale sur reviews pour que la vue puisse lire les lignes approuvées,
-- mais on n'expose AUCUNE colonne supplémentaire car les apps clientes utiliseront uniquement public_reviews.
CREATE POLICY "Approved reviews readable for view"
ON public.reviews
FOR SELECT
TO anon, authenticated
USING (is_approved = true);