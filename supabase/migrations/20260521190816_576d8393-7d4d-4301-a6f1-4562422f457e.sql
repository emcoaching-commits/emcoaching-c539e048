CREATE TABLE public.account_deletion_reasons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deleted_user_id UUID,
  email TEXT,
  full_name TEXT,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.account_deletion_reasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view deletion reasons"
ON public.account_deletion_reasons
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));