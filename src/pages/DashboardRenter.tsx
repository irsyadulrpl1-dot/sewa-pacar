import { MobileLayout } from "@/components/MobileLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Sparkles, MessageCircle, Bell } from "lucide-react";

export default function DashboardRenter() {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <div className="container mx-auto px-4 max-w-3xl py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Dashboard Penyewa
          </h1>
          <p className="text-muted-foreground mt-1">
            Mulai jelajahi, booking, dan kelola pesanan kamu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 border-border/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-foreground">Jelajahi Teman</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Cari companion dan lihat profil lengkap.
                </div>
              </div>
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <Button className="w-full mt-4" variant="gradient" onClick={() => navigate("/find-friends")}>
              Mulai Explore
            </Button>
          </Card>

          <Card className="p-5 border-border/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-foreground">Riwayat Booking</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Pantau status booking & pembayaran.
                </div>
              </div>
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <Button className="w-full mt-4" variant="outline" onClick={() => navigate("/bookings")}>
              Lihat Booking
            </Button>
          </Card>

          <Card className="p-5 border-border/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-foreground">Chat</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Lanjutkan percakapan setelah booking.
                </div>
              </div>
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <Button className="w-full mt-4" variant="outline" onClick={() => navigate("/messages")}>
              Buka Chat
            </Button>
          </Card>

          <Card className="p-5 border-border/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-foreground">Notifikasi</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Update booking, pembayaran, dan info sistem.
                </div>
              </div>
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <Button className="w-full mt-4" variant="outline" onClick={() => navigate("/notifications")}>
              Lihat Notifikasi
            </Button>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}


