
-- Create appointment types table
CREATE TABLE public.appointment_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view appointment types" ON public.appointment_types FOR SELECT USING (true);
CREATE POLICY "Admins can insert appointment types" ON public.appointment_types FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update appointment types" ON public.appointment_types FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete appointment types" ON public.appointment_types FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Add appointment_type_id to time_slots
ALTER TABLE public.time_slots ADD COLUMN appointment_type_id UUID REFERENCES public.appointment_types(id) ON DELETE SET NULL;
