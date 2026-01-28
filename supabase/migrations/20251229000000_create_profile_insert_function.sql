-- Create RPC function to insert profile (bypasses RLS)
-- This function is used as a fallback when trigger fails
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_user_id UUID,
  p_full_name TEXT,
  p_username TEXT,
  p_email TEXT,
  p_date_of_birth DATE DEFAULT NULL,
  p_gender public.gender_type DEFAULT 'prefer_not_to_say',
  p_city TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  full_name TEXT,
  username TEXT,
  email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  -- Insert profile (bypasses RLS because of SECURITY DEFINER)
  INSERT INTO public.profiles (
    user_id,
    full_name,
    username,
    email,
    date_of_birth,
    gender,
    city,
    bio
  )
  VALUES (
    p_user_id,
    p_full_name,
    p_username,
    p_email,
    p_date_of_birth,
    p_gender,
    p_city,
    p_bio
  )
  RETURNING id, user_id, full_name, username, email
  INTO v_profile_id, user_id, full_name, username, email;
  
  -- Insert user role if it doesn't exist
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Return the created profile
  RETURN QUERY
  SELECT 
    v_profile_id,
    p_user_id,
    p_full_name,
    p_username,
    p_email;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;

