# 🚨 Instruksi Migration Notifications - PENTING!

## Error 404: Tabel notifications tidak ditemukan

**Jika Anda melihat error 404 di console browser**, berarti tabel `notifications` belum dibuat di database. **Migration HARUS dijalankan terlebih dahulu!**

## Cara Menjalankan Migration

### Opsi 1: Menggunakan Supabase Dashboard (Paling Mudah)

1. Buka **Supabase Dashboard** → Project Anda
2. Pergi ke **SQL Editor**
3. Buka file migration: `supabase/migrations/20251228000000_create_notifications.sql`
4. Copy semua isi file tersebut
5. Paste ke SQL Editor di Supabase Dashboard
6. Klik **Run** atau tekan `Ctrl+Enter`
7. Pastikan tidak ada error

8. Jika ada migration kedua, jalankan juga: `supabase/migrations/20251228000001_fix_notifications_insert_policy.sql`

### Opsi 2: Menggunakan Supabase CLI

```bash
# Pastikan Anda sudah login
supabase login

# Link ke project Anda
supabase link --project-ref your-project-ref

# Jalankan semua migration yang belum dijalankan
supabase db push

# Atau jalankan migration spesifik
supabase migration up
```

### Opsi 3: Manual SQL Execution

1. Buka Supabase Dashboard → SQL Editor
2. Jalankan migration pertama:

```sql
-- Copy isi dari: supabase/migrations/20251228000000_create_notifications.sql
```

3. Jalankan migration kedua:

```sql
-- Copy isi dari: supabase/migrations/20251228000001_fix_notifications_insert_policy.sql
```

## Verifikasi Migration Berhasil

Setelah migration dijalankan, verifikasi dengan:

1. Buka **Supabase Dashboard** → **Table Editor**
2. Cari tabel `notifications` - harus ada
3. Cek struktur tabel:
   - `id` (UUID)
   - `user_id` (UUID)
   - `type` (enum)
   - `title` (TEXT)
   - `message` (TEXT)
   - `is_read` (BOOLEAN)
   - dll

4. Buka **Authentication** → **Policies**
5. Cari policies untuk tabel `notifications`:
   - "Users can view own notifications"
   - "Users can create own notifications"
   - "Users can update own notifications"
   - "Users can delete own notifications"
   - "Admins can create notifications for any user"

## Test Setelah Migration

1. Refresh browser
2. Buka halaman Notifications (`/notifications`)
3. Error 404 seharusnya sudah hilang
4. Buat payment baru untuk test notifikasi

## Troubleshooting

### Jika masih error 404:
- Pastikan migration benar-benar dijalankan
- Periksa apakah tabel `notifications` ada di Table Editor
- Periksa console browser untuk error detail

### Jika error permission:
- Periksa RLS policies di Authentication → Policies
- Pastikan policies untuk `notifications` sudah dibuat

### Jika error enum:
- Pastikan enum `notification_type` sudah dibuat
- Periksa migration file untuk CREATE TYPE statement

