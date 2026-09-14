CREATE TABLE public.cashfree_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL UNIQUE,
  cf_order_id text,
  customer_name text NOT NULL CHECK (char_length(customer_name) BETWEEN 2 AND 100),
  customer_email text NOT NULL CHECK (char_length(customer_email) <= 255),
  customer_phone text NOT NULL CHECK (customer_phone ~ '^[0-9]{10}$'),
  amount_inr numeric(10,2) NOT NULL DEFAULT 300.00 CHECK (amount_inr = 300.00),
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'active', 'paid', 'failed', 'expired', 'cancelled')),
  tracking jsonb NOT NULL DEFAULT '{}'::jsonb,
  payment_session_id text,
  paid_at timestamptz,
  access_expires_at timestamptz,
  last_webhook_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.cashfree_orders TO service_role;
ALTER TABLE public.cashfree_orders ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_cashfree_orders_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_cashfree_orders_updated_at
BEFORE UPDATE ON public.cashfree_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_cashfree_orders_updated_at();