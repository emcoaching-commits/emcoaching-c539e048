
-- Drop the overly permissive avatar SELECT policy
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Check and drop any SELECT policy on avatars bucket that uses bucket_id = 'avatars' without user check
-- Create owner-scoped SELECT policy
CREATE POLICY "Users can view own avatar"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Allow admins to view all avatars
CREATE POLICY "Admins can view all avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars' AND public.has_role(auth.uid(), 'admin'::public.app_role));
