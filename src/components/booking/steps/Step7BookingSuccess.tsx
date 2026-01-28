import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Clock, MapPin, Package, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import type { BookingData } from "@/hooks/useBooking";
import { useProfile } from "@/hooks/useProfile";

interface Step7BookingSuccessProps {
  bookingData: BookingData;
  onClose: () => void;
}

export function Step7BookingSuccess({
  bookingData,
  onClose,
}: Step7BookingSuccessProps) {
  const { profile } = useProfile();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "EEEE, d MMMM yyyy", { locale: id });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Success Icon */}
      <div className="flex flex-col items-center justify-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4"
        >
          <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
        </motion.div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Pemesanan Berhasil!
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          Terima kasih! Pemesanan Anda telah berhasil dibuat dan akan segera diproses.
        </p>
      </div>

      {/* Booking Summary */}
      <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Detail Pemesanan
        </h3>
        <div className="space-y-4">
          {/* Companion */}
          <div className="flex items-start gap-4 p-4 bg-background/50 rounded-lg">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
              <img
                src={bookingData.companion?.image || ""}
                alt={bookingData.companion?.name || ""}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground mb-1">
                {bookingData.companion?.name}
              </p>
              {bookingData.companion?.city && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {bookingData.companion.city}
                </p>
              )}
            </div>
          </div>

          {/* Booking Details Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {bookingData.selectedDate && (
              <div className="p-4 bg-background/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Tanggal</p>
                </div>
                <p className="font-semibold text-foreground">
                  {formatDate(bookingData.selectedDate)}
                </p>
              </div>
            )}
            {bookingData.selectedTime && (
              <div className="p-4 bg-background/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Jam</p>
                </div>
                <p className="font-semibold text-foreground">
                  {bookingData.selectedTime} WIB
                </p>
              </div>
            )}
          </div>

          {/* Package & Duration */}
          {bookingData.selectedPackage && (
            <div className="p-4 bg-background/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Paket</p>
              <p className="font-semibold text-foreground">
                {bookingData.selectedPackage.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {bookingData.duration} {bookingData.duration === 1 ? "jam" : "jam"} • {formatPrice(bookingData.totalAmount)}
              </p>
            </div>
          )}

          {/* Notes */}
          {bookingData.notes && (
            <div className="p-4 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Catatan</p>
              </div>
              <p className="text-sm text-foreground">{bookingData.notes}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="p-6 bg-muted/50 border-border">
        <h3 className="font-semibold text-foreground mb-3">Langkah Selanjutnya</h3>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0 mt-0.5">
              1
            </span>
            <span>Tunggu konfirmasi dari admin (biasanya dalam 1-2 jam)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0 mt-0.5">
              2
            </span>
            <span>Setelah dikonfirmasi, Anda akan menerima notifikasi</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0 mt-0.5">
              3
            </span>
            <span>Anda dapat mulai chat dengan companion</span>
          </li>
        </ol>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => {
            const isCompanion = (profile?.role as any) === "companion";
            if (isCompanion) {
              navigate("/companion/booking");
              return;
            }
            navigate(
              bookingData.bookingId ? `/bookings/${bookingData.bookingId}` : "/bookings"
            );
          }}
          className="flex-1"
        >
          Lihat Pemesanan Saya
        </Button>
        <Button onClick={onClose} className="flex-1">
          Tutup
        </Button>
      </div>
    </motion.div>
  );
}

