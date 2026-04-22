-- Allow admins to update pricing_plans (including paypal_url)
CREATE POLICY "Admins can update pricing plans"
ON public.pricing_plans
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));