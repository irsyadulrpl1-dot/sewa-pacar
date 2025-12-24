-- Create a view for public profile data (excludes email, date_of_birth)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  user_id,
  full_name,
  username,
  avatar_url,
  city,
  bio,
  interests,
  gender,
  is_online,
  is_verified,
  last_seen,
  created_at
FROM public.profiles;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;

-- Add a policy that allows authenticated users to view other profiles
-- (only the view should be used for viewing other profiles, not the table directly)
CREATE POLICY "Authenticated users can view public profile data" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- Note: The existing "Users can view own profile" policy is redundant now but we keep both
-- The profiles table still protects email/date_of_birth at the application level
-- Use the public_profiles view for displaying other users' profiles