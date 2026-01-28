import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, DollarSign, User, Package, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { BookingData } from "@/hooks/useBooking";

interface Step3BookingDetailsProps {
  bookingData: BookingData;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function Step3BookingDetails({
  bookingData,
  notes,
  onNotesChange,
}: Step3BookingDetailsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid
      }
      return format(date, "EEEE, d MMMM yyyy", { locale: id });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  const hourlyRate = bookingData.companion?.hourlyRate || bookingData.selectedPackage?.price || 0;
  
  // Calculate total if not set
  const calculatedTotal = bookingData.duration && bookingData.duration > 0 
    ? hourlyRate * bookingData.duration 
    : bookingData.totalAmount || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Detail Pemesanan</h2>
        <p className="text-muted-foreground">
          Periksa kembali detail pemesanan Anda
        </p>
      </div>

      {/* Booking Summary */}
      <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Ringkasan Pemesanan
        </h3>
        <div className="space-y-4">
          {/* Companion Info */}
          <div className="flex items-start gap-4 p-4 bg-background/50 rounded-lg">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
              <img
                src={bookingData.companion?.image || ""}
                alt={bookingData.companion?.name || ""}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-muted-foreground" />
                <p className="font-semibold text-foreground">
                  {bookingData.companion?.name}
                </p>
              </div>
              {bookingData.companion?.city && (
                <p className="text-sm text-muted-foreground">
                  📍 {bookingData.companion.city}
                </p>
              )}
            </div>
          </div>

          {/* Package */}
          {bookingData.selectedPackage && (
            <div className="p-4 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Paket</p>
              </div>
              <p className="font-semibold text-foreground">
                {bookingData.selectedPackage.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {bookingData.selectedPackage.duration}
              </p>
            </div>
          )}

          {/* Date & Time */}
          {bookingData.selectedDate && bookingData.selectedTime ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-background/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Tanggal Pemesanan</p>
                </div>
                <p className="font-semibold text-foreground">
                  {formatDate(bookingData.selectedDate)}
                </p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Jam Mulai</p>
                </div>
                <p className="font-semibold text-foreground">
                  {bookingData.selectedTime} WIB
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Tanggal dan jam belum dipilih. Silakan kembali ke step sebelumnya.
              </p>
            </div>
          )}

          {/* Duration */}
          {bookingData.duration ? (
            <div className="p-4 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Durasi Pemesanan</p>
              </div>
              <p className="font-semibold text-foreground">
                {bookingData.duration} {bookingData.duration === 1 ? "jam" : "jam"}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Durasi belum dipilih. Silakan kembali ke step sebelumnya.
              </p>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="p-4 bg-background/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Rincian Harga</p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Harga per jam</span>
                <span className="text-foreground">{formatPrice(hourlyRate)}</span>
              </div>
              {bookingData.duration ? (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    × {bookingData.duration} {bookingData.duration === 1 ? "jam" : "jam"}
                  </span>
                  <span className="text-foreground">
                    {formatPrice(hourlyRate * bookingData.duration)}
                  </span>
                </div>
              ) : (
                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                  Durasi belum dipilih
                </div>
              )}
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Total Pembayaran</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(calculatedTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Notes Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <Label htmlFor="notes" className="text-base font-semibold">
              Catatan untuk {bookingData.companion?.name} (Opsional)
            </Label>
          </div>
          <Textarea
            id="notes"
            placeholder="Contoh: Saya ingin pergi ke kafe favorit, atau ada preferensi khusus lainnya..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Tambahkan catatan khusus untuk companion agar pertemuan lebih sesuai dengan harapan Anda.
          </p>
        </div>
      </Card>

      {/* Validation Summary */}
      {(!bookingData.selectedDate || !bookingData.selectedTime || !bookingData.duration || bookingData.duration <= 0) && (
        <Card className="p-4 bg-destructive/10 border-destructive/20">
          <p className="text-sm font-semibold text-destructive mb-2">
            ⚠️ Data belum lengkap
          </p>
          <ul className="text-xs text-destructive space-y-1 list-disc list-inside">
            {!bookingData.selectedDate && <li>Tanggal belum dipilih</li>}
            {!bookingData.selectedTime && <li>Jam belum dipilih</li>}
            {(!bookingData.duration || bookingData.duration <= 0) && <li>Durasi belum dipilih atau tidak valid</li>}
          </ul>
          <p className="text-xs text-destructive mt-2">
            Silakan kembali ke step sebelumnya untuk melengkapi data.
          </p>
        </Card>
      )}
    </div>
  );
}

