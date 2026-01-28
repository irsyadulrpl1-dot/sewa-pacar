# 💳 Setup Midtrans Payment Gateway Integration

## Overview

Integrasi Midtrans memungkinkan user melakukan pembayaran bank transfer langsung di aplikasi tanpa perlu membuka aplikasi mobile banking.

## Prerequisites

1. **Akun Midtrans**
   - Daftar di [Midtrans Dashboard](https://dashboard.midtrans.com/)
   - Dapatkan **Client Key** dan **Server Key**
   - Pilih environment: **Sandbox** (untuk testing) atau **Production**

2. **Environment Variables**
   Tambahkan ke file `.env`:
   ```env
   VITE_MIDTRANS_CLIENT_KEY=your_client_key_here
   VITE_MIDTRANS_SERVER_KEY=your_server_key_here
   VITE_MIDTRANS_PRODUCTION=false  # true untuk production
   ```

## Setup Backend (Supabase Edge Function)

### 1. Buat Edge Function di Supabase

1. Buka Supabase Dashboard → **Edge Functions**
2. Klik **Create a new function**
3. Nama function: `midtrans-create-transaction`
4. Copy kode berikut:

```typescript
// supabase/functions/midtrans-create-transaction/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MIDTRANS_SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY");
const MIDTRANS_IS_PRODUCTION = Deno.env.get("MIDTRANS_PRODUCTION") === "true";
const MIDTRANS_BASE_URL = MIDTRANS_IS_PRODUCTION
  ? "https://app.midtrans.com"
  : "https://app.sandbox.midtrans.com";

serve(async (req) => {
  try {
    // CORS headers
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "authorization, content-type",
        },
      });
    }

    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { payment_id, amount, customer_name, customer_email, item_name } = await req.json();

    if (!payment_id || !amount || !customer_email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate order ID
    const orderId = `PAY-${payment_id.substring(0, 8)}-${Date.now()}`;

    // Create Midtrans transaction
    const midtransResponse = await fetch(`${MIDTRANS_BASE_URL}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Basic ${btoa(MIDTRANS_SERVER_KEY + ":")}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        customer_details: {
          first_name: customer_name.split(" ")[0] || customer_name,
          last_name: customer_name.split(" ").slice(1).join(" ") || "",
          email: customer_email,
        },
        item_details: [
          {
            id: payment_id,
            price: amount,
            quantity: 1,
            name: item_name || "Booking Payment",
          },
        ],
        callbacks: {
          finish: `${Deno.env.get("SITE_URL") || "http://localhost:8080"}/payment/callback?payment_id=${payment_id}`,
        },
      }),
    });

    if (!midtransResponse.ok) {
      const errorText = await midtransResponse.text();
      console.error("Midtrans error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to create transaction" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const midtransData = await midtransResponse.json();
    const token = midtransData.token;

    // Update payment record with order_id
    const { error: updateError } = await supabaseClient
      .from("payments")
      .update({
        notes: JSON.stringify({
          midtrans_order_id: orderId,
          midtrans_token: token,
        }),
      })
      .eq("id", payment_id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating payment:", updateError);
    }

    return new Response(
      JSON.stringify({ token, order_id: orderId }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

### 2. Deploy Edge Function

```bash
# Install Supabase CLI (jika belum)
npm install -g supabase

# Login ke Supabase
supabase login

# Link ke project
supabase link --project-ref your-project-ref

# Deploy function
supabase functions deploy midtrans-create-transaction
```

### 3. Set Environment Variables di Supabase

Di Supabase Dashboard → **Edge Functions** → **Settings** → **Secrets**:
- `MIDTRANS_SERVER_KEY`: Server key dari Midtrans
- `MIDTRANS_PRODUCTION`: `false` (sandbox) atau `true` (production)
- `SITE_URL`: URL aplikasi Anda (untuk callback)

## Setup Webhook (Opsional)

Untuk update status otomatis, setup webhook di Midtrans Dashboard:

1. Buka **Settings** → **Configuration** → **Payment Notification**
2. Set **Payment Notification URL**: `https://your-project.supabase.co/functions/v1/midtrans-webhook`
3. Buat Edge Function `midtrans-webhook` untuk handle notification

## Database Migration

Tambahkan method baru ke enum:

```sql
-- Update payment_method enum
ALTER TYPE public.payment_method ADD VALUE IF NOT EXISTS 'bank_transfer_integrated';
```

## Testing

1. **Sandbox Testing**
   - Gunakan kartu test dari [Midtrans Testing](https://docs.midtrans.com/docs/testing-payment-gateway)
   - Test dengan berbagai bank: BCA, Mandiri, BRI, dll

2. **Flow Testing**
   - User pilih "Transfer Bank (Terintegrasi)"
   - Form Midtrans muncul
   - User pilih bank dan selesaikan pembayaran
   - Status otomatis update ke "approved"

## Troubleshooting

### Error: "Payment gateway tidak dikonfigurasi"
- Pastikan `VITE_MIDTRANS_CLIENT_KEY` sudah di-set di `.env`
- Restart dev server setelah update `.env`

### Error: "Gagal membuat transaksi"
- Cek Edge Function logs di Supabase Dashboard
- Pastikan `MIDTRANS_SERVER_KEY` sudah di-set di Supabase Secrets
- Pastikan format amount benar (number, bukan string)

### Snap form tidak muncul
- Cek browser console untuk error
- Pastikan Snap script ter-load (cek Network tab)
- Pastikan Client Key benar

## Production Checklist

- [ ] Ganti ke Production environment di Midtrans
- [ ] Update `VITE_MIDTRANS_PRODUCTION=true` di `.env`
- [ ] Update `MIDTRANS_PRODUCTION=true` di Supabase Secrets
- [ ] Setup webhook untuk production
- [ ] Test dengan transaksi real (amount kecil)
- [ ] Monitor logs dan error handling

## Security Notes

⚠️ **PENTING**: 
- Jangan commit `.env` file ke Git
- Server Key hanya digunakan di backend (Edge Function)
- Client Key aman untuk digunakan di frontend
- Selalu validasi payment status di backend sebelum update database

