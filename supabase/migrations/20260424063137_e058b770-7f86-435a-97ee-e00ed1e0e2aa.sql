CREATE TABLE public.pricing_plan_media (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pricing_plan_id uuid NOT NULL REFERENCES public.pricing_plans(id) ON DELETE CASCADE,
  url text NOT NULL,
  type text NOT NULL DEFAULT 'image',
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_plan_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pricing plan media"
  ON public.pricing_plan_media FOR SELECT USING (true);

CREATE POLICY "Admins can insert pricing plan media"
  ON public.pricing_plan_media FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update pricing plan media"
  ON public.pricing_plan_media FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pricing plan media"
  ON public.pricing_plan_media FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_pricing_plan_media_plan ON public.pricing_plan_media(pricing_plan_id, position);