# 🎯 Booking Wizard System - Setup Guide

## Overview

Sistem pemesanan multi-step (wizard) yang profesional dan user-friendly dengan 7 langkah terstruktur.

## Fitur Utama

✅ **7-Step Wizard Flow**
- Step 1: Pilih Layanan
- Step 2: Pilih Tanggal & Jam
- Step 3: Detail Pemesanan
- Step 4: Metode Pembayaran
- Step 5: Proses Pembayaran
- Step 6: Konfirmasi Pembayaran
- Step 7: Booking Berhasil

✅ **Progress Indicator** - Visual progress bar dengan step indicators
✅ **Validasi Real-time** - Validasi di setiap step
✅ **UI Modern** - Clean, minimal, Gen Z-friendly design
✅ **Responsive** - Mobile & desktop friendly
✅ **Real-time Updates** - Status pembayaran update otomatis

## Database Setup

### 1. Run Migration

Buka Supabase Dashboard → **SQL Editor** → Run file `RUN_BOOKING_MIGRATION.sql`

Atau jalankan migration file:
```sql
-- File: supabase/migrations/20251227000002_create_bookings_table.sql
```

### 2. Verify Table Created

```sql
SELECT * FROM public.bookings LIMIT 1;
```

## Struktur Komponen

```
src/components/booking/
├── BookingWizard.tsx          # Main wizard component
└── steps/
    ├── Step1ServiceSelection.tsx
    ├── Step2DateTimeSelection.tsx
    ├── Step3BookingDetails.tsx
    ├── Step4PaymentMethod.tsx
    ├── Step5PaymentProcess.tsx
    ├── Step6PaymentConfirmation.tsx
    └── Step7BookingSuccess.tsx
```

## Hooks

### `useBooking`

Hook untuk manage booking state dan operations:

```typescript
const {
  bookingData,           // Current booking data
  updateBookingData,     // Update booking data
  resetBooking,          // Reset booking state
  createBooking,         // Create booking in database
  updateBookingStatus,   // Update booking status
  linkPaymentToBooking,  // Link payment to booking
  isLoading,             // Loading state
} = useBooking();
```

## Alur Booking

1. **User klik "Booking"** → Open BookingWizard
2. **Step 1**: User pilih paket layanan
3. **Step 2**: User pilih tanggal, jam, dan durasi
4. **Step 3**: User review detail & tambah catatan
5. **Step 4**: User pilih metode pembayaran
6. **Step 5**: User selesaikan pembayaran
7. **Step 6**: System konfirmasi status pembayaran
8. **Step 7**: Success page dengan detail booking

## Integrasi

### Di CompanionProfile

```typescript
import { BookingWizard } from "@/components/booking/BookingWizard";

<BookingWizard
  open={isBookingWizardOpen}
  onOpenChange={setIsBookingWizardOpen}
  companion={{
    id: companion.id,
    name: companion.name,
    image: companion.image,
    city: companion.city,
    hourlyRate: companion.hourlyRate,
    packages: companion.packages,
  }}
  onSuccess={handleBookingSuccess}
/>
```

## Database Schema

### `bookings` Table

```sql
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  companion_id UUID NOT NULL,
  package_name TEXT NOT NULL,
  package_duration TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_hours INTEGER NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  status booking_status DEFAULT 'pending',
  notes TEXT,
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Booking Status

- `pending` - Menunggu konfirmasi
- `confirmed` - Dikonfirmasi oleh admin/companion
- `cancelled` - Dibatalkan
- `completed` - Selesai

## Validasi

### Step 1: Service Selection
- ✅ Package harus dipilih

### Step 2: Date & Time
- ✅ Tanggal harus dipilih (tidak boleh masa lalu)
- ✅ Jam mulai harus dipilih
- ✅ Durasi harus dipilih (1-8 jam)

### Step 3: Booking Details
- ✅ Auto-calculate total amount
- ✅ Notes optional

### Step 4: Payment Method
- ✅ Payment method harus dipilih

### Step 5: Payment Process
- ✅ Payment record dibuat
- ✅ Payment linked ke booking

## UI/UX Features

### Progress Indicator
- Visual progress bar (0-100%)
- Step numbers dengan checkmarks
- Active step highlighted
- Completed steps marked

### Navigation
- **Back Button** - Kembali ke step sebelumnya
- **Next Button** - Lanjut ke step berikutnya
- **Disabled States** - Button disabled jika data belum lengkap

### Animations
- Smooth transitions antar step
- Framer Motion animations
- Loading states

## Error Handling

- ✅ Validasi di setiap step
- ✅ Error messages yang jelas
- ✅ Toast notifications
- ✅ Graceful error recovery

## Testing Checklist

- [ ] Step 1: Pilih paket → Next enabled
- [ ] Step 2: Pilih tanggal, jam, durasi → Next enabled
- [ ] Step 3: Review detail → Create booking
- [ ] Step 4: Pilih payment method → Next enabled
- [ ] Step 5: Complete payment → Auto proceed
- [ ] Step 6: Check payment status → Show correct status
- [ ] Step 7: Success page → Show booking details
- [ ] Back button works on all steps
- [ ] Progress indicator updates correctly
- [ ] Mobile responsive
- [ ] Error handling works

## Troubleshooting

### Error: "Lengkapi semua data pemesanan"
**Solusi**: Pastikan semua field di Step 1-2 sudah diisi

### Error: "Gagal membuat pemesanan"
**Solusi**: 
- Cek database connection
- Pastikan user sudah login
- Cek RLS policies

### Progress indicator tidak update
**Solusi**: Pastikan `currentStep` state ter-update dengan benar

### Payment tidak ter-link ke booking
**Solusi**: Pastikan `linkPaymentToBooking` dipanggil setelah payment dibuat

## Next Steps

1. ✅ Run database migration
2. ✅ Test booking flow end-to-end
3. ✅ Setup notifications untuk booking updates
4. ✅ Create admin dashboard untuk manage bookings
5. ✅ Add booking history page untuk users

## Support

Jika ada masalah:
1. Cek browser console untuk errors
2. Cek Supabase logs
3. Verify RLS policies
4. Check database schema

