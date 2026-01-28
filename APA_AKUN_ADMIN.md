# 🔐 Apa Itu Akun Admin?

## 📖 Penjelasan Singkat

**Akun Admin** adalah akun pengguna yang memiliki **hak akses khusus** untuk mengelola sistem aplikasi. Admin bisa melakukan hal-hal yang tidak bisa dilakukan user biasa, seperti:

### ✅ Fitur yang Bisa Diakses Admin:

1. **Validasi Pembayaran**
   - Melihat semua pembayaran dari semua user
   - Menerima atau menolak pembayaran
   - Menambahkan catatan admin

2. **Mengelola Bookings**
   - Melihat semua booking dari semua user
   - Mengubah status booking
   - Membatalkan booking jika perlu

3. **Mengelola Konten**
   - Membuat/mengedit/hapus info/announcement
   - Mengelola payment configurations

4. **Akses Data Lengkap**
   - Melihat semua data user
   - Melihat semua transaksi
   - Melihat semua laporan

## 🆚 Perbedaan Admin vs User Biasa

| Fitur | User Biasa | Admin |
|-------|-----------|-------|
| Melihat pembayaran sendiri | ✅ | ✅ |
| Melihat pembayaran orang lain | ❌ | ✅ |
| Validasi pembayaran | ❌ | ✅ |
| Melihat semua bookings | ❌ | ✅ |
| Membuat announcement | ❌ | ✅ |
| Mengelola payment config | ❌ | ✅ |

## 🎯 Cara Membuat Akun Admin

### Metode 1: Menggunakan Email (PALING MUDAH)

1. **Buka Supabase Dashboard** → **SQL Editor**

2. **Copy script ini** dan ganti `email@example.com` dengan email akun yang ingin dijadikan admin:

```sql
-- GANTI EMAIL DI SINI ↓
WITH target_user AS (
  SELECT id, email
  FROM auth.users
  WHERE email = 'email@example.com'  -- ⚠️ GANTI INI!
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
  public.has_role(u.id, 'admin') as is_admin
FROM auth.users u
JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE u.email = 'email@example.com'  -- ⚠️ GANTI INI JUGA!
  AND ur.role = 'admin';
```

3. **Jalankan script** (klik Run)

4. **Logout dan login kembali** (WAJIB!)

### Metode 2: Menggunakan User ID

1. **Cari User ID** di Supabase Dashboard → Authentication → Users

2. **Copy User ID** (UUID)

3. **Jalankan script ini** (ganti `YOUR_USER_ID`):

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

## 📋 File yang Tersedia

Di project ini sudah ada file-file berikut untuk membantu setup admin:

1. **`ASSIGN_ADMIN_BY_EMAIL.sql`** - Script untuk assign admin via email
2. **`CARA_SETUP_ADMIN.md`** - Dokumentasi lengkap setup admin
3. **`CARA_ASSIGN_ADMIN_SIMPLE.md`** - Panduan singkat
4. **`CARA_ASSIGN_ADMIN_STEP_BY_STEP.md`** - Panduan step-by-step

## 🔍 Cara Cek Apakah User Sudah Admin

Jalankan query ini di Supabase SQL Editor:

```sql
-- Cek semua admin
SELECT 
  u.email,
  ur.role,
  p.full_name,
  public.has_role(u.id, 'admin') as is_admin
FROM auth.users u
JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE ur.role = 'admin';
```

## 🚨 Troubleshooting

### Masalah: "Akses Ditolak" meskipun sudah assign admin

**Solusi:**
1. ✅ Pastikan script SQL sudah dijalankan tanpa error
2. ✅ **Logout dan login kembali** (ini WAJIB!)
3. ✅ Clear browser cache (Ctrl+Shift+R)
4. ✅ Cek apakah `has_role` return `true`:
   ```sql
   SELECT public.has_role('USER_ID', 'admin');
   ```

### Masalah: Loading lama saat akses admin page

**Kemungkinan:**
- Query `has_role` lambat
- RLS policy memblokir

**Solusi:**
- Periksa console browser untuk error
- Pastikan function `has_role` ada di database

## 📝 Catatan Penting

- ⚠️ **Setelah assign role admin, WAJIB logout dan login kembali**
- ⚠️ Role disimpan di tabel `user_roles`, bukan di `profiles`
- ⚠️ Satu user bisa memiliki multiple roles (user, talent, admin)
- ⚠️ Function `has_role` digunakan untuk check role di RLS policies

## ✅ Checklist Setup Admin

- [ ] Email/User ID sudah diketahui
- [ ] Script SQL sudah dijalankan tanpa error
- [ ] Query verify menampilkan role = 'admin'
- [ ] Sudah **logout dan login kembali**
- [ ] Bisa akses `/admin/payments` tanpa error
- [ ] Tidak ada loading lama

## 🎓 Contoh Penggunaan

Setelah menjadi admin, Anda bisa:

1. **Akses halaman admin:**
   - Buka `/admin/payments` untuk validasi pembayaran
   - Buka halaman admin lainnya sesuai yang tersedia

2. **Validasi pembayaran:**
   - Lihat daftar pembayaran yang menunggu validasi
   - Klik "Terima" atau "Tolak"
   - Tambahkan catatan jika perlu

3. **Mengelola sistem:**
   - Buat announcement/info
   - Kelola payment configurations
   - Lihat semua data user dan transaksi

---

**💡 Tips:** Gunakan file `ASSIGN_ADMIN_BY_EMAIL.sql` untuk setup admin dengan mudah!

