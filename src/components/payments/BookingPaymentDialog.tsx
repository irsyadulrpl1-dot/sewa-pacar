import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { PaymentInstructions } from "./PaymentInstructions";
import { PaymentProofUpload } from "./PaymentProofUpload";
import { usePayments, type PaymentMethod, type Payment } from "@/hooks/usePayments";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import type { Companion } from "@/data/companions";

interface BookingPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companion: Companion;
  selectedPackage: {
    name: string;
    duration: string;
    price: number;
  };
  onSuccess: (payment: Payment) => void;
}

type Step = "method" | "instructions" | "upload" | "success";

export function BookingPaymentDialog({
  open,
  onOpenChange,
  companion,
  selectedPackage,
  onSuccess,
}: BookingPaymentDialogProps) {
  const [step, setStep] = useState<Step>("method");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [createdPayment, setCreatedPayment] = useState<Payment | null>(null);

  const { createPayment, uploadPaymentProof, paymentConfigs, fetchPaymentConfigs } =
    usePayments();

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  const handleContinue = async () => {
    if (!selectedMethod) return;

    if (step === "method") {
      setIsSubmitting(true);

      // Ensure configs are loaded
      await fetchPaymentConfigs();

      // Create payment
      const payment = await createPayment({
        companion_id: companion.id,
        amount: selectedPackage.price,
        method: selectedMethod,
        notes: notes || undefined,
        booking_details: {
          companion_name: companion.name,
          package_name: selectedPackage.name,
          package_duration: selectedPackage.duration,
        },
      });

      setIsSubmitting(false);

      if (payment) {
        setCreatedPayment(payment);
        if (selectedMethod === "cod") {
          setStep("success");
          onSuccess(payment);
        } else {
          setStep("instructions");
        }
      }
    }
  };

  const handleUploadProof = async (file: File) => {
    if (!createdPayment) return;

    setIsUploading(true);
    const url = await uploadPaymentProof(createdPayment.id, file);
    setIsUploading(false);

    if (url) {
      setStep("success");
      onSuccess({ ...createdPayment, proof_url: url, status: "waiting_validation" });
    }
  };

  const handleBack = () => {
    if (step === "instructions") {
      setStep("method");
    } else if (step === "upload") {
      setStep("instructions");
    }
  };

  const handleClose = () => {
    // Reset state
    setStep("method");
    setSelectedMethod(null);
    setNotes("");
    setCreatedPayment(null);
    onOpenChange(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {(step === "instructions" || step === "upload") && (
              <button
                onClick={handleBack}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <DialogTitle className="text-lg font-display">
              {step === "method" && "Pembayaran Booking"}
              {step === "instructions" && "Instruksi Pembayaran"}
              {step === "upload" && "Upload Bukti"}
              {step === "success" && "Berhasil"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "method" && (
            <motion.div
              key="method"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Booking Summary */}
              <div className="p-4 bg-muted/50 rounded-xl space-y-2">
                <div className="flex items-center gap-3">
                  <img
                    src={companion.image}
                    alt={companion.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{companion.name}</p>
                    <p className="text-xs text-muted-foreground">{companion.city}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{selectedPackage.name}</span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(selectedPackage.price)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedPackage.duration}</p>
                </div>
              </div>

              <PaymentMethodSelector
                selected={selectedMethod}
                onSelect={handleMethodSelect}
              />

              <Textarea
                placeholder="Catatan untuk booking (opsional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none"
                rows={2}
              />

              <Button
                variant="gradient"
                className="w-full"
                disabled={!selectedMethod || isSubmitting}
                onClick={handleContinue}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Lanjutkan"
                )}
              </Button>
            </motion.div>
          )}

          {step === "instructions" && selectedMethod && (
            <motion.div
              key="instructions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <PaymentInstructions
                method={selectedMethod}
                amount={selectedPackage.price}
                configs={paymentConfigs}
                expiresAt={createdPayment?.expires_at || undefined}
              />

              {selectedMethod !== "cod" && (
                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={() => setStep("upload")}
                >
                  Upload Bukti Pembayaran
                </Button>
              )}
            </motion.div>
          )}

          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <PaymentProofUpload
                onUpload={handleUploadProof}
                isUploading={isUploading}
                currentProofUrl={createdPayment?.proof_url}
              />
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center space-y-4"
            >
              <div className="inline-flex p-4 bg-green-500/10 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-foreground">
                  {selectedMethod === "cod"
                    ? "Booking Berhasil!"
                    : "Bukti Dikirim!"}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedMethod === "cod"
                    ? "Pesanan kamu sedang menunggu konfirmasi admin. Kami akan memberitahu kamu setelah disetujui."
                    : "Bukti pembayaran sedang diverifikasi oleh admin. Kami akan memberitahu kamu setelah divalidasi."}
                </p>
              </div>
              <Button variant="outline" className="w-full" onClick={handleClose}>
                Tutup
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
