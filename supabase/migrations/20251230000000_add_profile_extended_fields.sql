-- Add extended fields to profiles table for companion features
-- These fields are used in the Profile edit form but were missing from the database

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

