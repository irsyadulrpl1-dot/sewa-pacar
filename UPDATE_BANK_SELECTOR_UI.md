# 🏦 Update Bank Selector UI - Grid Layout dengan Search

## Perubahan yang Dilakukan

### 1. Search Bar ✅
- Menambahkan search bar dengan icon Search
- Filter bank berdasarkan nama bank atau nomor rekening
- Placeholder: "Cari bank Anda"
- Real-time filtering saat user mengetik

### 2. Grid Layout ✅
- **Sebelum**: List vertikal dengan card horizontal
- **Sesudah**: Grid 2 kolom (mobile) / 3 kolom (desktop)
- Setiap bank ditampilkan sebagai card dengan:
  - Logo bank besar di tengah (emoji)
  - Nama bank di bawah logo
  - Checkmark indicator saat dipilih
  - Hover effect dengan scale dan lift

### 3. Visual Improvements ✅
- **Bank Colors**: Setiap bank memiliki warna khas:
  - BCA: Biru (bg-blue-50, text-blue-700)
  - BRI: Hijau (bg-green-50, text-green-700)
  - Mandiri: Merah (bg-red-50, text-red-700)
- **Logo Icons**: Emoji yang berbeda untuk setiap bank
- **Selected State**: Border primary, shadow, dan background color sesuai bank

### 4. User Experience ✅
- Grid layout lebih mudah di-scan
- Search membantu jika banyak bank
- Visual feedback jelas saat bank dipilih
- Animasi halus saat hover dan select

## File yang Diubah

1. ✅ `src/components/payments/BankSelector.tsx` - Complete redesign

## Fitur Baru

- ✅ Search bar untuk mencari bank
- ✅ Grid layout (2 kolom mobile, 3 kolom desktop)
- ✅ Bank colors untuk visual distinction
- ✅ Better logo representation
- ✅ Empty state jika tidak ada hasil search

## Testing

1. Buka halaman pembayaran
2. Pilih metode "Transfer Bank"
3. **Pastikan**:
   - Search bar muncul di atas grid
   - Grid bank tampil dengan logo dan nama
   - Klik bank → detail rekening muncul
   - Test search → filter bank sesuai query
   - Warna bank berbeda untuk visual distinction

