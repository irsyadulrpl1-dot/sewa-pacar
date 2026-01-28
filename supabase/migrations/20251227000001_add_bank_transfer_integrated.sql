-- Add bank_transfer_integrated to payment_method enum
-- This allows users to pay directly via Midtrans without opening mobile banking app

-- Note: PostgreSQL doesn't support ALTER TYPE ... ADD VALUE in a transaction
-- So we need to check if the value exists first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'bank_transfer_integrated' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_method')
  ) THEN
    ALTER TYPE public.payment_method ADD VALUE 'bank_transfer_integrated';
  END IF;
END $$;

