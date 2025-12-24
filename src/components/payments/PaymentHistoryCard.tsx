import { motion } from "framer-motion";
import { Calendar, Clock, MessageCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import type { Payment } from "@/hooks/usePayments";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface PaymentHistoryCardProps {
  payment: Payment;
  onCancel?: (paymentId: string) => void;
  onViewDetails?: (payment: Payment) => void;
}

export function PaymentHistoryCard({
  payment,
  onCancel,
  onViewDetails,
}: PaymentHistoryCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: id });
  };

  const methodLabels: Record<string, string> = {
    cod: "COD",
    bank_transfer: "Transfer Bank",
    dana: "DANA",
    gopay: "GoPay",
    ovo: "OVO",
    shopeepay: "ShopeePay",
  };

  const bookingDetails = payment.booking_details as {
    companion_name?: string;
    package_name?: string;
    package_duration?: string;
  } | null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-card rounded-xl border border-border"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-foreground">
            {bookingDetails?.companion_name || "Booking"}
          </p>
          <p className="text-xs text-muted-foreground">
            {bookingDetails?.package_name} • {bookingDetails?.package_duration}
          </p>
        </div>
        <PaymentStatusBadge status={payment.status} size="sm" />
      </div>

      {/* Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(payment.created_at)}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {methodLabels[payment.method]}
          </span>
          <span className="font-semibold text-primary">
            {formatPrice(payment.amount)}
          </span>
        </div>
      </div>

      {/* Admin Notes */}
      {payment.admin_notes && (
        <div className="p-2 bg-muted/50 rounded-lg mb-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Catatan Admin:</span>{" "}
            {payment.admin_notes}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {(payment.status === "pending" || payment.status === "waiting_validation") &&
          onCancel && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onCancel(payment.id)}
            >
              Batalkan
            </Button>
          )}
        {onViewDetails && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails(payment)}
          >
            Detail
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
