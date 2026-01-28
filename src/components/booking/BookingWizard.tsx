import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Tambahkan ini
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useBooking } from "@/hooks/useBooking";
import { Step1ServiceSelection } from "./steps/Step1ServiceSelection";
import { Step2DateTimeSelection } from "./steps/Step2DateTimeSelection";
import { Step3BookingDetails } from "./steps/Step3BookingDetails";
import { Step4PaymentMethod } from "./steps/Step4PaymentMethod";
import { Step5PaymentProcess } from "./steps/Step5PaymentProcess";
import { Step6PaymentConfirmation } from "./steps/Step6PaymentConfirmation";
import { Step7BookingSuccess } from "./steps/Step7BookingSuccess";

export interface CompanionInfo {
  id: string;
  name: string;
  image: string;
  city?: string;
  hourlyRate?: number;
  packages?: Array<{
    name: string;
    duration: string;
    price: number;
  }>;
}

export interface BookingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companion: CompanionInfo;
  onSuccess?: () => void;
}

export type BookingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const TOTAL_STEPS = 7;
const STEP_LABELS = [
  "Pilih Layanan",
  "Tanggal & Jam",
  "Detail Pemesanan",
  "Metode Pembayaran",
  "Proses Pembayaran",
  "Konfirmasi Pembayaran",
  "Pemesanan Berhasil",
];

export function BookingWizard({
  open,
  onOpenChange,
  companion,
  onSuccess,
}: BookingWizardProps) {
  const DEBUG_BOOKING =
    import.meta.env.DEV && typeof window !== "undefined" && window.localStorage.getItem("debug_booking") === "1";
  const { user } = useAuth();
  const { profile } = useProfile();
  const {
    bookingData,
    updateBookingData,
    resetBooking,
    createBooking,
    isLoading,
  } = useBooking();

  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset wizard when dialog opens/closes - gunakan useCallback untuk mencegah re-render
  const resetWizard = useCallback(() => {
    if (DEBUG_BOOKING) console.log("Resetting wizard with companion:", companion);
    setCurrentStep(1);
    resetBooking();
    // Set companion data immediately
    updateBookingData({ 
      companion,
      selectedPackage: null, // Reset package selection
      selectedDate: null,
      selectedTime: null,
      duration: null,
      notes: null,
      paymentMethod: null,
      bookingId: null,
      paymentId: null,
      totalAmount: 0,
    });
  }, [companion, resetBooking, updateBookingData]);

  useEffect(() => {
    if (open) {
      resetWizard();
    }
  }, [open, resetWizard]);

  // Check authentication - gunakan useCallback untuk mencegah re-render
  const checkAuth = useCallback(() => {
    if (open && !user) {
      toast.error("Silakan login terlebih dahulu");
      onOpenChange(false);
      return;
    }
  }, [open, user, profile?.hourly_rate, profile?.role, companion.hourlyRate, onOpenChange]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Hitung progress dengan useMemo untuk mencegah perhitungan ulang
  const progress = useMemo(() => {
    return ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
  }, [currentStep]);

  // Validasi untuk setiap step - gunakan useCallback untuk mencegah pembuatan fungsi baru
  const canGoNext = useCallback(() => {
    switch (currentStep) {
      case 1:
        const hasPackage = !!bookingData.selectedPackage && 
                          !!bookingData.selectedPackage.name && 
                          bookingData.selectedPackage.price > 0;
        return hasPackage;
      case 2:
        const hasDate = !!bookingData.selectedDate;
        const hasTime = !!bookingData.selectedTime;
        const hasDuration = !!bookingData.duration && bookingData.duration > 0;
        const isValid = hasDate && hasTime && hasDuration;
        return isValid;
      case 3:
        // Validate all required fields before allowing to proceed
        const hasAllData = !!bookingData.companion && 
                          !!bookingData.selectedPackage && 
                          !!bookingData.selectedDate && 
                          !!bookingData.selectedTime && 
                          !!bookingData.duration && 
                          bookingData.duration > 0 &&
                          bookingData.totalAmount > 0;
        return hasAllData;
      case 4:
        return !!bookingData.paymentMethod;
      case 5:
        return true; // Payment process handles its own flow
      case 6:
        return true; // Confirmation handles its own flow
      case 7:
        return false; // Last step
      default:
        return false;
    }
  }, [currentStep, bookingData]);

  // Avoid calling canGoNext() multiple times per render (and prevents noisy logs if enabled)
  const canProceed = useMemo(() => canGoNext(), [canGoNext]);

  // Handle next step - gunakan useCallback untuk mencegah pembuatan fungsi baru
  const handleNext = useCallback(async () => {
    const canProceed = canGoNext();
    if (!canProceed) {
      // Provide specific error messages based on step
      let errorMessage = "Lengkapi data terlebih dahulu";
      if (currentStep === 1) {
        errorMessage = "Silakan pilih paket terlebih dahulu";
      } else if (currentStep === 2) {
        errorMessage = "Silakan pilih tanggal, jam, dan durasi terlebih dahulu";
      } else if (currentStep === 4) {
        errorMessage = "Silakan pilih metode pembayaran terlebih dahulu";
      }
      toast.error(errorMessage);
      if (DEBUG_BOOKING) {
        console.log("Cannot proceed to next step:", {
          step: currentStep,
          bookingData,
          canProceed,
        });
      }
      return;
    }

    // Special handling for step 3 (create booking before payment)
    if (currentStep === 3) {
      setIsSubmitting(true);
      try {
        // Validate data before creating booking
        const validationErrors: string[] = [];
        
        if (!bookingData.companion) {
          validationErrors.push("Data companion tidak ditemukan");
        }
        if (!bookingData.selectedPackage) {
          validationErrors.push("Paket belum dipilih");
        }
        if (!bookingData.selectedDate) {
          validationErrors.push("Tanggal belum dipilih");
        }
        if (!bookingData.selectedTime) {
          validationErrors.push("Jam belum dipilih");
        }
        if (!bookingData.duration || bookingData.duration <= 0) {
          validationErrors.push("Durasi belum dipilih atau tidak valid");
        }
        if (!bookingData.totalAmount || bookingData.totalAmount <= 0) {
          validationErrors.push("Total pembayaran tidak valid");
        }

        if (validationErrors.length > 0) {
          toast.error(`Data belum lengkap: ${validationErrors.join(", ")}`);
          setIsSubmitting(false);
          return;
        }

        if (DEBUG_BOOKING) {
          console.log("Creating booking with data:", {
            companion: bookingData.companion?.name,
            package: bookingData.selectedPackage?.name,
            date: bookingData.selectedDate,
            time: bookingData.selectedTime,
            duration: bookingData.duration,
            totalAmount: bookingData.totalAmount,
          });
        }

        const booking = await createBooking();
        if (booking) {
          if (DEBUG_BOOKING) console.log("Booking created successfully:", booking.id);
          setCurrentStep(4);
        } else {
          throw new Error("Pemesanan gagal dibuat");
        }
      } catch (error: any) {
        console.error("Error in handleNext step 3:", error);
        const errorMessage = error.message || "Gagal membuat pemesanan. Silakan coba lagi.";
        toast.error(errorMessage, {
          duration: 5000,
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => (prev + 1) as BookingStep);
    }
  }, [canGoNext, currentStep, bookingData, createBooking]);

  // Handle back step - gunakan useCallback untuk mencegah pembuatan fungsi baru
  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as BookingStep);
    }
  }, [currentStep]);

  // Handle close - gunakan useCallback untuk mencegah pembuatan fungsi baru
  const handleClose = useCallback(() => {
    if (currentStep === 7) {
      // If on success step, allow close
      onOpenChange(false);
      onSuccess?.();
    } else if (isSubmitting) {
      toast.error("Tunggu proses selesai");
    } else {
      // Confirm before closing
      if (confirm("Yakin ingin menutup? Progress akan hilang.")) {
        onOpenChange(false);
        resetBooking();
      }
    }
  }, [currentStep, isSubmitting, onOpenChange, onSuccess, resetBooking]);

  // Render step content - gunakan useCallback untuk mencegah pembuatan fungsi baru
  const renderStep = useCallback(() => {
    switch (currentStep) {
      case 1:
        return (
          <Step1ServiceSelection
            companion={companion}
            selectedPackage={bookingData.selectedPackage}
            onSelect={(pkg) => {
              if (DEBUG_BOOKING) console.log("Step1 onSelect called with:", pkg);
              if (!pkg || !pkg.name || pkg.price <= 0) {
                console.error("Invalid package selected:", pkg);
                toast.error("Paket tidak valid. Silakan pilih paket lain.");
                return;
              }
              updateBookingData({ selectedPackage: pkg });
            }}
          />
        );
      case 2:
        return (
          <Step2DateTimeSelection
            companion={companion}
            selectedDate={bookingData.selectedDate}
            selectedTime={bookingData.selectedTime}
            duration={bookingData.duration}
            onDateChange={(date) => {
              if (DEBUG_BOOKING) console.log("Date changed:", date);
              updateBookingData({ selectedDate: date });
            }}
            onTimeChange={(time) => {
              if (DEBUG_BOOKING) console.log("Time changed:", time);
              updateBookingData({ selectedTime: time });
            }}
            onDurationChange={(duration) => {
              if (DEBUG_BOOKING) console.log("Duration changed:", duration);
              updateBookingData({ duration });
            }}
          />
        );
      case 3:
        return (
          <Step3BookingDetails
            bookingData={bookingData}
            notes={bookingData.notes || ""}
            onNotesChange={(notes) => updateBookingData({ notes })}
          />
        );
      case 4:
        return (
          <Step4PaymentMethod
            selectedMethod={bookingData.paymentMethod}
            onSelect={(method) => updateBookingData({ paymentMethod: method })}
          />
        );
      case 5:
        return (
          <Step5PaymentProcess
            bookingData={bookingData}
            onPaymentComplete={() => setCurrentStep(6)}
            onPaymentError={(error) => toast.error(error)}
          />
        );
      case 6:
        return (
          <Step6PaymentConfirmation
            bookingData={bookingData}
            onConfirm={() => setCurrentStep(7)}
          />
        );
      case 7:
        return (
          <Step7BookingSuccess
            bookingData={bookingData}
            onClose={() => {
              onOpenChange(false);
              onSuccess?.();
            }}
          />
        );
      default:
        return null;
    }
  }, [currentStep, companion, bookingData, updateBookingData]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Pemesanan dengan {companion.name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Wizard pemesanan multi-step untuk memilih layanan, jadwal, detail pemesanan, dan pembayaran.
            </DialogDescription>
            {currentStep !== 7 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Step {currentStep} dari {TOTAL_STEPS}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between mt-2">
              {STEP_LABELS.map((label, index) => {
                const stepNum = (index + 1) as BookingStep;
                const isActive = currentStep === stepNum;
                const isCompleted = currentStep > stepNum;
                return (
                  <div
                    key={stepNum}
                    className="flex flex-col items-center gap-1 flex-1"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : isActive
                          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        stepNum
                      )}
                    </div>
                    <span
                      className={`text-[10px] text-center ${
                        isActive || isCompleted
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogHeader>

        {/* Step Content */}
        <div className="px-6 py-6 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        {currentStep !== 7 && (
          <div className="px-6 py-4 border-t flex items-center justify-between gap-4 bg-muted/30">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>

            <div className="flex-1" />

            {currentStep === 3 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed || isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Membuat Pemesanan...
                  </>
                ) : (
                  <>
                    Lanjutkan ke Pembayaran
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            ) : currentStep < TOTAL_STEPS ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed || isSubmitting}
                className="gap-2"
                title={!canProceed ? "Lengkapi data terlebih dahulu" : ""}
              >
                Lanjutkan
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
