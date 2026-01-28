-- Allow all authenticated users to view companion profiles (profiles with hourly_rate)
-- This is needed for the Explore/Jelajahi feature

-- Drop existing restrictive policy if exists
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view friends profiles" ON public.profiles;

-- Create policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy: Users can view companion profiles (profiles with hourly_rate)
-- This allows all authenticated users to see profiles that offer companion services
CREATE POLICY "Users can view companion profiles"
ON public.profiles
FOR SELECT
USING (
  hourly_rate IS NOT NULL 
  AND auth.uid() IS NOT NULL
);

-- Create policy: Users can view friends' profiles (for friend system)
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

-- Note: Anonymous users (not logged in) can still use search_profiles RPC function
-- which is already defined in previous migrations

