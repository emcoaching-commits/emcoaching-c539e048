ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS assigned_plan_id uuid REFERENCES public.pricing_plans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subscription_activated_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS welcome_popup_dismissed boolean NOT NULL DEFAULT false;