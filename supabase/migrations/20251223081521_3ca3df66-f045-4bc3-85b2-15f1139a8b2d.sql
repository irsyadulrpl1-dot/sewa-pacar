-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create policy for own profile only
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for friends' profiles
CREATE POLICY "Users can view friends profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.friends 
    WHERE (friends.user_id = auth.uid() AND friends.friend_id = profiles.user_id)
       OR (friends.friend_id = auth.uid() AND friends.user_id = profiles.user_id)
  )
);

-- Create a secure function for profile discovery (returns only non-sensitive data)
CREATE OR REPLACE FUNCTION public.search_profiles(search_query text DEFAULT '')
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
  gender public.gender_type
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
    p.gender
  FROM public.profiles p
  WHERE p.user_id != auth.uid()
    AND (
      search_query = '' 
      OR p.full_name ILIKE '%' || search_query || '%'
      OR p.username ILIKE '%' || search_query || '%'
      OR p.city ILIKE '%' || search_query || '%'
    )
  LIMIT 50;
$$;