import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { PaymentStatusBadge } from "@/components/payments/PaymentStatusBadge";
import { usePayments } from "@/hooks/usePayments";
import { toast } from "sonner";
import type { BookingData } from "@/hooks/useBooking";

interface Step6PaymentConfirmationProps {
  bookingData: BookingData;
  onConfirm: () => void;
}

export function Step6PaymentConfirmation({
  bookingData,
  onConfirm,
}: Step6PaymentConfirmationProps) {
  const { payments } = usePayments();
  const [payment, setPayment] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Find payment for this booking
    if (bookingData.paymentId) {
      const found = payments.find((p) => p.id === bookingData.paymentId);
      if (found) {
        setPayment(found);
        setIsChecking(false);
      } else {
        // Try to fetch payment
        setTimeout(() => {
          setIsChecking(false);
        }, 2000);
      }
    } else {
      setIsChecking(false);
    }
  }, [bookingData.paymentId, payments]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Memeriksa status pembayaran...</p>
      </div>
    );
  }

  const paymentStatus = payment?.status || "pending";
  const isApproved = paymentStatus === "approved";
  const isWaiting = paymentStatus === "waiting_validation" || paymentStatus === "pending";
  const isRejected = paymentStatus === "rejected";
  const isExpired = paymentStatus === "expired";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Konfirmasi Pembayaran</h2>
        <p className="text-muted-foreground">
          Status pembayaran Anda saat ini
        </p>
      </div>

      {/* Payment Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-foreground mb-1">Status Pembayaran</h3>
            <p className="text-sm text-muted-foreground">ID: {bookingData.paymentId?.substring(0, 8)}...</p>
          </div>
          <PaymentStatusBadge status={paymentStatus} />
        </div>

        {/* Status Messages */}
        {isApproved && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-800 dark:text-green-200 mb-1">
                  Pembayaran Berhasil!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Pembayaran Anda telah dikonfirmasi. Pemesanan akan segera diproses.
                </p>
              </div>
            </div>
          </div>
        )}

        {isWaiting && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                  Menunggu Validasi
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Pembayaran Anda sedang menunggu verifikasi dari admin. Mohon tunggu beberapa saat.
                </p>
              </div>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-200 mb-1">
                  Pembayaran Ditolak
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {payment?.admin_notes || "Pembayaran Anda ditolak. Silakan hubungi admin untuk informasi lebih lanjut."}
                </p>
              </div>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-gray-600 dark:text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Pembayaran Kedaluwarsa
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Waktu pembayaran telah habis. Silakan buat pemesanan baru.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Details */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Metode Pembayaran</span>
            <span className="font-medium text-foreground">
              {payment?.method === "bank_transfer_integrated"
                ? "Transfer Bank (Terintegrasi)"
                : payment?.method === "bank_transfer"
                ? "Transfer Bank (Manual)"
                : payment?.method?.toUpperCase() || "-"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Jumlah Pembayaran</span>
            <span className="font-semibold text-primary">
              {formatPrice(bookingData.totalAmount)}
            </span>
          </div>
          {payment?.created_at && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tanggal Pembayaran</span>
              <span className="text-foreground">
                {new Date(payment.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {isApproved && (
          <Button onClick={onConfirm} className="flex-1" size="lg">
            Lanjutkan
            <CheckCircle2 className="w-4 h-4 ml-2" />
          </Button>
        )}
        {isWaiting && (
          <div className="flex-1 p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Menunggu verifikasi admin...
            </p>
          </div>
        )}
        {(isRejected || isExpired) && (
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            Buat Pemesanan Baru
          </Button>
        )}
      </div>

      {/* Info */}
      <Card className="p-4 bg-muted/50 border-border">
        <p className="text-xs text-muted-foreground text-center">
          💡 Anda akan menerima notifikasi real-time saat status pembayaran berubah.
        </p>
      </Card>
    </div>
  );
}

