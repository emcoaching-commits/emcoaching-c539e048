
ALTER TABLE public.profiles
ADD COLUMN subscription_start_date DATE DEFAULT NULL,
ADD COLUMN next_payment_date DATE DEFAULT NULL;
