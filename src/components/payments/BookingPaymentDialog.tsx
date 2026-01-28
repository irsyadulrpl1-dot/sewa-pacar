import { useState, useEffect } from "react";
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
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CompanionInfo {
  id: string;
  name: string;
  image: string;
  city?: string;
}

interface BookingPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companion: CompanionInfo;
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [transferDetails, setTransferDetails] = useState<{
    sender_account_number?: string;
    sender_name?: string;
    transfer_amount?: number;
  }>({});

  const { createPayment, uploadPaymentProof, paymentConfigs, fetchPaymentConfigs } =
    usePayments();

  // Fetch payment configs when dialog opens
  useEffect(() => {
    if (open && !paymentConfigs) {
      setIsConfigLoading(true);
      fetchPaymentConfigs()
        .catch((error) => {
          console.error("Failed to fetch payment configs:", error);
          toast.error("Gagal memuat metode pembayaran. Silakan coba lagi.");
        })
        .finally(() => {
          setIsConfigLoading(false);
        });
    }
  }, [open, paymentConfigs, fetchPaymentConfigs]);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    // Clear any previous error when user selects a method
    setErrorMessage(null);
  };

  const handleContinue = async () => {
    // Validate inputs
    if (!selectedMethod) {
      const message = "Pilih metode pembayaran terlebih dahulu";
      setErrorMessage(message);
      toast.error(message);
      return;
    }
    if (!companion?.id) {
      const message = "Data companion tidak valid. Silakan refresh halaman dan coba lagi.";
      setErrorMessage(message);
      toast.error(message);
      return;
    }
    if (!selectedPackage?.price || selectedPackage.price <= 0) {
      const message = "Jumlah pembayaran tidak valid. Pastikan paket memiliki harga yang benar.";
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      console.log('Starting payment creation', {
        method: selectedMethod,
        companionId: companion.id,
        amount: selectedPackage.price,
        hasConfigs: !!paymentConfigs,
      });

      // Ensure configs are loaded before proceeding (for non-COD methods)
      if (selectedMethod !== "cod" && !paymentConfigs) {
        console.log('Fetching payment configs...');
        await fetchPaymentConfigs();
        console.log('Payment configs fetched:', paymentConfigs?.length || 0);
      }

      // Prepare notes with transfer details if available
      let finalNotes = notes || "";
      if (Object.keys(transferDetails).length > 0) {
        const transferInfo = [];
        if (transferDetails.sender_account_number) {
          transferInfo.push(`Rek/Kartu Pengirim: ${transferDetails.sender_account_number}`);
        }
        if (transferDetails.sender_name) {
          transferInfo.push(`Nama Pengirim: ${transferDetails.sender_name}`);
        }
        if (transferDetails.transfer_amount && transferDetails.transfer_amount !== selectedPackage.price) {
          transferInfo.push(`Jumlah Transfer: Rp ${transferDetails.transfer_amount.toLocaleString('id-ID')}`);
        }
        if (transferInfo.length > 0) {
          finalNotes = finalNotes 
            ? `${finalNotes}\n\n--- Informasi Transfer ---\n${transferInfo.join('\n')}`
            : `--- Informasi Transfer ---\n${transferInfo.join('\n')}`;
        }
      }

      // Create payment
      const payment = await createPayment({
        companion_id: companion.id,
        amount: selectedPackage.price,
        method: selectedMethod,
        notes: finalNotes || undefined,
        booking_details: {
          companion_name: companion.name,
          package_name: selectedPackage.name,
          package_duration: selectedPackage.duration,
          transfer_details: Object.keys(transferDetails).length > 0 ? transferDetails : undefined,
        },
      });

      if (!payment) {
        throw new Error("Tidak dapat membuat pesanan saat ini. Coba lagi beberapa saat.");
      }

      console.log('Payment created successfully', {
        id: payment.id,
        status: payment.status,
        method: payment.method,
      });

      setCreatedPayment(payment);
      
      if (selectedMethod === "cod") {
        // COD payments go directly to success since status is already waiting_validation
        setStep("success");
        onSuccess(payment);
      } else {
        // Other payment methods need proof upload
        setStep("instructions");
      }
    } catch (error: any) {
      console.error("Payment creation failed - Full error:", {
        error,
        message: error?.message,
        stack: error?.stack,
        selectedMethod,
        companionId: companion?.id,
        amount: selectedPackage?.price,
      });
      
      const message = error?.message || "Terjadi kesalahan yang tidak diketahui. Coba lagi beberapa saat.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadProof = async (file: File) => {
    if (!createdPayment) {
      const message = "Pembayaran tidak ditemukan. Silakan buat pesanan baru.";
      setErrorMessage(message);
      toast.error(message);
      return;
    }
    
    setIsUploading(true);
    setErrorMessage(null);

    try {
      console.log('Starting proof upload', {
        paymentId: createdPayment.id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      const url = await uploadPaymentProof(createdPayment.id, file);
      
      if (!url) {
        throw new Error("Gagal mengupload bukti pembayaran: URL tidak tersedia.");
      }

      console.log('Proof uploaded successfully', {
        paymentId: createdPayment.id,
        proofUrl: url,
      });

      // Update local payment state
      const updatedPayment = { 
        ...createdPayment, 
        proof_url: url, 
        status: "waiting_validation" as const 
      };
      
      setCreatedPayment(updatedPayment);
      setStep("success");
      onSuccess(updatedPayment);
    } catch (error: any) {
      console.error("Proof upload failed - Full error:", {
        error,
        message: error?.message,
        stack: error?.stack,
        paymentId: createdPayment.id,
        fileName: file.name,
      });
      
      const message = error?.message || "Gagal mengupload bukti pembayaran. Silakan coba lagi.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
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
    setErrorMessage(null);
    setTransferDetails({});
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
      <DialogContent className="max-w-md h-[85vh] flex flex-col p-0 gap-0 rounded-t-2xl sm:rounded-2xl">
        <DialogHeader className="p-4 pb-2 border-b border-border shrink-0">
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

        <div className="flex-1 overflow-y-auto p-4">
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

                {errorMessage && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <Button
                  variant="gradient"
                  className="w-full"
                  disabled={
                    !selectedMethod ||
                    isSubmitting ||
                    isConfigLoading
                  }
                  onClick={handleContinue}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : isConfigLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memuat Metode...
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
                  configs={paymentConfigs || []}
                  expiresAt={createdPayment?.expires_at || undefined}
                  onTransferDetailsChange={setTransferDetails}
                  paymentId={createdPayment?.id}
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
                {errorMessage && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}