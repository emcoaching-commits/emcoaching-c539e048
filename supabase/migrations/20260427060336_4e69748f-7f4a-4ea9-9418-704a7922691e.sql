-- Table custom_links pour l'onglet Management
CREATE TABLE public.custom_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  icon TEXT DEFAULT 'Link',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view custom links"
ON public.custom_links FOR SELECT
USING (true);

CREATE POLICY "Admins can insert custom links"
ON public.custom_links FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update custom links"
ON public.custom_links FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete custom links"
ON public.custom_links FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_custom_links_updated_at
BEFORE UPDATE ON public.custom_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Champ pour activer le rappel de paiement côté client
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS payment_reminder_active BOOLEAN NOT NULL DEFAULT false;