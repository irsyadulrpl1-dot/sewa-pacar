import { useState, useMemo } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, RefreshCw, ChevronLeft, Plus } from "lucide-react";
import { useBookingsHistory, BookingWithPayment } from "@/hooks/useBookingsHistory";
import { RenterBookingStatsCards } from "@/components/dashboard/my-bookings/RenterBookingStatsCards";
import { RenterBookingFilters } from "@/components/dashboard/my-bookings/RenterBookingFilters";
import { RenterBookingList } from "@/components/dashboard/my-bookings/RenterBookingList";
import { RenterBookingDetailModal } from "@/components/dashboard/my-bookings/RenterBookingDetailModal";
import { RenterBookingActionDialog } from "@/components/dashboard/my-bookings/RenterBookingActionDialog";
import { Badge } from "@/components/ui/badge";

export default function CompanionMyBookings() {
  const navigate = useNavigate();
  const { bookings, stats, loading, refetch, cancelBooking, filters: hookFilters, updateFilters } = useBookingsHistory();

  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    booking: BookingWithPayment | null;
  }>({
    open: false,
    booking: null,
  });

  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean;
    booking: BookingWithPayment | null;
  }>({
    open: false,
    booking: null,
  });

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        const searchLower = (hookFilters.search || "").toLowerCase();
        const matchesSearch =
          !searchLower ||
          booking.companion?.full_name?.toLowerCase().includes(searchLower) ||
          booking.companion_name?.toLowerCase().includes(searchLower) ||
          booking.id.toLowerCase().includes(searchLower) ||
          booking.package_name.toLowerCase().includes(searchLower);
        const matchesStatus = hookFilters.status === "all" || !hookFilters.status || booking.status === hookFilters.status;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (hookFilters.sortBy) {
          case "newest":
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case "oldest":
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case "highest_price":
            return b.total_amount - a.total_amount;
          case "lowest_price":
            return a.total_amount - b.total_amount;
          default:
            return 0;
        }
      });
  }, [bookings, hookFilters]);

  const handleFilterChange = (key: any, value: any) => {
    updateFilters({ [key]: value });
  };

  const handleResetFilters = () => {
    updateFilters({
      search: "",
      status: "all",
      sortBy: "newest",
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const handleViewDetail = (booking: BookingWithPayment) => {
    setDetailModal({ open: true, booking });
  };

  const handleCancelClick = (booking: BookingWithPayment) => {
    setCancelDialog({ open: true, booking });
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!cancelDialog.booking) return;
    await cancelBooking(cancelDialog.booking.id, reason);
    setCancelDialog({ open: false, booking: null });
    if (detailModal.open && detailModal.booking?.id === cancelDialog.booking.id) {
      setDetailModal({ open: false, booking: null });
    }
  };

  return (
    <MobileLayout>
      <div className="container mx-auto px-4 max-w-7xl py-6 pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button variant="ghost" size="icon" className="-ml-2 md:hidden" onClick={() => navigate(-1)}>
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <CalendarCheck className="w-6 h-6 text-primary hidden md:block" />
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Booking Saya</h1>
            </div>
            <p className="text-muted-foreground">Pantau semua status booking dan riwayat sewa kamu</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
                Aktif: {stats.activeBookings}
              </Badge>
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-200">
                Selesai: {stats.completedBookings}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="default" size="sm" onClick={() => navigate("/companions")}>
              <Plus className="w-4 h-4 mr-2" />
              Booking Baru
            </Button>
          </div>
        </div>

        <section className="mb-8">
          <RenterBookingStatsCards stats={stats} loading={loading} />
        </section>

        <div className="space-y-6">
          <RenterBookingFilters filters={hookFilters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />

          <RenterBookingList bookings={filteredBookings} loading={loading} onViewDetail={handleViewDetail} onCancel={handleCancelClick} />
        </div>

        <RenterBookingDetailModal
          open={detailModal.open}
          onOpenChange={(open) => setDetailModal((prev) => ({ ...prev, open }))}
          booking={detailModal.booking}
          onCancelBooking={handleCancelClick}
        />

        <RenterBookingActionDialog
          open={cancelDialog.open}
          onOpenChange={(open) => setCancelDialog((prev) => ({ ...prev, open }))}
          booking={cancelDialog.booking}
          onConfirmCancel={handleConfirmCancel}
        />
      </div>
    </MobileLayout>
  );
}
