
-- 1. Notifications pour changements de planning (créneaux)
CREATE OR REPLACE FUNCTION public.notify_time_slot_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  msg TEXT;
  notif_type TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    msg := 'Nouveau créneau ajouté : ' || to_char(NEW.date, 'DD/MM/YYYY') || ' de ' || to_char(NEW.start_time, 'HH24:MI') || ' à ' || to_char(NEW.end_time, 'HH24:MI');
    notif_type := 'planning_add';
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.date IS DISTINCT FROM NEW.date OR OLD.start_time IS DISTINCT FROM NEW.start_time OR OLD.end_time IS DISTINCT FROM NEW.end_time OR OLD.is_available IS DISTINCT FROM NEW.is_available THEN
      msg := 'Créneau modifié : ' || to_char(NEW.date, 'DD/MM/YYYY') || ' ' || to_char(NEW.start_time, 'HH24:MI');
      notif_type := 'planning_update';
    ELSE
      RETURN NEW;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    msg := 'Créneau supprimé : ' || to_char(OLD.date, 'DD/MM/YYYY') || ' ' || to_char(OLD.start_time, 'HH24:MI');
    notif_type := 'planning_delete';
  END IF;

  INSERT INTO public.notifications (type, content, client_name, client_id)
  VALUES (notif_type, msg, NULL, NULL);

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.notify_time_slot_change() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_notify_time_slot_change ON public.time_slots;
CREATE TRIGGER trg_notify_time_slot_change
AFTER INSERT OR UPDATE OR DELETE ON public.time_slots
FOR EACH ROW EXECUTE FUNCTION public.notify_time_slot_change();

-- Permettre INSERT de notifications système (sans client_id) si admin OU via trigger SECURITY DEFINER
-- Le trigger SECURITY DEFINER passe outre RLS, donc rien à modifier.

-- 2. Table des popups d'information
CREATE TABLE IF NOT EXISTS public.info_popups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info | success | warning | new
  cta_label TEXT,
  cta_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT info_popups_title_len CHECK (char_length(title) <= 120),
  CONSTRAINT info_popups_content_len CHECK (char_length(content) <= 1000),
  CONSTRAINT info_popups_type_valid CHECK (type IN ('info','success','warning','new'))
);

ALTER TABLE public.info_popups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active popups"
ON public.info_popups FOR SELECT
TO anon, authenticated
USING (
  is_active = true
  AND (starts_at IS NULL OR starts_at <= now())
  AND (ends_at IS NULL OR ends_at >= now())
);

CREATE POLICY "Admins can view all popups"
ON public.info_popups FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert popups"
ON public.info_popups FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update popups"
ON public.info_popups FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete popups"
ON public.info_popups FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_info_popups_updated_at
BEFORE UPDATE ON public.info_popups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
