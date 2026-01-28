-- FIX: Comprehensive fix for all bookings RLS policies
-- This script will drop ALL existing policies and recreate them correctly
-- Run this if you still get "operator does not exist: text = uuid" error

-- Step 1: Drop ALL existing policies on bookings table FIRST
-- (Must be done before altering column type)
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Companions can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own pending bookings" ON public.bookings;
DROP POLICY IF EXISTS "Companions can update their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;

-- Step 2: Ensure companion_id is TEXT type (AFTER dropping policies)
DO $$
BEGIN
  -- Check if bookings table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bookings') THEN
    -- Check if companion_id is UUID type
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'bookings' 
      AND column_name = 'companion_id'
      AND data_type = 'uuid'
    ) THEN
      -- Drop NOT NULL constraint first
      ALTER TABLE public.bookings ALTER COLUMN companion_id DROP NOT NULL;
      
      -- Change column type from UUID to TEXT
      ALTER TABLE public.bookings ALTER COLUMN companion_id TYPE TEXT USING companion_id::TEXT;
      
      RAISE NOTICE 'Successfully changed companion_id from UUID to TEXT';
    ELSE
      RAISE NOTICE 'companion_id is already TEXT or does not exist';
    END IF;
  ELSE
    RAISE NOTICE 'bookings table does not exist yet. Run QUICK_FIX_BOOKINGS.sql first.';
  END IF;
END $$;

-- Step 3: Recreate ALL policies with proper TEXT comparison
-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
ON public.bookings
FOR SELECT
USING (auth.uid() = user_id);

-- Companions can view bookings for them (supports both UUID and TEXT companion_id)
CREATE POLICY "Companions can view their bookings"
ON public.bookings
FOR SELECT
USING (
  bookings.companion_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND (
      -- Match by UUID string comparison (all as text)
      profiles.user_id::text = bookings.companion_id 
      -- Or match by profile id as text (for string IDs like "luna-salsabila")
      OR profiles.id::text = bookings.companion_id
    )
  )
);

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Users can create their own bookings
CREATE POLICY "Users can create own bookings"
ON public.bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending bookings
CREATE POLICY "Users can update own pending bookings"
ON public.bookings
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

-- Companions can update bookings for them (supports both UUID and TEXT companion_id)
CREATE POLICY "Companions can update their bookings"
ON public.bookings
FOR UPDATE
USING (
  bookings.companion_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND (
      -- Match by UUID string comparison (all as text)
      profiles.user_id::text = bookings.companion_id 
      -- Or match by profile id as text (for string IDs like "luna-salsabila")
      OR profiles.id::text = bookings.companion_id
    )
  )
);

-- Admins can update all bookings
CREATE POLICY "Admins can update all bookings"
ON public.bookings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Step 4: Verify everything
DO $$
DECLARE
  companion_id_type TEXT;
  policy_count INTEGER;
BEGIN
  -- Check companion_id type
  SELECT data_type INTO companion_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'bookings'
    AND column_name = 'companion_id';
  
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'bookings';
  
  RAISE NOTICE '=== VERIFICATION ===';
  RAISE NOTICE 'companion_id type: %', COALESCE(companion_id_type, 'NOT FOUND');
  RAISE NOTICE 'Total policies on bookings: %', policy_count;
  
  IF companion_id_type = 'text' THEN
    RAISE NOTICE '✓ companion_id is TEXT (correct)';
  ELSE
    RAISE WARNING '✗ companion_id type is % (should be TEXT)', companion_id_type;
  END IF;
  
  IF policy_count >= 7 THEN
    RAISE NOTICE '✓ All policies created successfully';
  ELSE
    RAISE WARNING '✗ Only % policies found (expected 7)', policy_count;
  END IF;
END $$;

-- Step 5: Show all policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY policyname;

