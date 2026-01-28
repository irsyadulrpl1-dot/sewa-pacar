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
  CheckCircle2, 
  XCircle, 
  Eye, 
  MapPin, 
  Clock, 
  Calendar,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CompanionBooking } from "@/hooks/useCompanionBookings";

interface BookingTableProps {
  bookings: CompanionBooking[];
  loading: boolean;
  onApprove: (booking: CompanionBooking) => void;
  onReject: (booking: CompanionBooking) => void;
  onViewDetail: (booking: CompanionBooking) => void;
}

export function BookingTable({ 
  bookings, 
  loading, 
  onApprove, 
  onReject, 
  onViewDetail 
}: BookingTableProps) {
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
      case "cancelled":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">Ditolak</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">Selesai</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
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
        <p className="text-muted-foreground max-w-sm mx-auto mt-1">
          Belum ada permintaan booking yang sesuai dengan filter kamu.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Penyewa</TableHead>
            <TableHead>Jadwal</TableHead>
            <TableHead>Durasi & Paket</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id} className="hover:bg-muted/30 transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={booking.renter?.avatar_url || undefined} />
                    <AvatarFallback>{booking.renter?.full_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground">
                      {booking.renter?.full_name || "Tanpa Nama"}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {booking.renter?.city || "Lokasi tidak diketahui"}
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
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {booking.status === "pending" ? (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => onApprove(booking)}
                        title="Terima"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onReject(booking)}
                        title="Tolak"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  ) : null}
                  
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
                      <DropdownMenuItem>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat Penyewa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
