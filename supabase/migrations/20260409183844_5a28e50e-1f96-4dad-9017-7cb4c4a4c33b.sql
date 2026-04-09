
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  client_name TEXT,
  client_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notifications"
ON public.notifications FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update notifications"
ON public.notifications FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Trigger: new user signup
CREATE OR REPLACE FUNCTION public.notify_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (type, content, client_name, client_id)
  VALUES ('inscription', 'Nouveau client inscrit : ' || COALESCE(NEW.full_name, 'Sans nom'), NEW.full_name, NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_profile
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_user();

-- Trigger: profile update
CREATE OR REPLACE FUNCTION public.notify_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.full_name IS DISTINCT FROM NEW.full_name
     OR OLD.phone IS DISTINCT FROM NEW.phone
     OR OLD.weight IS DISTINCT FROM NEW.weight
     OR OLD.height IS DISTINCT FROM NEW.height
     OR OLD.avatar_url IS DISTINCT FROM NEW.avatar_url
  THEN
    INSERT INTO public.notifications (type, content, client_name, client_id)
    VALUES ('profil_update', COALESCE(NEW.full_name, 'Un client') || ' a mis à jour son profil', NEW.full_name, NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_update
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.notify_profile_update();

-- Trigger: new message from client
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_name TEXT;
  is_admin BOOLEAN;
BEGIN
  SELECT has_role(NEW.sender_id, 'admin'::app_role) INTO is_admin;
  IF is_admin THEN RETURN NEW; END IF;
  
  SELECT full_name INTO sender_name FROM public.profiles WHERE user_id = NEW.sender_id LIMIT 1;
  INSERT INTO public.notifications (type, content, client_name, client_id)
  VALUES ('message', COALESCE(sender_name, 'Un client') || ' a envoyé un message', sender_name, NEW.sender_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_message();

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
