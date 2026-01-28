import { MobileLayout } from "@/components/MobileLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, User, MessageCircle, Bell } from "lucide-react";

export default function DashboardCompanion() {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <div className="container mx-auto px-4 max-w-3xl py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Dashboard Teman yang Disewa
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola profil layanan, lihat booking masuk, dan chat dengan penyewa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 border-border/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-foreground">Edit Profil Layanan</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Foto, deskripsi, harga, jadwal, paket.
                </div>
              </div>
              <User className="w-6 h-6 text-primary" />
            </div>
            <Button className="w-full mt-4" variant="gradient" onClick={() => navigate("/profile")}>
              Edit Profil
            </Button>
          </Card>

          <Card className="p-5 border-border/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-foreground">Booking Saya</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Lihat pesanan yang kamu buat sebagai penyewa.
                </div>
              </div>
              <CalendarCheck className="w-6 h-6 text-primary" />
            </div>
            <Button className="w-full mt-4" variant="outline" onClick={() => navigate("/companion/booking")}>
              Lihat Booking
            </Button>
          </Card>

          <Card className="p-5 border-border/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-foreground">Booking Masuk</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Lihat booking yang ditujukan untuk kamu.
                </div>
              </div>
              <CalendarCheck className="w-6 h-6 text-primary" />
            </div>
            <Button className="w-full mt-4" variant="outline" onClick={() => navigate("/companion/bookings")}>
              Lihat Booking
            </Button>
          </Card>

          <Card className="p-5 border-border/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-foreground">Chat</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Balas pesan dari penyewa.
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
                  Update booking dan info sistem.
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


