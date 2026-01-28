import { MobileLayout } from "@/components/MobileLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, Sparkles, User, Clock, MapPin } from "lucide-react";
import { useCompanionBookings } from "@/hooks/useCompanionBookings";

export default function IncomingBookings() {
  const navigate = useNavigate();
  const { bookings, loading } = useCompanionBookings();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      pending: { label: "Pending", className: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" },
      confirmed: { label: "Confirmed", className: "bg-green-500/20 text-green-700 dark:text-green-400" },
      completed: { label: "Selesai", className: "bg-blue-500/20 text-blue-700 dark:text-blue-400" },
      cancelled: { label: "Dibatalkan", className: "bg-red-500/20 text-red-700 dark:text-red-400" },
    };
    const cfg = map[status] || map.pending;
    return <Badge className={cfg.className}>{cfg.label}</Badge>;
  };

  return (
    <MobileLayout>
      <div className="container mx-auto px-4 max-w-4xl py-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarCheck className="w-6 h-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Booking Masuk
              </h1>
            </div>
            <p className="text-muted-foreground">
              Daftar booking yang ditujukan untuk kamu.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            Home
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Sparkles className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : bookings.length === 0 ? (
          <Card className="p-6 border-border/50">
            <p className="text-muted-foreground">Belum ada booking masuk.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <Card key={b.id} className="p-4 md:p-6 border-border/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {b.renter?.full_name || b.renter?.username || "Penyewa"}
                      </span>
                    </div>
                    <div className="font-semibold text-foreground text-lg">
                      {b.package_name} • {b.package_duration}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarCheck className="w-4 h-4" />
                        {b.booking_date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {String(b.booking_time).substring(0, 5)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {b.duration_hours} jam
                      </div>
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      Total: {formatPrice(Number(b.total_amount) || 0)}
                    </div>
                  </div>
                  {statusBadge(b.status)}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
