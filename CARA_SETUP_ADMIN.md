# 🔐 Cara Setup Akun Admin

## ❌ Masalah: Akses Admin Ditolak

Jika Anda melihat "Akses Ditolak" meskipun sudah login dengan akun admin, kemungkinan:
1. User belum memiliki role `admin` di database
2. Role admin belum di-assign ke user

## ✅ SOLUSI: Assign Role Admin ke User

### Langkah 1: Cari User ID

1. Buka Supabase Dashboard
2. Authentication → Users
3. Cari email akun admin Anda
4. Copy **User ID** (UUID) dari user tersebut

### Langkah 2: Assign Role Admin via SQL

1. Buka Supabase Dashboard → **SQL Editor**
2. Copy dan jalankan script berikut (ganti `YOUR_USER_ID` dengan User ID yang sudah dicopy):

```sql
-- Assign admin role to user
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the role was assigned
SELECT 
  ur.user_id,
  ur.role,
  p.email,
  p.full_name
FROM public.user_roles ur
JOIN public.profiles p ON p.user_id = ur.user_id
WHERE ur.user_id = 'YOUR_USER_ID';
```

### Langkah 3: Verifikasi

Setelah menjalankan script:
- ✅ Pastikan tidak ada error
- ✅ Query kedua harus menampilkan role = 'admin'
- ✅ Email dan nama harus sesuai dengan akun Anda

### Langkah 4: Test Akses Admin

1. **Logout** dari aplikasi (jika sudah login)
2. **Login kembali** dengan akun admin
3. Buka halaman `/admin/payments`
4. Harus bisa akses tanpa error "Akses Ditolak"

## 🔍 Cara Cek Role User

Untuk mengecek role user tertentu:

```sql
-- Cek role user
SELECT 
  ur.user_id,
  ur.role,
  p.email,
  p.full_name
FROM public.user_roles ur
JOIN public.profiles p ON p.user_id = ur.user_id
WHERE p.email = 'email@example.com';
```

## 🎯 Script Lengkap (Copy-Paste Ready)

Ganti `YOUR_USER_ID` dan `email@example.com` dengan data Anda:

```sql
-- ============================================
-- SETUP ADMIN ROLE
-- ============================================

-- Step 1: Cari User ID dari email (jika belum tahu)
SELECT 
  id as user_id,
  email
FROM auth.users
WHERE email = 'email@example.com';

-- Step 2: Assign admin role (ganti YOUR_USER_ID dengan hasil dari Step 1)
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Verify role
SELECT 
  ur.user_id,
  ur.role,
  p.email,
  p.full_name,
  p.username
FROM public.user_roles ur
JOIN public.profiles p ON p.user_id = ur.user_id
WHERE ur.role = 'admin';
```

## 🐛 Troubleshooting

### Masalah: "User ID tidak ditemukan"

**Solusi:**
- Pastikan email yang digunakan benar
- Pastikan user sudah terdaftar di `auth.users`
- Pastikan profile sudah dibuat di `profiles`

### Masalah: "Masih Akses Ditolak setelah assign role"

**Solusi:**
1. **Logout dan login kembali** (wajib!)
2. Clear browser cache (Ctrl+Shift+R)
3. Periksa console browser untuk error detail
4. Pastikan query `has_role` berhasil:
   ```sql
   SELECT public.has_role('YOUR_USER_ID', 'admin');
   ```
   Harus return `true`

### Masalah: "Loading lama saat akses admin"

**Kemungkinan:**
- Query `has_role` lambat
- RLS policy memblokir query
- Network issue

**Solusi:**
1. Periksa console browser untuk error
2. Periksa Network tab untuk request yang lambat
3. Pastikan function `has_role` ada dan bisa diakses

## 📝 Catatan Penting

- **Setelah assign role admin, WAJIB logout dan login kembali**
- Role disimpan di tabel `user_roles`, bukan di `profiles`
- Satu user bisa memiliki multiple roles (user, talent, admin)
- Function `has_role` digunakan untuk check role di RLS policies

## ✅ Checklist

Setelah setup admin:

- [ ] User ID sudah dicopy
- [ ] Script SQL sudah dijalankan tanpa error
- [ ] Query verify menampilkan role = 'admin'
- [ ] Sudah **logout dan login kembali**
- [ ] Bisa akses `/admin/payments` tanpa error
- [ ] Tidak ada loading lama

