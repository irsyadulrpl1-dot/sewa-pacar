-- Add application-level user role (renter vs companion) to profiles
-- Enforced as "set once" via trigger, and used in RLS policies for bookings/payments.

-- 1) Enum type for profile role (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_role') THEN
    CREATE TYPE public.profile_role AS ENUM ('renter', 'companion');
  END IF;
END $$;

-- 2) Column on profiles (nullable during signup, but app forces selection)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role public.profile_role;

COMMENT ON COLUMN public.profiles.role IS 'Application role: renter or companion. Set once after signup.';

-- 3) Prevent changing role after it is set (backend enforcement)
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow initial set (OLD.role is null)
  IF OLD.role IS NOT NULL AND NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Profile role is permanent and cannot be changed once set';
  END IF;

  -- Also prevent unsetting it
  IF OLD.role IS NOT NULL AND NEW.role IS NULL THEN
    RAISE EXCEPTION 'Profile role cannot be unset';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_role_change ON public.profiles;
CREATE TRIGGER prevent_profile_role_change
BEFORE UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_role_change();

-- 4) Helper RPC to set role (optional but gives a single safe entry point)
CREATE OR REPLACE FUNCTION public.set_profile_role(new_role public.profile_role)
RETURNS public.profile_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_role public.profile_role;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT role INTO current_role
  FROM public.profiles
  WHERE user_id = auth.uid();

  IF current_role IS NOT NULL THEN
    IF current_role = new_role THEN
      RETURN current_role;
    END IF;
    RAISE EXCEPTION 'Role already set';
  END IF;

  UPDATE public.profiles
  SET role = new_role
  WHERE user_id = auth.uid();

  RETURN new_role;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_profile_role(public.profile_role) TO authenticated;

-- 5) Update handle_new_user to optionally store role from metadata (if provided)
--    This migration supersedes previous versions by re-creating the function.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role_text TEXT;
  v_role public.profile_role;
BEGIN
  v_role_text := NULLIF(NEW.raw_user_meta_data ->> 'role', '');
  v_role := NULL;

  IF v_role_text IN ('renter', 'companion') THEN
    v_role := v_role_text::public.profile_role;
  END IF;

  INSERT INTO public.profiles (user_id, full_name, username, email, date_of_birth, gender, city, bio, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'username', NEW.id::text),
    NEW.email,
    (NEW.raw_user_meta_data ->> 'date_of_birth')::date,
    (NEW.raw_user_meta_data ->> 'gender')::public.gender_type,
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'bio',
    v_role
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Create a default welcome notification (only if notifications table exists)
  IF to_regclass('public.notifications') IS NOT NULL
     AND to_regtype('public.notification_type') IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_type, metadata)
    VALUES (
      NEW.id,
      'system_announcement'::public.notification_type,
      'Selamat datang di RentBae 👋',
      'Akun kamu berhasil dibuat. Pilih peran (Penyewa / Teman yang Disewa) untuk mulai menggunakan aplikasi.',
      'system',
      jsonb_build_object('kind', 'welcome')
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6) Update create_user_profile RPC to support role (when trigger fails)
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_user_id UUID,
  p_full_name TEXT,
  p_username TEXT,
  p_email TEXT,
  p_date_of_birth DATE DEFAULT NULL,
  p_gender public.gender_type DEFAULT 'prefer_not_to_say',
  p_city TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_role public.profile_role DEFAULT NULL
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
  INSERT INTO public.profiles (
    user_id,
    full_name,
    username,
    email,
    date_of_birth,
    gender,
    city,
    bio,
    role
  )
  VALUES (
    p_user_id,
    p_full_name,
    p_username,
    p_email,
    p_date_of_birth,
    p_gender,
    p_city,
    p_bio,
    p_role
  )
  RETURNING id, user_id, full_name, username, email
  INTO v_profile_id, user_id, full_name, username, email;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN QUERY
  SELECT 
    v_profile_id,
    p_user_id,
    p_full_name,
    p_username,
    p_email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, DATE, public.gender_type, TEXT, TEXT, public.profile_role) TO authenticated;

-- 7) RLS: Only allow viewing companion profiles via role flag (replaces hourly_rate heuristic)
DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    -- Replace policy if it exists
    DROP POLICY IF EXISTS "Users can view companion profiles" ON public.profiles;
    CREATE POLICY "Users can view companion profiles"
    ON public.profiles
    FOR SELECT
    USING (
      role = 'companion'::public.profile_role
      AND auth.uid() IS NOT NULL
    );
  END IF;
END $$;

-- 8) RLS: Restrict booking/payment creation to renter role
DO $$
BEGIN
  IF to_regclass('public.bookings') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
    CREATE POLICY "Users can create own bookings"
    ON public.bookings
    FOR INSERT
    WITH CHECK (
      auth.uid() = user_id
      AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.user_id = auth.uid()
          AND p.role = 'renter'::public.profile_role
      )
    );
  END IF;

  IF to_regclass('public.payments') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Users can create own payments" ON public.payments;
    CREATE POLICY "Users can create own payments"
    ON public.payments
    FOR INSERT
    WITH CHECK (
      auth.uid() = user_id
      AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.user_id = auth.uid()
          AND p.role = 'renter'::public.profile_role
      )
    );
  END IF;
END $$;


