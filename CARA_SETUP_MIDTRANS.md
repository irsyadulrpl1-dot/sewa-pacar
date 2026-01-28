# 🚀 Cara Setup Midtrans Payment Gateway

## Langkah 1: Daftar Akun Midtrans

1. Buka [Midtrans Dashboard](https://dashboard.midtrans.com/)
2. Daftar akun baru atau login
3. Pilih **Sandbox** untuk testing atau **Production** untuk live

## Langkah 2: Dapatkan API Keys

1. Di Dashboard, buka **Settings** → **Access Keys**
2. Copy **Client Key** dan **Server Key**
3. Simpan dengan aman (Server Key jangan di-share!)

## Langkah 3: Setup Environment Variables

### Frontend (.env)
Tambahkan ke file `.env` di root project:
```env
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
VITE_MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
VITE_MIDTRANS_PRODUCTION=false
```

**Catatan:**
- Untuk **Sandbox**: `VITE_MIDTRANS_PRODUCTION=false`
- Untuk **Production**: `VITE_MIDTRANS_PRODUCTION=true`
- Restart dev server setelah update `.env`

### Backend (Supabase Secrets)
1. Buka Supabase Dashboard → **Edge Functions** → **Settings** → **Secrets**
2. Tambahkan secrets:
   - `MIDTRANS_SERVER_KEY`: Server key dari Midtrans
   - `MIDTRANS_PRODUCTION`: `false` (sandbox) atau `true` (production)
   - `SITE_URL`: URL aplikasi Anda (contoh: `https://your-app.com`)

## Langkah 4: Run Database Migration

1. Buka Supabase Dashboard → **SQL Editor**
2. Copy isi file `RUN_MIDTRANS_MIGRATION.sql`
3. Paste dan klik **Run**
4. Pastikan tidak ada error

## Langkah 5: Deploy Edge Function

### Opsi A: Menggunakan Supabase CLI (Recommended)

```bash
# Install Supabase CLI (jika belum)
npm install -g supabase

# Login ke Supabase
supabase login

# Link ke project Anda
supabase link --project-ref your-project-ref

# Deploy function
supabase functions deploy midtrans-create-transaction
```

### Opsi B: Manual Upload

1. Buka Supabase Dashboard → **Edge Functions**
2. Klik **Create a new function**
3. Nama: `midtrans-create-transaction`
4. Copy isi file `supabase/functions/midtrans-create-transaction/index.ts`
5. Paste dan klik **Deploy**

## Langkah 6: Test Integration

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Test flow:**
   - Login ke aplikasi
   - Pilih companion dan package
   - Pilih metode: **"Transfer Bank (Terintegrasi)"**
   - Form Midtrans harus muncul
   - Test dengan kartu test dari [Midtrans Testing](https://docs.midtrans.com/docs/testing-payment-gateway)

## Testing dengan Kartu Test

### Bank Transfer Test
- **BCA Virtual Account**: Pilih BCA, gunakan nomor VA yang muncul
- **Mandiri Virtual Account**: Pilih Mandiri, gunakan nomor VA yang muncul
- **BRI Virtual Account**: Pilih BRI, gunakan nomor VA yang muncul

### E-Wallet Test
- **GoPay**: Gunakan nomor test dari dokumentasi Midtrans
- **DANA**: Gunakan nomor test dari dokumentasi Midtrans

## Troubleshooting

### ❌ Error: "Payment gateway tidak dikonfigurasi"
**Solusi:**
- Pastikan `VITE_MIDTRANS_CLIENT_KEY` sudah di-set di `.env`
- Restart dev server: `npm run dev`

### ❌ Error: "Gagal membuat transaksi"
**Solusi:**
- Cek Edge Function logs di Supabase Dashboard
- Pastikan `MIDTRANS_SERVER_KEY` sudah di-set di Supabase Secrets
- Pastikan format amount benar (number, bukan string)

### ❌ Snap form tidak muncul
**Solusi:**
- Buka browser console (F12) dan cek error
- Pastikan Snap script ter-load (cek Network tab)
- Pastikan Client Key benar dan sesuai environment (sandbox/production)

### ❌ CORS Error
**Solusi:**
- Pastikan Edge Function sudah di-deploy dengan benar
- Cek CORS headers di Edge Function code

## Production Checklist

Sebelum go live, pastikan:

- [ ] Ganti ke Production environment di Midtrans Dashboard
- [ ] Update `VITE_MIDTRANS_PRODUCTION=true` di `.env`
- [ ] Update `MIDTRANS_PRODUCTION=true` di Supabase Secrets
- [ ] Update `SITE_URL` di Supabase Secrets dengan URL production
- [ ] Test dengan transaksi real (amount kecil dulu)
- [ ] Setup webhook untuk update status otomatis (opsional)
- [ ] Monitor logs dan error handling

## Security Notes

⚠️ **PENTING:**
- ❌ Jangan commit `.env` file ke Git
- ❌ Server Key hanya digunakan di backend (Edge Function)
- ✅ Client Key aman untuk digunakan di frontend
- ✅ Selalu validasi payment status di backend sebelum update database

## Support

Jika ada masalah:
1. Cek [Midtrans Documentation](https://docs.midtrans.com/)
2. Cek logs di Supabase Dashboard → Edge Functions → Logs
3. Cek browser console untuk error frontend

