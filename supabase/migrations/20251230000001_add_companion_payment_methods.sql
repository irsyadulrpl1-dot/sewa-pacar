-- Add payment methods fields to profiles table for companions
-- These fields store bank accounts and e-wallet information for each companion

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

