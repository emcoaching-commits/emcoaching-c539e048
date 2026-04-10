-- Table for about section media (photos & videos)
CREATE TABLE public.about_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'image', -- 'image' or 'video'
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.about_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view about media" ON public.about_media FOR SELECT USING (true);
CREATE POLICY "Admins can insert about media" ON public.about_media FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update about media" ON public.about_media FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete about media" ON public.about_media FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage bucket for about media files
INSERT INTO storage.buckets (id, name, public) VALUES ('about-media', 'about-media', true);

CREATE POLICY "Anyone can view about media files" ON storage.objects FOR SELECT USING (bucket_id = 'about-media');
CREATE POLICY "Admins can upload about media files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'about-media' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete about media files" ON storage.objects FOR DELETE USING (bucket_id = 'about-media' AND has_role(auth.uid(), 'admin'::app_role));

-- Default about description in site_settings
INSERT INTO public.site_settings (key, value) VALUES ('about_description', 'Je suis Emma, coach sportive passionnée qui débute son aventure. Mon objectif : t''aider à te dépasser, retrouver confiance en toi et atteindre tes objectifs fitness, que ce soit la perte de poids, la prise de muscle ou simplement te sentir mieux dans ton corps.')
ON CONFLICT (key) DO NOTHING;