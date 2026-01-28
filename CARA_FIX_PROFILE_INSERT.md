# 🔧 Cara Memperbaiki Error "new row violates row-level security policy"

## ❌ Masalah

Error: `new row violates row-level security policy for table "profiles"`

Ini terjadi karena:
- Trigger `handle_new_user()` seharusnya membuat profile, tapi mungkin gagal
- Ketika sistem mencoba membuat profile manual, RLS policy memblokirnya

## ✅ Solusi: Buat RPC Function

### Langkah 1: Buka Supabase Dashboard

1. Login ke https://supabase.com/dashboard
2. Pilih project: `aqnitixtwdkemhrwawet`
3. Klik menu **SQL Editor** di sidebar kiri

### Langkah 2: Jalankan SQL Script

1. Buka file `FIX_PROFILE_INSERT.sql` di project Anda
2. Copy semua isi file tersebut
3. Paste ke SQL Editor di Supabase Dashboard
4. Klik tombol **Run** (atau tekan Ctrl+Enter)

### Langkah 3: Verifikasi

Setelah menjalankan script, pastikan:
- ✅ Tidak ada error di output
- ✅ Function `create_user_profile` muncul di hasil query

### Langkah 4: Test Register

1. Restart development server
2. Coba register dengan email baru
3. Periksa console browser - harus ada:
   ```
   Step 3 SUCCESS - Profile created via RPC: ...
   === SIGNUP PROCESS COMPLETED SUCCESSFULLY ===
   ```

## 🔍 Cara Cek Trigger

Jika masih ada masalah, periksa apakah trigger aktif:

```sql
-- Cek apakah trigger ada
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
  AND trigger_name = 'on_auth_user_created';

-- Cek apakah function handle_new_user ada
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';
```

## 🐛 Troubleshooting

### Masalah: Function tidak bisa dijalankan

**Solusi:**
- Pastikan Anda login sebagai admin di Supabase Dashboard
- Pastikan project yang dipilih benar

### Masalah: Masih error RLS

**Solusi:**
- Pastikan function menggunakan `SECURITY DEFINER`
- Pastikan `GRANT EXECUTE` sudah dijalankan
- Cek apakah user sudah authenticated saat memanggil function

### Masalah: Trigger masih tidak berjalan

**Kemungkinan:**
- Trigger mungkin dinonaktifkan
- Function `handle_new_user()` mungkin error

**Solusi:**
- Periksa logs di Supabase Dashboard → Logs → Postgres Logs
- Cek apakah ada error saat insert user baru

## 📝 Catatan

- RPC function `create_user_profile` menggunakan `SECURITY DEFINER` sehingga bisa bypass RLS
- Function ini hanya dipanggil sebagai fallback jika trigger gagal
- Function juga otomatis membuat user role

## ✅ Setelah Fix

Setelah menjalankan script:
1. ✅ Register akan berhasil meskipun trigger gagal
2. ✅ Profile akan dibuat via RPC function
3. ✅ User bisa langsung login setelah register
4. ✅ Data tersimpan dengan benar di database

