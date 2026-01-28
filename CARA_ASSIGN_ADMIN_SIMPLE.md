# 🚀 Cara Assign Admin Role - VERSI MUDAH

## ⚠️ Error yang Terjadi

```
ERROR: invalid input syntax for type uuid: "YOUR_USER_ID"
```

Ini terjadi karena placeholder `YOUR_USER_ID` tidak diganti dengan UUID yang sebenarnya.

## ✅ SOLUSI MUDAH: Gunakan Script Berdasarkan Email

### Langkah 1: Buka Supabase SQL Editor

1. Buka https://supabase.com/dashboard
2. Pilih project: `aqnitixtwdkemhrwawet`
3. Klik **SQL Editor** di sidebar kiri

### Langkah 2: Copy Script

Buka file `ASSIGN_ADMIN_BY_EMAIL.sql` dan copy isinya.

### Langkah 3: Ganti Email

Di script, cari baris ini:
```sql
WHERE email = 'email@example.com'  -- ← GANTI INI
```

Ganti `'email@example.com'` dengan **email admin Anda yang sebenarnya**, contoh:
```sql
WHERE email = 'admin@temani.com'
```

**PENTING:** Ganti di **2 tempat** (ada 2 baris yang sama)

### Langkah 4: Jalankan Script

1. Paste script yang sudah diganti email ke SQL Editor
2. Klik **Run** (atau tekan Ctrl+Enter)
3. Pastikan tidak ada error

### Langkah 5: Verifikasi

Setelah menjalankan script, pastikan:
- ✅ Tidak ada error
- ✅ Query terakhir menampilkan `is_admin_confirmed = true`
- ✅ Email, role, dan nama sesuai

### Langkah 6: Logout & Login Kembali

1. **Logout** dari aplikasi
2. **Login kembali** dengan email admin
3. Buka `/admin/payments`
4. Harus bisa akses!

## 📝 Contoh Script yang Sudah Diganti

```sql
-- Ganti email@example.com dengan email Anda
WITH target_user AS (
  SELECT id, email
  FROM auth.users
  WHERE email = 'admin@temani.com'  -- ← Email admin Anda
)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM target_user
ON CONFLICT (user_id, role) DO NOTHING
RETURNING user_id;

-- Verify
SELECT 
  u.email,
  ur.role,
  p.full_name,
  public.has_role(u.id, 'admin') as is_admin_confirmed
FROM auth.users u
JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE u.email = 'admin@temani.com'  -- ← Email admin Anda
  AND ur.role = 'admin';
```

## 🐛 Troubleshooting

### Masalah: "User dengan email ... tidak ditemukan"

**Solusi:**
- Pastikan email yang digunakan **benar** (case-sensitive)
- Pastikan user sudah terdaftar di `auth.users`
- Cek di Supabase Dashboard → Authentication → Users

### Masalah: "Masih Akses Ditolak"

**Solusi:**
1. **WAJIB logout dan login kembali** setelah assign role
2. Clear browser cache (Ctrl+Shift+R)
3. Periksa console browser untuk error
4. Pastikan query verify menampilkan `is_admin_confirmed = true`

### Masalah: "Loading lama"

**Kemungkinan:**
- Query `has_role` lambat
- Network issue

**Solusi:**
- Periksa console browser untuk error
- Periksa Network tab untuk request yang lambat
- Pastikan function `has_role` ada dan bisa diakses

## ✅ Checklist

Setelah assign admin role:

- [ ] Email sudah diganti di script (2 tempat)
- [ ] Script dijalankan tanpa error
- [ ] Query verify menampilkan `is_admin_confirmed = true`
- [ ] **Sudah logout dan login kembali** (WAJIB!)
- [ ] Bisa akses `/admin/payments` tanpa error
- [ ] Tidak ada loading lama

## 💡 Tips

- Gunakan script `ASSIGN_ADMIN_BY_EMAIL.sql` (lebih mudah)
- Tidak perlu cari User ID manual
- Langsung pakai email yang sudah dikenal
- Script otomatis handle semua

