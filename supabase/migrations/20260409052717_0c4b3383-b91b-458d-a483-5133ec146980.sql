
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Questionnaire responses table
CREATE TABLE public.questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  objectifs TEXT,
  niveau TEXT,
  frequence TEXT,
  blessures TEXT,
  commentaire TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own questionnaire" ON public.questionnaire_responses
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own questionnaire" ON public.questionnaire_responses
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own questionnaire" ON public.questionnaire_responses
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all questionnaires" ON public.questionnaire_responses
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage time_slots
CREATE POLICY "Admins can insert time slots" ON public.time_slots
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update time slots" ON public.time_slots
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete time slots" ON public.time_slots
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage reviews
CREATE POLICY "Admins can update reviews" ON public.reviews
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all reviews" ON public.reviews
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings" ON public.bookings
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for questionnaire updated_at
CREATE TRIGGER update_questionnaire_updated_at
BEFORE UPDATE ON public.questionnaire_responses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
