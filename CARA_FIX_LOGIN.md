# 🔧 CARA MEMPERBAIKI MASALAH LOGIN

## ❌ Masalah: "Email belum terverifikasi"

Jika Anda melihat error ini saat login, berarti **Email Verification masih aktif** di Supabase.

## ✅ SOLUSI (Pilih salah satu):

### Opsi 1: Nonaktifkan Email Verification (Paling Mudah)

1. Buka: https://supabase.com/dashboard
2. Login dan pilih project Anda
3. Klik **Authentication** → **Settings**
4. Scroll ke **Email Auth**
5. **HAPUS CENTANG** "Enable email confirmations"
6. Klik **Save**
7. **SELESAI!** Sekarang bisa langsung login tanpa verifikasi email

### Opsi 2: Gunakan Fitur Resend Email (Jika tetap ingin verifikasi)

1. Saat login dan muncul error "Email belum terverifikasi"
2. Akan muncul tombol **"Kirim Ulang Email Verifikasi"**
3. Klik tombol tersebut
4. Cek email Anda (termasuk folder spam)
5. Klik link verifikasi di email
6. Setelah itu bisa login

### Opsi 3: Aktifkan Auto-confirm (Rekomendasi)

1. Buka Supabase Dashboard
2. Authentication → Settings → Email Auth
3. ✅ Centang "Enable email confirmations"
4. ✅ Centang **"Auto-confirm users"** ← PENTING!
5. Klik Save

Dengan ini, email tetap dikirim tapi user langsung bisa login.

## 🎯 Rekomendasi untuk Development

**Gunakan Opsi 1** (Nonaktifkan Email Verification) untuk kemudahan testing.

## 📝 Catatan

- Setelah mengubah pengaturan, **restart development server**
- **Clear browser cache** (Ctrl+Shift+R)
- Test dengan **email baru** untuk memastikan perubahan berhasil

## 🆘 Masih Gagal?

1. Pastikan sudah **restart server** setelah mengubah pengaturan
2. **Clear localStorage** di browser (F12 → Application → Local Storage → Clear)
3. Coba dengan **email yang benar-benar baru**
4. Periksa **Console browser** (F12) untuk error detail

