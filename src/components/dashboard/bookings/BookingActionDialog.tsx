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
import { CompanionBooking } from "@/hooks/useCompanionBookings";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface BookingActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "approve" | "reject" | null;
  booking: CompanionBooking | null;
  onConfirm: (notes?: string) => Promise<void>;
}

export function BookingActionDialog({
  open,
  onOpenChange,
  type,
  booking,
  onConfirm,
}: BookingActionDialogProps) {
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!booking || !type) return null;

  const isApprove = type === "approve";

  const handleConfirm = async () => {
    setSubmitting(true);
    await onConfirm(notes);
    setSubmitting(false);
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {isApprove ? (
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-red-100 text-red-600">
                <XCircle className="w-5 h-5" />
              </div>
            )}
            <DialogTitle>
              {isApprove ? "Terima Booking?" : "Tolak Booking?"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isApprove
              ? `Anda akan menerima permintaan booking dari ${booking.renter?.full_name || "Penyewa"}.`
              : `Anda akan menolak permintaan booking dari ${booking.renter?.full_name || "Penyewa"}. Tindakan ini tidak dapat dibatalkan.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {isApprove ? "Catatan untuk Penyewa (Opsional)" : "Alasan Penolakan (Wajib)"}
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isApprove
                  ? "Contoh: Halo, saya siap bertemu di lokasi..."
                  : "Contoh: Maaf, saya ada jadwal mendadak..."
              }
              className="resize-none"
            />
          </div>
          
          {!isApprove && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 text-orange-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>Menolak booking terlalu sering dapat mempengaruhi performa akun Anda.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            variant={isApprove ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={submitting || (!isApprove && !notes.trim())}
          >
            {submitting ? "Memproses..." : isApprove ? "Terima Booking" : "Tolak Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
