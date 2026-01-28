import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { isMidtransEnabled, getMidtransConfig } from "@/utils/midtrans";

interface MidtransPaymentProps {
  paymentId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  itemName: string;
  onSuccess?: (transactionResult: any) => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    snap: {
      embed: (token: string, options: {
        embedId: string;
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

export function MidtransPayment({
  paymentId,
  amount,
  customerName,
  customerEmail,
  itemName,
  onSuccess,
  onError,
}: MidtransPaymentProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const embedId = `midtrans-payment-${paymentId}`;
  const snapScriptLoaded = useRef(false);

  // Load Midtrans Snap script
  useEffect(() => {
    const config = getMidtransConfig();
    if (!config) {
      setError("Payment gateway tidak dikonfigurasi");
      setLoading(false);
      return;
    }

    // Load Snap script
    if (!snapScriptLoaded.current) {
      const script = document.createElement("script");
      script.src = config.isProduction
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";
      script.setAttribute("data-client-key", config.clientKey);
      script.async = true;
      script.onload = () => {
        snapScriptLoaded.current = true;
        requestSnapToken();
      };
      script.onerror = () => {
        setError("Gagal memuat payment gateway");
        setLoading(false);
      };
      document.body.appendChild(script);
    } else {
      requestSnapToken();
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Request Snap token from Supabase Edge Function or backend
  const requestSnapToken = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call Supabase Edge Function to create Midtrans transaction
      // You need to create this Edge Function in Supabase Dashboard
      const { data: { session } } = await import("@/integrations/supabase/client").then(m => m.supabase.auth.getSession());
      
      if (!session) {
        throw new Error("Session tidak ditemukan");
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/midtrans-create-transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          payment_id: paymentId,
          amount,
          customer_name: customerName,
          customer_email: customerEmail,
          item_name: itemName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal membuat transaksi");
      }

      const data = await response.json();
      setSnapToken(data.token);
    } catch (err: any) {
      console.error("Error requesting Snap token:", err);
      setError(err.message || "Gagal memuat payment gateway");
      onError?.(err.message || "Gagal memuat payment gateway");
    } finally {
      setLoading(false);
    }
  };

  // Embed Snap payment when token is ready
  useEffect(() => {
    if (snapToken && window.snap && snapScriptLoaded.current) {
      try {
        window.snap.embed(snapToken, {
          embedId,
          onSuccess: (result: any) => {
            console.log("Payment success:", result);
            toast.success("Pembayaran berhasil!");
            onSuccess?.(result);
          },
          onPending: (result: any) => {
            console.log("Payment pending:", result);
            toast.info("Pembayaran sedang diproses");
            onSuccess?.(result);
          },
          onError: (result: any) => {
            console.error("Payment error:", result);
            toast.error("Pembayaran gagal");
            onError?.(result.status_message || "Pembayaran gagal");
          },
          onClose: () => {
            console.log("Payment dialog closed");
          },
        });
      } catch (err: any) {
        console.error("Error embedding Snap:", err);
        setError("Gagal memuat form pembayaran");
      }
    }
  }, [snapToken, embedId, onSuccess, onError]);

  if (!isMidtransEnabled()) {
    return (
      <Card className="p-6 border-destructive/20 bg-destructive/5">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <div>
            <p className="font-semibold text-foreground">Payment Gateway Tidak Tersedia</p>
            <p className="text-sm text-muted-foreground">
              Midtrans belum dikonfigurasi. Silakan hubungi admin.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-destructive/20 bg-destructive/5">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <div>
            <p className="font-semibold text-foreground">Error</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={requestSnapToken}
        >
          Coba Lagi
        </Button>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-sm text-muted-foreground">Memuat form pembayaran...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <p className="font-semibold text-foreground">Pembayaran Terintegrasi</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Bayar langsung tanpa perlu buka aplikasi mobile banking. Pilih bank dan selesaikan pembayaran di sini.
        </p>
      </Card>

      {/* Midtrans Snap will be embedded here */}
      <div id={embedId} className="w-full" />
    </div>
  );
}

