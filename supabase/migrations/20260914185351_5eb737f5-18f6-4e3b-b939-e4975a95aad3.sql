ALTER TABLE public.cashfree_orders DROP CONSTRAINT IF EXISTS cashfree_orders_amount_inr_check;
ALTER TABLE public.cashfree_orders ADD CONSTRAINT cashfree_orders_amount_inr_positive CHECK (amount_inr > 0 AND amount_inr <= 100000);
ALTER TABLE public.cashfree_orders ADD COLUMN access_months integer NOT NULL DEFAULT 3 CHECK (access_months BETWEEN 1 AND 24);

CREATE TABLE public.app_settings (
  id text PRIMARY KEY DEFAULT 'primary' CHECK (id = 'primary'),
  offer_price_inr numeric(10,2) NOT NULL DEFAULT 300.00 CHECK (offer_price_inr > 0 AND offer_price_inr <= 100000),
  access_months integer NOT NULL DEFAULT 3 CHECK (access_months BETWEEN 1 AND 24),
  whatsapp_group_url text NOT NULL CHECK (whatsapp_group_url ~ '^https://chat\.whatsapp\.com/[A-Za-z0-9_-]+$'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.app_settings (id, offer_price_inr, access_months, whatsapp_group_url)
VALUES ('primary', 300.00, 3, 'https://chat.whatsapp.com/pending-admin-update');

CREATE OR REPLACE FUNCTION public.update_app_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_app_settings_updated_at();