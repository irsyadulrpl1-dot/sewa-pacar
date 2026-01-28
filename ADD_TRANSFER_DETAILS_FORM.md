# 💳 Form Informasi Transfer Pengirim

## Fitur Baru

Menambahkan form input di halaman instruksi pembayaran agar user dapat mengisi informasi transfer mereka sendiri. Ini membantu admin mengetahui detail transfer untuk verifikasi.

## Form Fields

### 1. Nomor Rekening / Kartu Pengirim
- **Label**: "Nomor Rekening / Kartu Pengirim" (untuk bank) atau "Nomor {WalletName} / Kartu Pengirim" (untuk e-wallet)
- **Placeholder**: "Contoh: 1234567890" atau "Contoh: 081234567890"
- **Icon**: CreditCard
- **Validasi**: Text input, user bisa isi nomor rekening/kartu mereka

### 2. Nama Pengirim
- **Label**: "Nama Pengirim"
- **Placeholder**: "Nama sesuai rekening/kartu" atau "Nama sesuai akun/kartu"
- **Icon**: User
- **Validasi**: Text input, nama sesuai dengan rekening/kartu

### 3. Jumlah Transfer
- **Label**: "Jumlah Transfer"
- **Placeholder**: Format currency (Rp 280.000)
- **Icon**: DollarSign
- **Validasi**: Hanya angka, auto-format
- **Default**: Jumlah sesuai paket yang dipilih
- **Catatan**: User bisa mengisi jumlah yang berbeda jika ada penyesuaian

## Alur Data

1. **User mengisi form** → Data disimpan di state `transferDetails`
2. **Saat create payment** → Data ditambahkan ke `booking_details.transfer_details` dan `notes`
3. **Admin melihat** → Data ditampilkan di halaman Admin Payments dengan format yang jelas

## Format Data

### Di Database (booking_details JSONB):
```json
{
  "companion_name": "Sinta Dewi",
  "package_name": "Coffee Date",
  "package_duration": "3 jam",
  "transfer_details": {
    "sender_account_number": "1234567890",
    "sender_name": "John Doe",
    "transfer_amount": 280000
  }
}
```

### Di Notes (untuk backward compatibility):
```
--- Informasi Transfer ---
Rek/Kartu Pengirim: 1234567890
Nama Pengirim: John Doe
Jumlah Transfer: Rp 280.000
```

## Tampilan di Admin Panel

Admin akan melihat:
- **Card khusus** dengan background primary/5 dan border primary/20
- **Judul**: "Informasi Transfer Pengirim"
- **Detail dalam format tabel**:
  - Rek/Kartu Pengirim: [nomor]
  - Nama Pengirim: [nama]
  - Jumlah Transfer: [jumlah dengan format currency]

## File yang Diubah

1. ✅ `src/components/payments/BankSelector.tsx`
   - Menambahkan form input transfer details
   - Props `onTransferDetailsChange` untuk callback

2. ✅ `src/components/payments/EWalletQR.tsx`
   - Menambahkan form input transfer details
   - Props `onTransferDetailsChange` untuk callback

3. ✅ `src/components/payments/PaymentInstructions.tsx`
   - Pass `onTransferDetailsChange` ke BankSelector dan EWalletQR

4. ✅ `src/components/payments/BookingPaymentDialog.tsx`
   - State `transferDetails` untuk menyimpan data form
   - Menggabungkan transfer details ke notes dan booking_details saat create payment
   - Reset transfer details saat dialog ditutup

5. ✅ `src/hooks/usePayments.ts`
   - Update interface `Payment` dan `CreatePaymentData` untuk support `transfer_details`

6. ✅ `src/pages/AdminPayments.tsx`
   - Menampilkan transfer details dari booking_details dengan card khusus
   - Format yang jelas dan mudah dibaca

## Testing Checklist

- [ ] Form muncul di halaman instruksi pembayaran (bank transfer)
- [ ] Form muncul di halaman instruksi pembayaran (e-wallet)
- [ ] User bisa mengisi nomor rekening/kartu pengirim
- [ ] User bisa mengisi nama pengirim
- [ ] User bisa mengisi jumlah transfer (default sesuai paket)
- [ ] Data tersimpan saat create payment
- [ ] Admin bisa melihat transfer details di admin panel
- [ ] Format tampilan di admin panel jelas dan mudah dibaca
- [ ] Data tidak hilang saat refresh

## Manfaat

✅ **Admin lebih mudah verifikasi**: Tahu dari siapa transfer datang
✅ **Mengurangi kesalahan**: Nomor rekening dan nama jelas
✅ **Fleksibel**: User bisa isi jumlah yang berbeda jika ada penyesuaian
✅ **Transparan**: Semua informasi transfer tercatat dengan jelas

