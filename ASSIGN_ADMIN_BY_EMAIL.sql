-- ============================================
-- ASSIGN ADMIN ROLE BY EMAIL
-- ============================================
-- 
-- ⚠️ PENTING: GANTI 'email@example.com' DENGAN EMAIL YANG SEBENARNYA!
-- 
-- CARA MENGGUNAKAN:
-- 1. Jalankan dulu LIST_ALL_USERS.sql untuk melihat email yang tersedia
-- 2. Copy email yang ingin dijadikan admin
-- 3. Ganti 'email@example.com' di bawah dengan email tersebut (2 tempat)
-- 4. Jalankan script ini
-- 5. Logout dan login kembali

-- ============================================
-- STEP 1: GANTI EMAIL DI SINI (Baris 18)
-- ============================================
-- Contoh: WHERE email = 'admin@temani.com'
--         WHERE email = 'syadull@gmail.com'
--         WHERE email = 'user123@example.com'

WITH target_user AS (
  SELECT id, email
  FROM auth.users
  WHERE email = 'email@example.com'  -- ⚠️ GANTI INI DENGAN EMAIL YANG SEBENARNYA!
)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM target_user
ON CONFLICT (user_id, role) DO NOTHING
RETURNING user_id;

-- ============================================
-- STEP 2: GANTI EMAIL DI SINI JUGA (Baris 35)
-- ============================================
-- Pastikan email sama dengan yang di atas!

-- Verify - Cek apakah role sudah di-assign
SELECT 
  u.email,
  ur.role,
  p.full_name,
  p.username,
  public.has_role(u.id, 'admin') as is_admin_confirmed
FROM auth.users u
JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE u.email = 'email@example.com'  -- ⚠️ GANTI INI JUGA DENGAN EMAIL YANG SAMA!
  AND ur.role = 'admin';

