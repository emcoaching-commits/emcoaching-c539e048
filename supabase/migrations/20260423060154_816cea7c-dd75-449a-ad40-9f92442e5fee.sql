-- Date de naissance pour les profils
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date date;

-- Image de fond pour chaque formule
ALTER TABLE public.pricing_plans ADD COLUMN IF NOT EXISTS background_image_url text;

-- Avis "mis en avant" sur la page d'accueil
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- Permettre aux admins de créer / supprimer des formules
CREATE POLICY "Admins can insert pricing plans"
ON public.pricing_plans FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pricing plans"
ON public.pricing_plans FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Bucket public pour les images de fond des formules
INSERT INTO storage.buckets (id, name, public)
VALUES ('pricing-backgrounds', 'pricing-backgrounds', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read pricing backgrounds"
ON storage.objects FOR SELECT
USING (bucket_id = 'pricing-backgrounds');

CREATE POLICY "Admins can upload pricing backgrounds"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pricing-backgrounds' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update pricing backgrounds"
ON storage.objects FOR UPDATE
USING (bucket_id = 'pricing-backgrounds' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pricing backgrounds"
ON storage.objects FOR DELETE
USING (bucket_id = 'pricing-backgrounds' AND has_role(auth.uid(), 'admin'::app_role));