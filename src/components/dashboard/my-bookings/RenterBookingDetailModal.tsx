import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  MessageCircle, 
  FileText,
  CreditCard,
  Package,
  CheckCircle2,
  Hourglass,
  XCircle,
  Banknote
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { BookingWithPayment } from "@/hooks/useBookingsHistory";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface RenterBookingDetailModalProps {
  booking: BookingWithPayment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelBooking: (booking: BookingWithPayment) => void;
}

export function RenterBookingDetailModal({ 
    booking, 
    open, 
    onOpenChange,
    onCancelBooking
}: RenterBookingDetailModalProps) {
  const navigate = useNavigate();

  if (!booking) return null;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const timelineSteps = [
      { 
          status: "created", 
          label: "Booking Dibuat", 
          icon: FileText, 
          active: true,
          date: booking.created_at
      },
      { 
          status: "pending", 
          label: "Menunggu Konfirmasi", 
          icon: Hourglass, 
          active: booking.status !== "cancelled" && booking.status !== "rejected",
          date: booking.created_at // Approx
      },
      { 
          status: "approved", 
          label: booking.status === "rejected" ? "Ditolak" : "Dikonfirmasi", 
          icon: booking.status === "rejected" ? XCircle : CheckCircle2, 
          active: ["approved", "confirmed", "completed", "rejected"].includes(booking.status),
          date: booking.updated_at
      },
      { 
          status: "payment", 
          label: "Pembayaran", 
          icon: Banknote, 
          active: booking.payment_id !== null,
          date: booking.payment?.created_at
      },
      { 
          status: "completed", 
          label: "Selesai", 
          icon: CheckCircle2, 
          active: booking.status === "completed",
          date: booking.updated_at
      }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Booking</DialogTitle>
          <DialogDescription>
            ID: #{booking.id.substring(0, 8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Companion Profile */}
          <div className="flex items-center gap-4 p-4 border border-border/50 rounded-xl bg-card">
            <Avatar className="h-16 w-16 border-2 border-primary/10">
              <AvatarImage src={booking.companion?.avatar_url || booking.companion_image || undefined} />
              <AvatarFallback>{(booking.companion?.full_name || booking.companion_name || "C").charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-semibold text-lg text-foreground">
                  {booking.companion?.full_name || booking.companion_name || "Unknown"}
              </div>
              <div className="text-sm text-muted-foreground mb-1">
                  @{booking.companion?.username || "username"}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {booking.companion?.city || "Lokasi tidak tersedia"}
              </div>
            </div>
            <Button 
              size="icon"
              variant="secondary"
              className="rounded-full h-10 w-10"
              onClick={() => navigate(`/chat/${booking.companion_id}`)}
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>

          {/* Timeline */}
          <div className="relative pl-4 border-l-2 border-border/50 space-y-6 py-2">
             {timelineSteps.map((step, idx) => (
                 <div key={idx} className={cn("relative flex items-center gap-4 transition-opacity", step.active ? "opacity-100" : "opacity-40")}>
                     <div className={cn(
                         "absolute -left-[21px] p-1 rounded-full border-2 bg-background",
                         step.active ? "border-primary text-primary" : "border-muted text-muted-foreground"
                     )}>
                         <step.icon className="w-3 h-3" />
                     </div>
                     <div className="flex-1">
                         <p className="text-sm font-medium">{step.label}</p>
                         {step.active && step.date && (
                             <p className="text-xs text-muted-foreground">
                                 {format(new Date(step.date), "dd MMM HH:mm", { locale: id })}
                             </p>
                         )}
                     </div>
                 </div>
             ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Schedule Info */}
            <div className="p-4 bg-muted/30 rounded-xl space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Jadwal & Paket
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal</span>
                  <span>{format(new Date(booking.booking_date), "dd MMMM yyyy", { locale: id })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Waktu</span>
                  <span>{booking.booking_time.substring(0, 5)} WIB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durasi</span>
                  <span>{booking.duration_hours} Jam</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paket</span>
                  <span>{booking.package_name}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="p-4 bg-muted/30 rounded-xl space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Pembayaran
              </h3>
               <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-primary">{formatCurrency(booking.total_amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={booking.payment_id ? "default" : "outline"}>
                      {booking.payment_id ? "Sudah Bayar" : "Belum Bayar"}
                  </Badge>
                </div>
                {booking.payment_id && (
                     <div className="flex justify-between">
                     <span className="text-muted-foreground">Metode</span>
                     <span className="capitalize">{booking.payment?.method.replace("_", " ")}</span>
                   </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Catatan
              </h3>
              <div className="p-4 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 rounded-xl text-sm italic">
                "{booking.notes}"
              </div>
            </div>
          )}
          
          <Separator />

          <div className="flex gap-2 justify-end">
              {booking.status === "pending" && (
                   <Button variant="destructive" onClick={() => onCancelBooking(booking)}>
                       Batalkan Booking
                   </Button>
              )}
              {/* Payment Button if pending payment */}
              {booking.status === "approved" && !booking.payment_id && (
                   <Button variant="default" onClick={() => navigate(`/bookings/${booking.id}`)}>
                       Bayar Sekarang
                   </Button>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Tutup
              </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
