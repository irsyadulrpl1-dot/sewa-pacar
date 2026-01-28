import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { BookingWithPayment } from "@/hooks/useBookingsHistory";
import { AlertCircle } from "lucide-react";

interface RenterBookingActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingWithPayment | null;
  onConfirmCancel: (reason: string) => Promise<void>;
}

export function RenterBookingActionDialog({
  open,
  onOpenChange,
  booking,
  onConfirmCancel,
}: RenterBookingActionDialogProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!booking) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    await onConfirmCancel(reason);
    setSubmitting(false);
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2 text-red-600">
             <AlertCircle className="w-5 h-5" />
            <DialogTitle>
              Batalkan Booking?
            </DialogTitle>
          </div>
          <DialogDescription>
             Apakah kamu yakin ingin membatalkan booking dengan {booking.companion?.full_name || "Partner"}? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Alasan Pembatalan (Opsional)
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Jadwal saya berubah..."
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Kembali
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? "Memproses..." : "Ya, Batalkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
