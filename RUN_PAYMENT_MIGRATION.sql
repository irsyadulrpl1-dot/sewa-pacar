-- ============================================
-- MIGRATION: Add Payment Methods to Profiles
-- ============================================
-- 
-- File: supabase/migrations/20251230000001_add_companion_payment_methods.sql
-- 
-- This migration adds payment methods fields to the profiles table:
-- - bank_accounts (JSONB): Array of bank accounts
-- - e_wallet_accounts (JSONB): Array of e-wallet accounts
--
-- CARA MENJALANKAN:
-- 1. Buka Supabase Dashboard → SQL Editor
-- 2. Copy script di bawah ini
-- 3. Paste dan klik Run
-- 4. Pastikan tidak ada error
--
-- ============================================

-- Add bank transfer fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bank_accounts JSONB DEFAULT '[]'::jsonb;

-- Add e-wallet fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS e_wallet_accounts JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.bank_accounts IS 'JSONB array of bank accounts: [{bank_name: "BCA", account_number: "1234567890", account_name: "John Doe"}]';
COMMENT ON COLUMN public.profiles.e_wallet_accounts IS 'JSONB array of e-wallet accounts: [{wallet_type: "gopay", account_number: "081234567890", account_name: "John Doe", qr_code_url: "https://..."}]';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_bank_accounts ON public.profiles USING GIN (bank_accounts);
CREATE INDEX IF NOT EXISTS idx_profiles_e_wallet_accounts ON public.profiles USING GIN (e_wallet_accounts);

-- Verify the columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('bank_accounts', 'e_wallet_accounts')
ORDER BY column_name;

