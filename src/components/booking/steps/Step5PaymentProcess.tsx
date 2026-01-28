import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { PaymentInstructions } from "@/components/payments/PaymentInstructions";
import { PaymentProofUpload } from "@/components/payments/PaymentProofUpload";
import { MidtransPayment } from "@/components/payments/MidtransPayment";
import { usePayments } from "@/hooks/usePayments";
import { useBooking } from "@/hooks/useBooking";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { BookingData } from "@/hooks/useBooking";
import type { Payment } from "@/hooks/usePayments";

interface Step5PaymentProcessProps {
  bookingData: BookingData;
  onPaymentComplete: () => void;
  onPaymentError: (error: string) => void;
}

export function Step5PaymentProcess({
  bookingData,
  onPaymentComplete,
  onPaymentError,
}: Step5PaymentProcessProps) {
  const { user } = useAuth();
  const { createPayment, uploadPaymentProof, paymentConfigs, fetchPaymentConfigs } = usePayments();
  const { linkPaymentToBooking } = useBooking();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Fetch payment configs
    if (!paymentConfigs) {
      fetchPaymentConfigs();
    }

    // Create payment if not exists
    if (!payment && bookingData.bookingId && bookingData.paymentMethod) {
      createPaymentRecord();
    }
  }, [bookingData.bookingId, bookingData.paymentMethod]);

  const createPaymentRecord = async () => {
    if (!bookingData.bookingId || !bookingData.paymentMethod) return;

    setIsCreating(true);
    try {
      const paymentData = await createPayment({
        companion_id: bookingData.companion?.id,
        amount: bookingData.totalAmount,
        method: bookingData.paymentMethod,
        notes: bookingData.notes || undefined,
        booking_details: {
          companion_name: bookingData.companion?.name,
          package_name: bookingData.selectedPackage?.name,
          package_duration: bookingData.selectedPackage?.duration,
        },
      });

      if (paymentData) {
        setPayment(paymentData);
        // Link payment to booking
        await linkPaymentToBooking(bookingData.bookingId, paymentData.id);
      }
    } catch (error: any) {
      console.error("Error creating payment:", error);
      onPaymentError(error.message || "Gagal membuat pembayaran");
    } finally {
      setIsCreating(false);
    }
  };

  const handleProofUpload = async (file: File) => {
    if (!payment) {
      toast.error("Pembayaran belum dibuat");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadPaymentProof(payment.id, file);
      if (url) {
        setPayment({ ...payment, proof_url: url, status: "waiting_validation" });
        toast.success("Bukti pembayaran berhasil diupload");
        // Wait a bit then proceed
        setTimeout(() => {
          onPaymentComplete();
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error uploading proof:", error);
      onPaymentError(error.message || "Gagal mengupload bukti pembayaran");
    } finally {
      setIsUploading(false);
    }
  };

  const handleMidtransSuccess = () => {
    if (payment) {
      setPayment({ ...payment, status: "waiting_validation" });
      toast.success("Pembayaran berhasil!");
      setTimeout(() => {
        onPaymentComplete();
      }, 1500);
    }
  };

  if (isCreating) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Menyiapkan pembayaran...</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
        <p className="text-muted-foreground">Gagal membuat pembayaran</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Proses Pembayaran</h2>
        <p className="text-muted-foreground">
          Selesaikan pembayaran sesuai metode yang dipilih
        </p>
      </div>

      {/* Payment Amount */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 text-center">
        <p className="text-sm text-muted-foreground mb-2">Total Pembayaran</p>
        <p className="text-3xl font-bold text-primary">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(bookingData.totalAmount)}
        </p>
      </Card>

      {/* Payment Instructions */}
      {bookingData.paymentMethod === "bank_transfer_integrated" ? (
        <MidtransPayment
          paymentId={payment.id}
          amount={bookingData.totalAmount}
          customerName={user?.user_metadata?.full_name || user?.email || "Customer"}
          customerEmail={user?.email || ""}
          itemName={`Booking ${bookingData.selectedPackage?.name || ""}`}
          onSuccess={handleMidtransSuccess}
          onError={onPaymentError}
        />
      ) : bookingData.paymentMethod === "cod" ? (
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Pembayaran COD</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Anda akan membayar tunai saat bertemu dengan companion. Pastikan menyiapkan uang tunai.
              </p>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm font-semibold text-foreground mb-1">Jumlah yang harus dibayar:</p>
                <p className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(bookingData.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <PaymentInstructions
            method={bookingData.paymentMethod}
            amount={bookingData.totalAmount}
            configs={paymentConfigs || []}
            expiresAt={payment.expires_at || undefined}
            paymentId={payment.id}
          />
          <PaymentProofUpload
            onUpload={handleProofUpload}
            isUploading={isUploading}
          />
        </>
      )}

      {/* Countdown Timer (if applicable) */}
      {payment.expires_at && bookingData.paymentMethod !== "cod" && (
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Batas waktu pembayaran
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Selesaikan pembayaran sebelum waktu habis
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

