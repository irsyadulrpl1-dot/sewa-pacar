-- ============================================
-- MIGRATION: Add Extended Fields to Profiles Table
-- ============================================
-- 
-- File: supabase/migrations/20251230000000_add_profile_extended_fields.sql
-- 
-- This migration adds the following fields to the profiles table:
-- - availability (TEXT): Companion availability schedule
-- - hourly_rate (NUMERIC): Hourly rate for companion services
-- - personality (TEXT[]): Array of personality traits
-- - activities (TEXT[]): Array of available activities
-- - packages (JSONB): JSONB array of service packages
--
-- CARA MENJALANKAN:
-- 1. Buka Supabase Dashboard → SQL Editor
-- 2. Copy script di bawah ini
-- 3. Paste dan klik Run
-- 4. Pastikan tidak ada error
--
-- ============================================

-- Add availability field (text)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS availability TEXT;

-- Add hourly_rate field (numeric/decimal)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10, 2) DEFAULT 0;

-- Add personality field (array of text)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS personality TEXT[] DEFAULT '{}';

-- Add activities field (array of text)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS activities TEXT[] DEFAULT '{}';

-- Add packages field (JSONB for complex structure)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS packages JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.availability IS 'Companion availability schedule (e.g., "Weekdays & Weekend")';
COMMENT ON COLUMN public.profiles.hourly_rate IS 'Hourly rate for companion services';
COMMENT ON COLUMN public.profiles.personality IS 'Array of personality traits';
COMMENT ON COLUMN public.profiles.activities IS 'Array of available activities';
COMMENT ON COLUMN public.profiles.packages IS 'JSONB array of service packages with name, duration, and price';

-- Verify the columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('availability', 'hourly_rate', 'personality', 'activities', 'packages')
ORDER BY column_name;

