# Cara Mengaktifkan Signup di Supabase

Error "Signups not allowed for this instance" terjadi karena signup dinonaktifkan di Supabase Dashboard.

## Langkah-langkah Mengaktifkan Signup:

### 1. Buka Supabase Dashboard
- Login ke [https://app.supabase.com](https://app.supabase.com)
- Pilih project Anda

### 2. Navigasi ke Authentication Settings
- Klik menu **Authentication** di sidebar kiri
- Klik **Settings** (ikon gear) di bagian atas

### 3. Aktifkan Email Signup
- Scroll ke bagian **"Email Auth"**
- Pastikan **"Enable email signup"** diaktifkan (toggle ON)
- Jika menggunakan email confirmation:
  - **"Enable email confirmations"** bisa diaktifkan atau dinonaktifkan
  - Jika diaktifkan, user harus verifikasi email sebelum bisa login
  - Jika dinonaktifkan, user bisa langsung login setelah registrasi

### 4. Simpan Perubahan
- Scroll ke bawah dan klik **"Save"**

### 5. Verifikasi
- Coba registrasi lagi di aplikasi
- Jika masih error, pastikan:
  - Project URL dan API Key sudah benar di `.env`
  - Tidak ada RLS policy yang memblokir signup
  - Database trigger `handle_new_user()` sudah ada

## Konfigurasi Tambahan (Opsional):

### Disable Email Confirmation (untuk development)
Jika ingin user langsung bisa login tanpa verifikasi email:
1. Authentication > Settings
2. Disable **"Enable email confirmations"**
3. Save

### Enable Magic Link (Opsional)
Untuk login tanpa password:
1. Authentication > Settings
2. Enable **"Enable magic link"**
3. Save

## Troubleshooting:

### Jika masih error setelah mengaktifkan signup:
1. **Cek Environment Variables**
   - Pastikan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` sudah benar
   - File `.env` harus ada di root project

2. **Cek Database Triggers**
   - Pastikan trigger `on_auth_user_created` sudah ada
   - Jalankan migration jika belum

3. **Cek RLS Policies**
   - Pastikan tidak ada policy yang memblokir INSERT ke tabel `profiles`
   - Policy untuk `profiles` harus mengizinkan INSERT untuk user baru

4. **Clear Browser Cache**
   - Clear cache dan cookies
   - Hard refresh (Ctrl+Shift+R atau Cmd+Shift+R)

## Catatan Penting:
- Setelah mengaktifkan signup, semua user bisa mendaftar
- Untuk production, pertimbangkan untuk menambahkan:
  - Rate limiting
  - Email verification
  - CAPTCHA untuk mencegah spam

