
-- Update handle_new_user to also save phone from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

-- Add unique constraint on user_id for questionnaire_responses to enable upsert
ALTER TABLE public.questionnaire_responses
ADD CONSTRAINT questionnaire_responses_user_id_key UNIQUE (user_id);
