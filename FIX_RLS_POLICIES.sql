-- FIX: Update RLS policies to handle TEXT companion_id properly
-- Run this if you get "operator does not exist: text = uuid" error
-- 
-- NOTE: If this doesn't work, use FIX_ALL_BOOKINGS_POLICIES.sql instead
-- which will fix the column type AND all policies comprehensively

-- Step 1: Ensure companion_id is TEXT (if not already)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'bookings' 
    AND column_name = 'companion_id'
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.bookings ALTER COLUMN companion_id DROP NOT NULL;
    ALTER TABLE public.bookings ALTER COLUMN companion_id TYPE TEXT USING companion_id::TEXT;
    RAISE NOTICE 'Changed companion_id from UUID to TEXT';
  END IF;
END $$;

-- Step 2: Drop existing policies
DROP POLICY IF EXISTS "Companions can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Companions can update their bookings" ON public.bookings;

-- Step 3: Recreate policies with proper TEXT comparison
CREATE POLICY "Companions can view their bookings"
ON public.bookings
FOR SELECT
USING (
  bookings.companion_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND (
      -- Match by UUID string comparison (all as text)
      profiles.user_id::text = bookings.companion_id 
      -- Or match by profile id as text
      OR profiles.id::text = bookings.companion_id
    )
  )
);

CREATE POLICY "Companions can update their bookings"
ON public.bookings
FOR UPDATE
USING (
  bookings.companion_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND (
      -- Match by UUID string comparison (all as text)
      profiles.user_id::text = bookings.companion_id 
      -- Or match by profile id as text
      OR profiles.id::text = bookings.companion_id
    )
  )
);

-- Step 4: Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'bookings'
  AND policyname LIKE '%Companions%'
ORDER BY policyname;

