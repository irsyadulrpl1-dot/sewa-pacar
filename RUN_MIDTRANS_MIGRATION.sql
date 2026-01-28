-- Migration: Add bank_transfer_integrated payment method
-- Run this in Supabase SQL Editor

-- Add bank_transfer_integrated to payment_method enum
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

-- Verify the enum value was added
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_method')
ORDER BY enumsortorder;

