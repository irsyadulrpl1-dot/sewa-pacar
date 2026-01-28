-- FIX: Change companion_id from UUID to TEXT to support string IDs
-- Run this AFTER running QUICK_FIX_BOOKINGS.sql if table already exists

-- Step 1: Drop ALL policies that use companion_id FIRST
-- (Must be done before altering column type)
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Companions can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own pending bookings" ON public.bookings;
DROP POLICY IF EXISTS "Companions can update their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;

-- Step 2: Check if table exists and has UUID column, then change type
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

-- Step 3: Recreate RLS policies to handle TEXT companion_id
-- Drop old policies if they exist
DROP POLICY IF EXISTS "Companions can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Companions can update their bookings" ON public.bookings;

-- Recreate policies with TEXT support and proper type casting
CREATE POLICY "Companions can view their bookings"
ON public.bookings
FOR SELECT
USING (
  bookings.companion_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND (
      -- Match by UUID (cast companion_id to UUID if it's a valid UUID)
      (bookings.companion_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
       AND profiles.user_id::text = bookings.companion_id)
      -- Or match by string ID (for static data like "luna-salsabila")
      OR profiles.id::text = bookings.companion_id
      OR profiles.user_id::text = bookings.companion_id
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
      -- Match by UUID (cast companion_id to UUID if it's a valid UUID)
      (bookings.companion_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
       AND profiles.user_id::text = bookings.companion_id)
      -- Or match by string ID (for static data like "luna-salsabila")
      OR profiles.id::text = bookings.companion_id
      OR profiles.user_id::text = bookings.companion_id
    )
  )
);

-- Step 4: Recreate other policies that were dropped
CREATE POLICY "Users can view own bookings"
ON public.bookings
FOR SELECT
USING (auth.uid() = user_id);

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

CREATE POLICY "Users can create own bookings"
ON public.bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending bookings"
ON public.bookings
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

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

-- Step 5: Verify the change
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bookings'
  AND column_name = 'companion_id';

-- Step 6: Verify all policies were recreated
SELECT 
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY policyname;

