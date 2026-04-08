
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Pricing plans table (managed by admin/Emma)
CREATE TABLE public.pricing_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  sessions_count INTEGER NOT NULL DEFAULT 1,
  is_popular BOOLEAN DEFAULT false,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view pricing plans" ON public.pricing_plans FOR SELECT USING (true);

-- Time slots (planning)
CREATE TABLE public.time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view time slots" ON public.time_slots FOR SELECT USING (true);

-- Bookings
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  time_slot_id UUID NOT NULL REFERENCES public.time_slots(id) ON DELETE CASCADE,
  pricing_plan_id UUID REFERENCES public.pricing_plans(id),
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

-- Reviews
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default pricing plans
INSERT INTO public.pricing_plans (name, description, price, sessions_count, is_popular, features) VALUES
('Découverte', 'Idéal pour commencer', 45, 1, false, ARRAY['1 séance individuelle', 'Bilan initial', 'Programme personnalisé']),
('Essentiel', 'Le plus populaire', 160, 4, true, ARRAY['4 séances individuelles', 'Bilan complet', 'Programme personnalisé', 'Suivi nutritionnel', 'Support WhatsApp']),
('Premium', 'Transformation complète', 280, 8, false, ARRAY['8 séances individuelles', 'Bilan approfondi', 'Programme sur mesure', 'Plan nutritionnel complet', 'Support WhatsApp 7j/7', 'Ajustements illimités']);

-- Insert sample time slots for the next 2 weeks
INSERT INTO public.time_slots (date, start_time, end_time) VALUES
(CURRENT_DATE + 1, '09:00', '10:00'),
(CURRENT_DATE + 1, '10:00', '11:00'),
(CURRENT_DATE + 1, '14:00', '15:00'),
(CURRENT_DATE + 1, '15:00', '16:00'),
(CURRENT_DATE + 2, '09:00', '10:00'),
(CURRENT_DATE + 2, '11:00', '12:00'),
(CURRENT_DATE + 2, '14:00', '15:00'),
(CURRENT_DATE + 3, '10:00', '11:00'),
(CURRENT_DATE + 3, '14:00', '15:00'),
(CURRENT_DATE + 3, '16:00', '17:00'),
(CURRENT_DATE + 4, '09:00', '10:00'),
(CURRENT_DATE + 4, '11:00', '12:00'),
(CURRENT_DATE + 5, '09:00', '10:00'),
(CURRENT_DATE + 5, '10:00', '11:00'),
(CURRENT_DATE + 5, '15:00', '16:00');
