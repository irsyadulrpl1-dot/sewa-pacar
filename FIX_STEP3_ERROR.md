# 🔧 Fix Step 3 Error - Troubleshooting Guide

## Masalah
Saat sampai di Step 3 (Detail Pemesanan), tidak bisa melanjutkan dan muncul error.

## Perbaikan yang Sudah Dilakukan

### 1. Validasi yang Lebih Detail
- ✅ Validasi semua field dengan error message spesifik
- ✅ Validasi durasi > 0
- ✅ Validasi totalAmount > 0
- ✅ Auto-recalculate total amount jika perlu

### 2. Error Handling yang Lebih Baik
- ✅ Error message yang jelas dan spesifik
- ✅ Console logging untuk debugging
- ✅ Toast notification dengan durasi lebih lama (5 detik)

### 3. Validasi di canGoNext
- ✅ Step 3 sekarang memvalidasi semua data sebelum enable button
- ✅ Logging untuk debugging

### 4. UI Feedback
- ✅ Warning message di Step 3 jika data belum lengkap
- ✅ Visual indicator yang jelas

## Kemungkinan Penyebab Error

### 1. Database Table Belum Dibuat
**Error**: `Could not find the table 'public.bookings'`

**Solusi**:
1. Buka Supabase Dashboard → SQL Editor
2. Run file `RUN_BOOKING_MIGRATION.sql`
3. Atau run migration: `supabase/migrations/20251227000002_create_bookings_table.sql`

### 2. RLS Policy Blocking
**Error**: `new row violates row-level security policy`

**Solusi**:
- Pastikan RLS policies sudah dibuat di migration
- Pastikan user sudah login
- Cek policy "Users can create own bookings" di Supabase Dashboard

### 3. Data Tidak Valid
**Error**: `Lengkapi semua data pemesanan`

**Solusi**:
- Pastikan semua field sudah diisi:
  - ✅ Companion dipilih
  - ✅ Package dipilih (Step 1)
  - ✅ Tanggal dipilih (Step 2)
  - ✅ Jam dipilih (Step 2)
  - ✅ Durasi dipilih dan > 0 (Step 2)

### 4. Total Amount = 0
**Error**: `Total pembayaran tidak valid`

**Solusi**:
- Sistem akan auto-recalculate total amount
- Jika masih error, cek `hourlyRate` di companion data
- Pastikan `duration > 0`

## Debugging Steps

### 1. Cek Browser Console
Buka Developer Tools (F12) → Console, cari:
- `"Creating booking with payload:"`
- `"Step 3 validation failed:"`
- `"Error creating booking:"`

### 2. Cek Network Tab
- Lihat request ke Supabase
- Cek response error dari API

### 3. Cek Database
```sql
-- Cek apakah table bookings ada
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'bookings';

-- Cek RLS policies
SELECT * FROM pg_policies WHERE tablename = 'bookings';
```

## Testing Checklist

- [ ] Step 1: Pilih paket → Next enabled
- [ ] Step 2: Pilih tanggal, jam, durasi → Next enabled
- [ ] Step 3: 
  - [ ] Semua data terlihat di summary
  - [ ] Total amount terhitung dengan benar
  - [ ] Button "Lanjutkan ke Pembayaran" enabled
  - [ ] Klik button → Booking created successfully
  - [ ] Auto proceed ke Step 4

## Error Messages yang Mungkin Muncul

1. **"Data belum lengkap: Tanggal belum dipilih"**
   → Kembali ke Step 2, pilih tanggal

2. **"Durasi belum dipilih atau tidak valid"**
   → Kembali ke Step 2, pilih durasi (klik button atau dropdown)

3. **"Tabel bookings belum dibuat"**
   → Run database migration

4. **"Tidak memiliki izin untuk membuat pemesanan"**
   → Cek RLS policies, pastikan user sudah login

5. **"Total pembayaran tidak valid"**
   → Sistem akan auto-recalculate, refresh halaman jika perlu

## Quick Fix

Jika masih error setelah semua perbaikan:

1. **Refresh halaman** dan coba lagi
2. **Cek console** untuk error message spesifik
3. **Run migration** jika table belum ada
4. **Cek RLS policies** di Supabase Dashboard
5. **Pastikan user sudah login**

## Support

Jika masih ada masalah:
1. Screenshot error message
2. Cek browser console untuk error details
3. Cek Supabase logs untuk database errors

