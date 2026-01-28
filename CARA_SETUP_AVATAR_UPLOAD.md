# 📸 Setup Avatar Upload

## 🎯 Tujuan
Mengaktifkan fitur upload foto profil yang tersimpan di Supabase Storage dan terhubung ke database.

## 📋 Langkah Setup

### 1. Buat Storage Bucket di Supabase

1. Buka **Supabase Dashboard** → **Storage**
2. Klik **New bucket**
3. Isi:
   - **Name**: `avatars`
   - **Public bucket**: ✅ (centang)
4. Klik **Create bucket**

### 2. Atau Jalankan Migration SQL

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Copy **SEMUA** isi file `RUN_AVATAR_STORAGE_MIGRATION.sql`
3. Paste dan klik **Run**

Script ini akan:
- ✅ Membuat bucket `avatars`
- ✅ Membuat RLS policies untuk upload/view/update/delete
- ✅ Verifikasi bucket dan policies

### 3. Verifikasi

Setelah migration, cek:
- ✅ Bucket `avatars` muncul di Storage
- ✅ Policies muncul di Storage → Policies

## 🧪 Test Upload

1. Login ke aplikasi
2. Buka halaman **Profile**
3. Klik area foto profil
4. Pilih foto (JPG, PNG, WebP, max 2MB)
5. Klik **Upload Foto**
6. Foto harus langsung tampil setelah upload

## 🛡️ Validasi File

- **Format**: JPG, PNG, WebP
- **Ukuran**: Max 2MB
- **Otomatis**: Validasi dilakukan sebelum upload

## 🔄 Sinkronisasi

Setelah upload berhasil:
- ✅ URL tersimpan di database (`profiles.avatar_url`)
- ✅ Avatar tampil di:
  - Halaman Profile
  - Navbar (jika ada)
  - Account Settings Menu
  - Companion Cards
  - Semua komponen yang menggunakan `avatar_url`

## 🐛 Troubleshooting

### Error: "Bucket not found"
**Solusi**: Pastikan bucket `avatars` sudah dibuat di Storage

### Error: "Permission denied"
**Solusi**: Pastikan RLS policies sudah dibuat dengan benar

### Error: "File too large"
**Solusi**: Gunakan foto < 2MB

### Error: "Format not supported"
**Solusi**: Gunakan JPG, PNG, atau WebP

### Foto tidak tampil setelah upload
**Solusi**:
1. Refresh halaman (F5)
2. Cek apakah `avatar_url` ter-update di database
3. Cek console browser untuk error

## ✅ Checklist

- [ ] Bucket `avatars` sudah dibuat
- [ ] RLS policies sudah dibuat
- [ ] Bisa upload foto dari Profile page
- [ ] Foto tersimpan di Storage
- [ ] `avatar_url` ter-update di database
- [ ] Foto tampil di Profile page
- [ ] Foto tampil di Navbar (jika ada)
- [ ] Foto tampil di komponen lain

## 📝 Catatan

- Foto lama akan otomatis dihapus saat upload foto baru
- Format file: `avatars/{userId}-{timestamp}.{ext}`
- Bucket bersifat public, jadi URL bisa diakses langsung
- Avatar akan otomatis update di seluruh aplikasi setelah upload

