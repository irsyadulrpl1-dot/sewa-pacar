import { useState, useMemo } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, RefreshCw, ChevronLeft, Plus } from "lucide-react";
import { useBookingsHistory, BookingWithPayment, BookingStatus } from "@/hooks/useBookingsHistory";
import { RenterBookingStatsCards } from "@/components/dashboard/my-bookings/RenterBookingStatsCards";
import { RenterBookingFilters } from "@/components/dashboard/my-bookings/RenterBookingFilters";
import { RenterBookingList } from "@/components/dashboard/my-bookings/RenterBookingList";
import { RenterBookingDetailModal } from "@/components/dashboard/my-bookings/RenterBookingDetailModal";
import { RenterBookingActionDialog } from "@/components/dashboard/my-bookings/RenterBookingActionDialog";
import { Badge } from "@/components/ui/badge";
import { startOfToday, startOfWeek, isSameDay, isAfter, parseISO, startOfMonth } from "date-fns";

export default function BookingsHistory() {
  const navigate = useNavigate();
  const { bookings, stats, loading, refetch, cancelBooking, filters: hookFilters, updateFilters } = useBookingsHistory();

  // Dialog States
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

  // Filter Logic
  // Note: Hook already handles simple filtering, but for advanced search/date logic we might do it client-side 
  // or update the hook to handle complex queries. For now, client-side filtering on the fetched data
  // is smoother for the user experience given the likely volume.
  // We will override/extend the hook's filter logic here for the UI display.
  
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Search
      const searchLower = (hookFilters.search || "").toLowerCase();
      const matchesSearch = 
        !searchLower ||
        booking.companion?.full_name?.toLowerCase().includes(searchLower) ||
        booking.companion_name?.toLowerCase().includes(searchLower) ||
        booking.id.toLowerCase().includes(searchLower) ||
        booking.package_name.toLowerCase().includes(searchLower);

      // Status handled by hook usually, but if we want "all" to really mean all fetched
      // we rely on hook returning all if status is 'all'.
      // If we change filter locally, we should probably update hook filter to trigger refetch OR filter client side.
      // Let's filter client side for instant feedback since we fetched all.
      const matchesStatus = hookFilters.status === "all" || !hookFilters.status || booking.status === hookFilters.status;

      // Date Range (Client side logic for "Today", "Week")
      // Hook has dateFrom/dateTo but specific presets are easier here
      // For now we haven't implemented dateFrom/dateTo in the UI controls fully, assuming "dateRange" preset
      // Let's assume we want to implement the presets "today", "week" etc.
      // But the hook filters struct uses dateFrom/dateTo strings.
      // We will skip strict date filtering for now unless user explicitly picked a range, 
      // or if we map "today" to dateFrom=todayStr in the Filter component.
      
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
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

  // Handlers
  const handleFilterChange = (key: any, value: any) => {
      // If dateRange preset is selected, we might want to convert to dateFrom/dateTo
      // For simplicity, we just pass through for now or handle search/status/sort
      updateFilters({ [key]: value });
  };

  const handleResetFilters = () => {
    updateFilters({
      search: "",
      status: "all",
      sortBy: "newest",
      dateFrom: undefined,
      dateTo: undefined
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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button variant="ghost" size="icon" className="-ml-2 md:hidden" onClick={() => navigate(-1)}>
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <CalendarCheck className="w-6 h-6 text-primary hidden md:block" />
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Booking Saya
              </h1>
            </div>
            <p className="text-muted-foreground">
               Pantau semua status booking dan riwayat sewa kamu
            </p>
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

        {/* Stats Cards */}
        <section className="mb-8">
          <RenterBookingStatsCards stats={stats} loading={loading} />
        </section>

        {/* Main Content */}
        <div className="space-y-6">
          <RenterBookingFilters 
            filters={hookFilters} 
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          <RenterBookingList 
            bookings={filteredBookings} 
            loading={loading}
            onViewDetail={handleViewDetail}
            onCancel={handleCancelClick}
          />
        </div>

        {/* Dialogs */}
        <RenterBookingDetailModal
          open={detailModal.open}
          onOpenChange={(open) => setDetailModal(prev => ({ ...prev, open }))}
          booking={detailModal.booking}
          onCancelBooking={handleCancelClick}
        />

        <RenterBookingActionDialog
          open={cancelDialog.open}
          onOpenChange={(open) => setCancelDialog(prev => ({ ...prev, open }))}
          booking={cancelDialog.booking}
          onConfirmCancel={handleConfirmCancel}
        />
      </div>
    </MobileLayout>
  );
}
