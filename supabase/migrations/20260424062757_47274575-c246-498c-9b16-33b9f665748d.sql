ALTER TABLE public.pricing_plans
  ADD COLUMN IF NOT EXISTS long_description text,
  ADD COLUMN IF NOT EXISTS includes text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS details text[] DEFAULT '{}'::text[];