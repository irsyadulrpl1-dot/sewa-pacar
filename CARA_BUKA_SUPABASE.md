# 🚀 Cara Membuka Supabase Dashboard

## Langkah 1: Buka Website Supabase

1. Buka browser (Chrome, Firefox, Edge, dll)
2. Kunjungi: **https://supabase.com**
3. Klik tombol **"Sign In"** atau **"Login"** di pojok kanan atas

## Langkah 2: Login ke Supabase

- Jika sudah punya akun: Login dengan email dan password
- Jika belum punya akun: Klik **"Sign Up"** untuk membuat akun baru (gratis)

## Langkah 3: Pilih Project

Setelah login, Anda akan melihat daftar project. Pilih project Anda.

**Atau langsung buka project dengan URL:**
```
https://supabase.com/dashboard/project/fsinsidwphcxuqkzsvkk
```
*(Ganti `fsinsidwphcxuqkzsvkk` dengan project ID Anda jika berbeda)*

## Langkah 4: Buka SQL Editor

1. Di sidebar kiri, cari menu **"SQL Editor"**
2. Klik **"SQL Editor"**
3. Anda akan melihat area untuk mengetik SQL

## Langkah 5: Jalankan Migration

1. Buka file **`RUN_THIS_MIGRATION.sql`** di project Anda (bisa di VS Code atau text editor)
2. **Select All** (Ctrl+A) untuk memilih semua isi file
3. **Copy** (Ctrl+C)
4. **Paste** (Ctrl+V) ke SQL Editor di Supabase Dashboard
5. Klik tombol **"RUN"** (atau tekan Ctrl+Enter)
6. Tunggu sampai muncul pesan **"Success"** atau **"Migration completed successfully!"**

## Langkah 6: Verifikasi

1. Di sidebar kiri, klik **"Table Editor"**
2. Cari tabel **"notifications"** → Harus ada!
3. Klik tabel tersebut untuk melihat strukturnya

## Langkah 7: Refresh Browser

1. Kembali ke aplikasi Anda
2. Tekan **F5** atau **Ctrl+R** untuk refresh
3. Error 404 seharusnya sudah hilang!

---

## 📸 Visual Guide

### Tampilan Supabase Dashboard:
```
┌─────────────────────────────────────┐
│  Supabase Dashboard                 │
├─────────────────────────────────────┤
│  [Sidebar]    [Main Content]        │
│  ┌─────────┐  ┌──────────────────┐  │
│  │ Home    │  │                  │  │
│  │ SQL     │  │  SQL Editor      │  │
│  │ Editor  │  │  ┌────────────┐  │  │
│  │ Table   │  │  │ [SQL Code] │  │  │
│  │ Editor  │  │  │            │  │  │
│  │ ...     │  │  └────────────┘  │  │
│  └─────────┘  │  [RUN Button]    │  │
│               └──────────────────┘  │
└─────────────────────────────────────┘
```

---

## ❓ Troubleshooting

### Tidak bisa login?
- Pastikan email dan password benar
- Coba reset password jika lupa
- Gunakan browser yang berbeda

### Tidak melihat project?
- Pastikan Anda login dengan akun yang benar
- Cek apakah project sudah dibuat
- Hubungi admin jika project dibuat oleh orang lain

### SQL Editor tidak muncul?
- Pastikan Anda sudah login
- Pastikan project sudah dipilih
- Coba refresh halaman

---

## 🎯 Quick Access

**URL Langsung ke SQL Editor:**
```
https://supabase.com/dashboard/project/fsinsidwphcxuqkzsvkk/sql/new
```

*(Ganti `fsinsidwphcxuqkzsvkk` dengan project ID Anda)*

