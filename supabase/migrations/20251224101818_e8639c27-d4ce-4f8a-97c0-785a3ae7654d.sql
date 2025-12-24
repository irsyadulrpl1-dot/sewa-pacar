-- Drop the old view and recreate with security_invoker = true
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true) AS
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