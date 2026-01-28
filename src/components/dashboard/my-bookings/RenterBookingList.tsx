import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Eye, 
  MapPin, 
  Clock, 
  Calendar,
  MessageSquare,
  Ban,
  Repeat,
  Star
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { BookingWithPayment } from "@/hooks/useBookingsHistory";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface RenterBookingListProps {
  bookings: BookingWithPayment[];
  loading: boolean;
  onViewDetail: (booking: BookingWithPayment) => void;
  onCancel: (booking: BookingWithPayment) => void;
}

export function RenterBookingList({ 
  bookings, 
  loading, 
  onViewDetail,
  onCancel
}: RenterBookingListProps) {
  const navigate = useNavigate();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Menunggu</Badge>;
      case "approved":
      case "confirmed":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">Diterima</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">Ditolak</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-200">Dibatalkan</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">Selesai</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (booking: BookingWithPayment) => {
    if (booking.payment_id) {
        if (booking.payment?.status === "verified") {
            return <Badge variant="secondary" className="bg-green-50 text-green-700 text-[10px]">Lunas</Badge>;
        } else if (booking.payment?.status === "rejected") {
            return <Badge variant="secondary" className="bg-red-50 text-red-700 text-[10px]">Gagal</Badge>;
        }
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-[10px]">Verifikasi</Badge>;
    }
    return <Badge variant="outline" className="text-[10px] text-muted-foreground">Belum Bayar</Badge>;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-xl">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl bg-muted/10 border-dashed">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">Belum ada booking</h3>
        <p className="text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
          Kamu belum melakukan pemesanan apapun.
        </p>
        <Button onClick={() => navigate("/companions")}>
          Cari Teman Sewa
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border border-border/50 overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Teman Sewa</TableHead>
              <TableHead>Jadwal</TableHead>
              <TableHead>Durasi & Paket</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pembayaran</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={booking.companion?.avatar_url || booking.companion_image || undefined} />
                      <AvatarFallback>{(booking.companion?.full_name || booking.companion_name || "C").charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-foreground">
                        {booking.companion?.full_name || booking.companion_name || "Unknown"}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {booking.companion?.city || "Online/Offline"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{format(new Date(booking.booking_date), "dd MMM yyyy", { locale: id })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{booking.booking_time.substring(0, 5)} WIB</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{booking.duration_hours} Jam</div>
                    <div className="text-xs text-muted-foreground">{booking.package_name}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-primary">
                    {formatCurrency(booking.total_amount)}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
                <TableCell>{getPaymentStatusBadge(booking)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onViewDetail(booking)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Detail Booking
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (booking.status === "cancelled") {
                            toast.error("Booking telah dibatalkan. Chat ditutup.");
                            return;
                          }
                          if (booking.status === "pending") {
                            toast.error("Chat hanya dapat digunakan setelah Anda melakukan booking dan pembayaran.");
                            return;
                          }
                          navigate(`/chat/${booking.companion_id}`);
                        }}
                        disabled={booking.status === "cancelled"}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat Partner
                      </DropdownMenuItem>
                      
                      {booking.status === "pending" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={() => onCancel(booking)}
                            >
                                <Ban className="w-4 h-4 mr-2" />
                                Batalkan
                            </DropdownMenuItem>
                          </>
                      )}

                      {booking.status === "completed" && (
                          <>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem onClick={() => navigate(`/companion/${booking.companion_id}`)}>
                                <Repeat className="w-4 h-4 mr-2" />
                                Booking Lagi
                             </DropdownMenuItem>
                          </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {bookings.map((booking) => (
            <Card key={booking.id} className="p-4 border-border/50">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={booking.companion?.avatar_url || booking.companion_image || undefined} />
                            <AvatarFallback>{(booking.companion?.full_name || booking.companion_name || "C").charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium text-foreground text-sm">
                                {booking.companion?.full_name || booking.companion_name || "Unknown"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {booking.package_name}
                            </div>
                        </div>
                    </div>
                    {getStatusBadge(booking.status)}
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(booking.booking_date), "dd MMM yyyy", { locale: id })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{booking.booking_time.substring(0, 5)}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-semibold">{formatCurrency(booking.total_amount)}</span>
                    </div>
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Pembayaran</span>
                        {getPaymentStatusBadge(booking)}
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => onViewDetail(booking)}
                    >
                        Detail
                    </Button>
                    {booking.status === "pending" ? (
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => onCancel(booking)}
                        >
                            Batal
                        </Button>
                    ) : (
                         <Button 
                            variant="secondary" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => navigate(`/chat/${booking.companion_id}`)}
                        >
                            Chat
                        </Button>
                    )}
                </div>
            </Card>
        ))}
      </div>
    </div>
  );
}
