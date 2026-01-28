import { Clock, CheckCircle2, XCircle, AlertCircle, Ban, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/hooks/usePayments";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<
  PaymentStatus,
  {
    label: string;
    icon: React.ReactNode;
    className: string;
  }
> = {
  pending: {
    label: "Menunggu Pembayaran",
    icon: <Clock className="w-3.5 h-3.5" />,
    className: "bg-muted text-muted-foreground border-border",
  },
  waiting_validation: {
    label: "Menunggu Validasi",
    icon: <Timer className="w-3.5 h-3.5" />,
    className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  },
  approved: {
    label: "Pembayaran Berhasil",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  rejected: {
    label: "Pembayaran Ditolak",
    icon: <XCircle className="w-3.5 h-3.5" />,
    className: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  cancelled: {
    label: "Dibatalkan",
    icon: <Ban className="w-3.5 h-3.5" />,
    className: "bg-muted text-muted-foreground border-border",
  },
  expired: {
    label: "Kedaluwarsa",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function PaymentStatusBadge({ status, size = "md" }: PaymentStatusBadgeProps) {
  const fallback = {
    label: "Status Tidak Dikenal",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    className: "bg-muted text-muted-foreground border-border",
  };
  const config = statusConfig[status] || fallback;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        config.className,
        sizeClasses[size]
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
