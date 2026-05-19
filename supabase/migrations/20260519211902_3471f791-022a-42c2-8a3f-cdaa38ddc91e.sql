-- 1) WITH CHECK manquants : empêche le changement de propriétaire en UPDATE
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can update own questionnaire" ON public.questionnaire_responses;
CREATE POLICY "Users can update own questionnaire"
ON public.questionnaire_responses FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2) Protection des messages : empêche modification de content/sender/receiver/date
CREATE OR REPLACE FUNCTION public.protect_message_immutable_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.content     IS DISTINCT FROM OLD.content     THEN RAISE EXCEPTION 'Cannot modify message content'; END IF;
  IF NEW.sender_id   IS DISTINCT FROM OLD.sender_id   THEN RAISE EXCEPTION 'Cannot modify message sender'; END IF;
  IF NEW.receiver_id IS DISTINCT FROM OLD.receiver_id THEN RAISE EXCEPTION 'Cannot modify message receiver'; END IF;
  IF NEW.created_at  IS DISTINCT FROM OLD.created_at  THEN RAISE EXCEPTION 'Cannot modify message timestamp'; END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.protect_message_immutable_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS messages_protect_immutable ON public.messages;
CREATE TRIGGER messages_protect_immutable
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.protect_message_immutable_fields();

-- WITH CHECK sur la policy de marquage lu
DROP POLICY IF EXISTS "Users can mark messages as read" ON public.messages;
CREATE POLICY "Users can mark messages as read"
ON public.messages FOR UPDATE
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);

-- 3) Restreindre get_review_author aux auteurs d'avis approuvés uniquement
CREATE OR REPLACE FUNCTION public.get_review_author(_user_id uuid)
RETURNS TABLE (full_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.full_name, p.avatar_url
  FROM public.profiles p
  WHERE p.user_id = _user_id
    AND EXISTS (
      SELECT 1 FROM public.reviews r
      WHERE r.user_id = _user_id AND r.is_approved = true
    )
  LIMIT 1;
$$;

-- 4) get_admin_id : réservé aux admins
REVOKE EXECUTE ON FUNCTION public.get_admin_id() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_id() TO authenticated;

-- En complément, on protège côté fonction : retourne NULL si appelant non admin.
CREATE OR REPLACE FUNCTION public.get_admin_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.user_roles
  WHERE role = 'admin'
    AND has_role(auth.uid(), 'admin'::app_role)
  LIMIT 1
$$;

-- 5) Contraintes serveur sur la longueur des champs texte sensibles (anti-abus)
ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_content_length_chk,
  ADD CONSTRAINT messages_content_length_chk CHECK (char_length(content) BETWEEN 1 AND 5000);

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_comment_length_chk,
  ADD CONSTRAINT reviews_comment_length_chk CHECK (comment IS NULL OR char_length(comment) <= 2000);

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_rating_range_chk,
  ADD CONSTRAINT reviews_rating_range_chk CHECK (rating BETWEEN 1 AND 5);

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_full_name_length_chk,
  ADD CONSTRAINT profiles_full_name_length_chk CHECK (full_name IS NULL OR char_length(full_name) <= 100);

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_phone_length_chk,
  ADD CONSTRAINT profiles_phone_length_chk CHECK (phone IS NULL OR char_length(phone) <= 30);

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_city_length_chk,
  ADD CONSTRAINT profiles_city_length_chk CHECK (city IS NULL OR char_length(city) <= 100);