# 🚨 FIX: Table 'bookings' Tidak Ditemukan

## Error
```
Could not find the table 'public.bookings' in the schema cache
```

## Penyebab
Table `bookings` belum dibuat di database Supabase.

## Solusi CEPAT

### Langkah 1: Buka Supabase Dashboard
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri

### Langkah 2: Run Migration Script
1. Klik **New Query**
2. Copy **SEMUA** isi file `QUICK_FIX_BOOKINGS.sql`
3. Paste di SQL Editor
4. Klik **Run** (atau tekan Ctrl+Enter)

### Langkah 3: Fix companion_id Type (Jika Table Sudah Ada)
Jika table sudah dibuat sebelumnya dengan `companion_id UUID`, jalankan:
1. Copy **SEMUA** isi file `FIX_BOOKINGS_COMPANION_ID.sql`
2. Paste di SQL Editor
3. Klik **Run**

Ini akan mengubah `companion_id` dari UUID menjadi TEXT untuk support string IDs seperti "luna-salsabila".

### Langkah 3.5: Fix RLS Policies (Jika Error "operator does not exist: text = uuid")
Jika setelah menjalankan migration muncul error tentang operator, jalankan:
1. Copy **SEMUA** isi file `FIX_RLS_POLICIES.sql`
2. Paste di SQL Editor
3. Klik **Run**

Ini akan memperbaiki RLS policies untuk handle TEXT companion_id dengan benar.

### Langkah 4: Verify
Jalankan query ini untuk memastikan table sudah dibuat:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'bookings'
AND column_name = 'companion_id';
```

Jika `data_type` adalah `text`, berarti sudah benar!

## File yang Perlu Dijalankan

**File**: `RUN_BOOKING_MIGRATION.sql`

Copy isi file tersebut dan paste di Supabase SQL Editor, lalu klik Run.

## Troubleshooting

### Error: "type booking_status already exists"
**Solusi**: Hapus baris yang membuat enum, atau gunakan `DO $$ BEGIN ... END $$` untuk check.

### Error: "policy already exists"
**Solusi**: Script sudah menggunakan `DROP POLICY IF EXISTS`, jadi aman dijalankan ulang.

### Error: "function update_updated_at_column does not exist"
**Solusi**: Script sudah handle dengan `DO $$ BEGIN ... END $$` untuk check function existence.

## Setelah Migration Berhasil

1. **Refresh browser** aplikasi Anda
2. **Coba booking lagi** dari awal
3. Step 3 seharusnya sudah bisa lanjut ke Step 4

## Verifikasi Lengkap

Jalankan query ini untuk memastikan semua sudah benar:

```sql
-- 1. Cek table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'bookings';

-- 2. Cek columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'bookings'
ORDER BY ordinal_position;

-- 3. Cek RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'bookings';

-- 4. Cek policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'bookings';
```

Jika semua query berhasil, berarti migration sudah benar!

