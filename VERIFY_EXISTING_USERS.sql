-- ============================================
-- VERIFY ALL EXISTING USERS
-- ============================================
-- Run this in Supabase SQL Editor to verify all existing users
-- This will allow them to login without email verification

-- Update all users to have confirmed email
-- Note: confirmed_at is a generated column, so we only update email_confirmed_at
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;

-- Verify the update
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,  -- This will be automatically set based on email_confirmed_at
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

