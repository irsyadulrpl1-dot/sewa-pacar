# 🚨 FIX: Error "operator does not exist: text = uuid"

## Error
```
ERROR: 42883: operator does not exist: text = uuid
HINT: No operator matches the given name and argument types. 
You might need to add explicit type casts.
```

## Penyebab
RLS policies di tabel `bookings` masih membandingkan `companion_id` (TEXT) dengan kolom UUID tanpa cast yang benar.

## Solusi CEPAT

### Opsi 1: Fix Komprehensif (RECOMMENDED)
1. Buka Supabase Dashboard → SQL Editor
2. Copy **SEMUA** isi file `FIX_ALL_BOOKINGS_POLICIES.sql`
3. Paste dan klik **Run**

Script ini akan:
- ✅ Memastikan `companion_id` bertipe TEXT
- ✅ Drop semua policies lama
- ✅ Buat ulang semua policies dengan cast yang benar
- ✅ Verifikasi hasil

### Opsi 2: Fix Policies Saja
Jika `companion_id` sudah TEXT tapi policies masih error:
1. Copy **SEMUA** isi file `FIX_RLS_POLICIES.sql`
2. Paste dan klik **Run**

## Verifikasi

Setelah menjalankan script, cek dengan query ini:

```sql
-- 1. Cek tipe companion_id
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'bookings'
  AND column_name = 'companion_id';

-- 2. Cek policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'bookings'
ORDER BY policyname;
```

**Hasil yang diharapkan:**
- `data_type` = `text` ✓
- Ada 7 policies ✓

## Troubleshooting

### Masih Error Setelah Fix?
1. Pastikan script dijalankan lengkap (tidak terpotong)
2. Cek apakah ada policy lain yang belum di-drop:
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'bookings';
   ```
3. Jika masih ada policy lama, drop manual:
   ```sql
   DROP POLICY IF EXISTS "nama_policy" ON public.bookings;
   ```
4. Jalankan `FIX_ALL_BOOKINGS_POLICIES.sql` lagi

### Error: "relation bookings does not exist"
Table belum dibuat. Jalankan `QUICK_FIX_BOOKINGS.sql` terlebih dahulu.

## Setelah Fix Berhasil

1. **Refresh browser** aplikasi (F5)
2. **Coba booking lagi** dari awal
3. Error seharusnya sudah hilang

