// @ts-nocheck
// Supabase Edge Function: Create Midtrans Transaction
// This function creates a Snap token for Midtrans payment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MIDTRANS_SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY");
const MIDTRANS_IS_PRODUCTION = Deno.env.get("MIDTRANS_PRODUCTION") === "true";
const MIDTRANS_BASE_URL = MIDTRANS_IS_PRODUCTION
  ? "https://app.midtrans.com"
  : "https://app.sandbox.midtrans.com";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    // Validate Midtrans config
    if (!MIDTRANS_SERVER_KEY) {
      return new Response(
        JSON.stringify({ error: "Midtrans server key not configured" }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
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
        { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { payment_id, amount, customer_name, customer_email, item_name } = body;

    if (!payment_id || !amount || !customer_email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: payment_id, amount, customer_email" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Verify payment belongs to user
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .select("id, amount, status")
      .eq("id", payment_id)
      .eq("user_id", user.id)
      .single();

    if (paymentError || !payment) {
      return new Response(
        JSON.stringify({ error: "Payment not found or access denied" }),
        { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Generate order ID
    const orderId = `PAY-${payment_id.substring(0, 8)}-${Date.now()}`;

    // Get site URL for callback
    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:8080";

    // Create Midtrans transaction
    const midtransPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(amount), // Midtrans requires integer
      },
      customer_details: {
        first_name: customer_name?.split(" ")[0] || customer_name || "Customer",
        last_name: customer_name?.split(" ").slice(1).join(" ") || "",
        email: customer_email,
      },
      item_details: [
        {
          id: payment_id,
          price: Math.round(amount),
          quantity: 1,
          name: item_name || "Booking Payment",
        },
      ],
      callbacks: {
        finish: `${siteUrl}/payment/callback?payment_id=${payment_id}`,
        unfinish: `${siteUrl}/payment/callback?payment_id=${payment_id}`,
        error: `${siteUrl}/payment/callback?payment_id=${payment_id}&error=1`,
      },
    };

    const midtransResponse = await fetch(`${MIDTRANS_BASE_URL}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Basic ${btoa(MIDTRANS_SERVER_KEY + ":")}`,
      },
      body: JSON.stringify(midtransPayload),
    });

    if (!midtransResponse.ok) {
      const errorText = await midtransResponse.text();
      console.error("Midtrans API error:", errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create Midtrans transaction",
          details: errorText 
        }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const midtransData = await midtransResponse.json();
    const token = midtransData.token;

    if (!token) {
      return new Response(
        JSON.stringify({ error: "No token received from Midtrans" }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Update payment record with Midtrans order_id
    const { error: updateError } = await supabaseClient
      .from("payments")
      .update({
        notes: JSON.stringify({
          midtrans_order_id: orderId,
          midtrans_token: token.substring(0, 50) + "...", // Store partial token for reference
        }),
      })
      .eq("id", payment_id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating payment:", updateError);
      // Don't fail the request, token is already generated
    }

    return new Response(
      JSON.stringify({ 
        token, 
        order_id: orderId,
        snap_url: `${MIDTRANS_BASE_URL}/snap/v1/transactions/${token}`,
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" } 
      }
    );
  }
});

