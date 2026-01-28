-- ============================================
-- ASSIGN ADMIN ROLE TO USER
-- ============================================
-- Run this in Supabase SQL Editor
-- 
-- CARA MENGGUNAKAN:
-- 1. Ganti 'email@example.com' di bawah dengan email admin Anda
-- 2. Jalankan semua script sekaligus
-- 3. Pastikan tidak ada error

-- ============================================
-- STEP 1: GANTI EMAIL INI DENGAN EMAIL ADMIN ANDA
-- ============================================
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'email@example.com';  -- ⚠️ GANTI INI DENGAN EMAIL ADMIN ANDA
BEGIN
  -- Find user ID from email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;
  
  -- Check if user exists
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User dengan email % tidak ditemukan. Pastikan email benar dan user sudah terdaftar.', v_email;
  END IF;
  
  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE 'Admin role berhasil di-assign ke user: %', v_email;
END $$;

-- ============================================
-- STEP 2: VERIFY - Cek semua admin
-- ============================================
SELECT 
  ur.user_id,
  ur.role,
  p.email,
  p.full_name,
  p.username,
  u.created_at as user_created_at
FROM public.user_roles ur
JOIN public.profiles p ON p.user_id = ur.user_id
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'admin'
ORDER BY u.created_at DESC;

-- ============================================
-- STEP 3: TEST - Cek role untuk email tertentu
-- ============================================
-- Ganti 'email@example.com' dengan email yang ingin dicek
SELECT 
  u.id as user_id,
  u.email,
  public.has_role(u.id, 'admin') as is_admin
FROM auth.users u
WHERE u.email = 'email@example.com';  -- ⚠️ GANTI INI JIKA INGIN TEST

