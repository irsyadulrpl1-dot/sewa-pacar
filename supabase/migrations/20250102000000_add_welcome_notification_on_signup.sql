-- Add a welcome notification for newly registered users
-- This runs inside the existing auth.users trigger function (handle_new_user)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, username, email, date_of_birth, gender, city, bio)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'username', NEW.id::text),
    NEW.email,
    (NEW.raw_user_meta_data ->> 'date_of_birth')::date,
    (NEW.raw_user_meta_data ->> 'gender')::public.gender_type,
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'bio'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  -- Create a default welcome notification (only if notifications table exists)
  IF to_regclass('public.notifications') IS NOT NULL
     AND to_regtype('public.notification_type') IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_type, metadata)
    VALUES (
      NEW.id,
      'system_announcement'::public.notification_type,
      'Selamat datang di RentBae 👋',
      'Akun kamu berhasil dibuat. Mulai jelajahi partner, pesan jadwal, dan pantau status pembayaran lewat notifikasi.',
      'system',
      jsonb_build_object('kind', 'welcome')
    );
  END IF;
  
  RETURN NEW;
END;
$$;


