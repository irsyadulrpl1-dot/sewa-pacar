-- Repair migration:
-- Fix mismatched profiles.role column type (e.g., name/text/app_role) -> public.profile_role
-- Ensure RPC set_profile_role exists so PostgREST /rpc endpoint works (no 404).

-- 1) Ensure enum exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_role') THEN
    CREATE TYPE public.profile_role AS ENUM ('renter', 'companion');
  END IF;
END $$;

-- 2) Ensure column exists; if exists but wrong type, convert safely
DO $$
DECLARE
  v_udt_name TEXT;
BEGIN
  SELECT c.udt_name
  INTO v_udt_name
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'profiles'
    AND c.column_name = 'role';

  IF v_udt_name IS NULL THEN
    ALTER TABLE public.profiles
      ADD COLUMN role public.profile_role;
  ELSIF v_udt_name <> 'profile_role' THEN
    -- Convert existing role values to the new enum.
    -- Map common legacy values:
    -- - 'talent' -> 'companion'
    -- - 'user'   -> 'renter'
    -- Unknown values become NULL (user will be forced to choose role).
    ALTER TABLE public.profiles
      ALTER COLUMN role TYPE public.profile_role
      USING (
        CASE
          WHEN role IS NULL THEN NULL
          WHEN lower(role::text) IN ('companion', 'talent') THEN 'companion'::public.profile_role
          WHEN lower(role::text) IN ('renter', 'user') THEN 'renter'::public.profile_role
          ELSE NULL
        END
      );
  END IF;
END $$;

COMMENT ON COLUMN public.profiles.role IS 'Application role: renter or companion. Set once after signup.';

-- 3) Optional backfill for existing companions who already set hourly_rate
UPDATE public.profiles
SET role = 'companion'::public.profile_role
WHERE role IS NULL
  AND hourly_rate IS NOT NULL
  AND hourly_rate > 0;

-- 4) Prevent changing role after it is set (backend enforcement)
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role IS NOT NULL AND NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Profile role is permanent and cannot be changed once set';
  END IF;
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

-- 5) Ensure RPC exists (so /rest/v1/rpc/set_profile_role works)
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

-- 6) Policy: view companion profiles based on role (drop/recreate)
DROP POLICY IF EXISTS "Users can view companion profiles" ON public.profiles;
CREATE POLICY "Users can view companion profiles"
ON public.profiles
FOR SELECT
USING (
  role = 'companion'::public.profile_role
  AND auth.uid() IS NOT NULL
);

-- 7) RLS: Restrict booking/payment creation to renter role (drop/recreate if tables exist)
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


