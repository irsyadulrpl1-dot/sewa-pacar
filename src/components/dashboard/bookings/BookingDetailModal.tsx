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
  Package
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CompanionBooking } from "@/hooks/useCompanionBookings";
import { useNavigate } from "react-router-dom";

interface BookingDetailModalProps {
  booking: CompanionBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDetailModal({ booking, open, onOpenChange }: BookingDetailModalProps) {
  const navigate = useNavigate();

  if (!booking) return null;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Menunggu Konfirmasi</Badge>;
      case "approved":
      case "confirmed":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">Diterima</Badge>;
      case "rejected":
      case "cancelled":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">Dibatalkan</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">Selesai</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

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
          {/* Status Banner */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Status Pesanan</span>
              <div>{getStatusBadge(booking.status)}</div>
            </div>
            <div className="text-right space-y-1">
              <span className="text-sm text-muted-foreground">Total Pembayaran</span>
              <div className="font-bold text-lg text-primary">{formatCurrency(booking.total_amount)}</div>
            </div>
          </div>

          {/* Renter Profile */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Profil Penyewa
            </h3>
            <div className="flex items-center gap-4 p-4 border border-border/50 rounded-xl">
              <Avatar className="h-14 w-14">
                <AvatarImage src={booking.renter?.avatar_url || undefined} />
                <AvatarFallback>{booking.renter?.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold text-lg">{booking.renter?.full_name}</div>
                <div className="text-sm text-muted-foreground mb-1">@{booking.renter?.username}</div>
                {booking.renter?.city && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {booking.renter.city}
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(`/chat/${booking.user_id}`)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Schedule Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Jadwal Sewa
              </h3>
              <div className="space-y-3 p-4 bg-muted/10 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tanggal</span>
                  <span className="font-medium">
                    {format(new Date(booking.booking_date), "dd MMMM yyyy", { locale: id })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Waktu Mulai</span>
                  <span className="font-medium">{booking.booking_time.substring(0, 5)} WIB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Durasi</span>
                  <span className="font-medium">{booking.duration_hours} Jam</span>
                </div>
              </div>
            </div>

            {/* Package Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4" />
                Detail Paket
              </h3>
              <div className="space-y-3 p-4 bg-muted/10 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Paket</span>
                  <span className="font-medium">{booking.package_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tipe</span>
                  <span className="font-medium capitalize">{booking.package_duration}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Catatan Penyewa
              </h3>
              <div className="p-4 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 rounded-xl text-sm italic">
                "{booking.notes}"
              </div>
            </div>
          )}

          <Separator />

          {/* Payment Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Informasi Pembayaran
            </h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Metode Pembayaran</span>
              <span>Transfer Bank / E-Wallet</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status Pembayaran</span>
              <Badge variant="outline">
                {booking.payment_id ? "Sudah Dibayar" : "Belum Dibayar"}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
