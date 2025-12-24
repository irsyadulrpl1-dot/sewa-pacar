-- Create payment status enum
CREATE TYPE public.payment_status AS ENUM (
  'pending',
  'waiting_validation',
  'approved',
  'rejected',
  'cancelled',
  'expired'
);

-- Create payment method enum
CREATE TYPE public.payment_method AS ENUM (
  'cod',
  'bank_transfer',
  'dana',
  'gopay',
  'ovo',
  'shopeepay'
);

-- Create payment configuration table for storing bank accounts, e-wallet numbers
CREATE TABLE public.payment_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method payment_method NOT NULL,
  bank_name TEXT,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  companion_id UUID,
  amount DECIMAL(12,2) NOT NULL,
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  proof_url TEXT,
  notes TEXT,
  admin_notes TEXT,
  validated_by UUID,
  validated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  booking_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.payment_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payment config policies (public read for active configs)
CREATE POLICY "Anyone can view active payment configs"
ON public.payment_config
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage payment configs"
ON public.payment_config
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Payments table policies
CREATE POLICY "Users can view own payments"
ON public.payments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
ON public.payments
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own payments"
ON public.payments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending payments"
ON public.payments
FOR UPDATE
USING (auth.uid() = user_id AND status IN ('pending', 'waiting_validation'))
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update all payments"
ON public.payments
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_config_updated_at
BEFORE UPDATE ON public.payment_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default payment configurations
INSERT INTO public.payment_config (method, bank_name, account_number, account_name) VALUES
('bank_transfer', 'BCA', '1234567890', 'PT Companion App'),
('bank_transfer', 'BRI', '0987654321', 'PT Companion App'),
('bank_transfer', 'Mandiri', '1122334455', 'PT Companion App'),
('dana', NULL, '081234567890', 'Companion App'),
('gopay', NULL, '081234567890', 'Companion App');

-- Enable realtime for payments
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;