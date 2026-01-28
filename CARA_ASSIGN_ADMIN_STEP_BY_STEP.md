# 📋 Cara Assign Admin Role - Step by Step

## ⚠️ Error yang Terjadi

```
ERROR: User dengan email email@example.com tidak ditemukan
```

Ini terjadi karena email `email@example.com` adalah **placeholder** yang harus diganti dengan email yang sebenarnya!

## ✅ SOLUSI: Ikuti Langkah-langkah Ini

### STEP 1: Lihat Daftar User yang Tersedia

1. Buka Supabase Dashboard → **SQL Editor**
2. Buka file `LIST_ALL_USERS.sql`
3. Copy semua isinya
4. Paste ke SQL Editor
5. Klik **Run**
6. **Catat email** yang ingin dijadikan admin (contoh: `syadull@gmail.com`)

### STEP 2: Assign Admin Role

1. Buka file `ASSIGN_ADMIN_BY_EMAIL.sql`
2. Cari baris yang berisi `'email@example.com'` (ada 2 tempat)
3. **Ganti** `'email@example.com'` dengan **email yang Anda catat di Step 1**

**Contoh:**
```sql
-- SEBELUM (SALAH):
WHERE email = 'email@example.com'

-- SESUDAH (BENAR):
WHERE email = 'syadull@gmail.com'
```

**PENTING:** Ganti di **2 tempat**:
- Baris ~18 (di dalam `WITH target_user`)
- Baris ~35 (di dalam query `SELECT` untuk verify)

### STEP 3: Jalankan Script

1. Copy script yang sudah diganti email
2. Paste ke SQL Editor
3. Klik **Run**
4. Pastikan tidak ada error
5. Pastikan query terakhir menampilkan `is_admin_confirmed = true`

### STEP 4: Logout & Login Kembali

1. **Logout** dari aplikasi (wajib!)
2. **Login kembali** dengan email yang sudah di-assign admin
3. Buka `/admin/payments`
4. Harus bisa akses!

## 📝 Contoh Lengkap

### Script Sebelum Diganti (SALAH):
```sql
WHERE email = 'email@example.com'  -- ← Ini placeholder, akan error!
```

### Script Setelah Diganti (BENAR):
```sql
WHERE email = 'syadull@gmail.com'  -- ← Email yang sebenarnya
```

## 🔍 Cara Cek Email yang Tersedia

Jalankan script ini di SQL Editor:

```sql
SELECT 
  u.email,
  p.full_name,
  p.username
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
ORDER BY u.created_at DESC;
```

Ini akan menampilkan semua email yang terdaftar. Pilih salah satu untuk dijadikan admin.

## ✅ Checklist

- [ ] Sudah jalankan `LIST_ALL_USERS.sql` untuk lihat email
- [ ] Sudah catat email yang ingin dijadikan admin
- [ ] Sudah ganti `'email@example.com'` dengan email yang sebenarnya (2 tempat)
- [ ] Script dijalankan tanpa error
- [ ] Query verify menampilkan `is_admin_confirmed = true`
- [ ] **Sudah logout dan login kembali**
- [ ] Bisa akses `/admin/payments`

## 🐛 Masih Error?

### Error: "User dengan email ... tidak ditemukan"

**Penyebab:**
- Email yang digunakan salah
- User belum terdaftar
- Typo pada email

**Solusi:**
1. Jalankan `LIST_ALL_USERS.sql` untuk lihat email yang benar
2. Copy email **persis** seperti yang muncul (case-sensitive)
3. Pastikan tidak ada spasi atau karakter aneh

### Error: "Masih Akses Ditolak"

**Solusi:**
1. **WAJIB logout dan login kembali** setelah assign role
2. Clear browser cache (Ctrl+Shift+R)
3. Pastikan query verify menampilkan `is_admin_confirmed = true`
4. Periksa console browser untuk error detail

## 💡 Tips

- Gunakan `LIST_ALL_USERS.sql` untuk melihat semua email
- Copy-paste email langsung dari hasil query (hindari typo)
- Pastikan ganti di **2 tempat** di script
- **Selalu logout dan login kembali** setelah assign role

