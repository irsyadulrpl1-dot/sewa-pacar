-- Create a secure function for viewing friend profiles without sensitive data
CREATE OR REPLACE FUNCTION public.get_friend_profile(friend_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  username text,
  avatar_url text,
  city text,
  bio text,
  interests text[],
  is_online boolean,
  is_verified boolean,
  gender public.gender_type,
  last_seen timestamp with time zone,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.full_name,
    p.username,
    p.avatar_url,
    p.city,
    p.bio,
    p.interests,
    p.is_online,
    p.is_verified,
    p.gender,
    p.last_seen,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = friend_user_id
    AND (
      -- User can view their own profile
      p.user_id = auth.uid()
      OR
      -- User can view profiles of friends
      EXISTS (
        SELECT 1 FROM public.friends f
        WHERE (f.user_id = auth.uid() AND f.friend_id = p.user_id)
           OR (f.friend_id = auth.uid() AND f.user_id = p.user_id)
      )
    );
$$;

-- Drop the old policy that exposes all profile data to friends
DROP POLICY IF EXISTS "Users can view friends profiles" ON public.profiles;

-- Create a new restrictive policy - friends can only view via the secure function
-- The profiles table now only allows viewing your own profile directly
-- Friends must use the get_friend_profile function which excludes email