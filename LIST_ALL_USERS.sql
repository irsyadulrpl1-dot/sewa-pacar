-- ============================================
-- LIST ALL USERS (Untuk melihat email yang tersedia)
-- ============================================
-- Jalankan script ini dulu untuk melihat semua user yang terdaftar

SELECT 
  u.id as user_id,
  u.email,
  p.full_name,
  p.username,
  u.created_at,
  u.email_confirmed_at,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = u.id AND ur.role = 'admin'
    ) THEN '✅ Admin'
    ELSE '❌ User'
  END as current_role
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
ORDER BY u.created_at DESC;

