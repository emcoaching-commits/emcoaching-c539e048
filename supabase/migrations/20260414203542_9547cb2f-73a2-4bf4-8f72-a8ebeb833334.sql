
-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  price TEXT NOT NULL,
  subtitle TEXT,
  intro TEXT,
  includes TEXT[] DEFAULT '{}',
  details TEXT[] DEFAULT '{}',
  image_url TEXT,
  icon TEXT DEFAULT 'Dumbbell',
  description TEXT,
  is_popular BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Anyone can view
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);

-- Admins can manage
CREATE POLICY "Admins can insert services" ON public.services FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update services" ON public.services FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete services" ON public.services FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for service images
INSERT INTO storage.buckets (id, name, public) VALUES ('services', 'services', true);

CREATE POLICY "Service images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'services');
CREATE POLICY "Admins can upload service images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'services' AND public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update service images" ON storage.objects FOR UPDATE USING (bucket_id = 'services' AND public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete service images" ON storage.objects FOR DELETE USING (bucket_id = 'services' AND public.has_role(auth.uid(), 'admin'::app_role));
