import { useState, useMemo } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, RefreshCw, ChevronLeft } from "lucide-react";
import { useCompanionBookings, CompanionBooking, BookingStatus } from "@/hooks/useCompanionBookings";
import { BookingStatsCards } from "@/components/dashboard/bookings/BookingStatsCards";
import { BookingFilters, FilterState } from "@/components/dashboard/bookings/BookingFilters";
import { BookingTable } from "@/components/dashboard/bookings/BookingTable";
import { BookingActionDialog } from "@/components/dashboard/bookings/BookingActionDialog";
import { BookingDetailModal } from "@/components/dashboard/bookings/BookingDetailModal";
import { startOfToday, startOfWeek, isSameDay, isAfter, parseISO, startOfMonth } from "date-fns";

import { Badge } from "@/components/ui/badge";

export default function IncomingBookings() {
  const navigate = useNavigate();
  const { bookings, loading, stats, refetch, updateBookingStatus } = useCompanionBookings();

  // State
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    dateRange: "all",
    sortBy: "newest",
  });

  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: "approve" | "reject" | null;
    booking: CompanionBooking | null;
  }>({
    open: false,
    type: null,
    booking: null,
  });

  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    booking: CompanionBooking | null;
  }>({
    open: false,
    booking: null,
  });

  // Filter Logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Search
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        !filters.search ||
        booking.renter?.full_name?.toLowerCase().includes(searchLower) ||
        booking.id.toLowerCase().includes(searchLower) ||
        booking.package_name.toLowerCase().includes(searchLower);

      // Status
      const matchesStatus = filters.status === "all" || booking.status === filters.status;

      // Date Range
      const bookingDate = parseISO(booking.booking_date);
      const now = new Date();
      let matchesDate = true;
      if (filters.dateRange === "today") {
        matchesDate = isSameDay(bookingDate, now);
      } else if (filters.dateRange === "week") {
        matchesDate = isAfter(bookingDate, startOfWeek(now));
      } else if (filters.dateRange === "month") {
        matchesDate = isAfter(bookingDate, startOfMonth(now));
      }

      return matchesSearch && matchesStatus && matchesDate;
    }).sort((a, b) => {
      switch (filters.sortBy) {
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
  }, [bookings, filters]);

  // Handlers
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      dateRange: "all",
      sortBy: "newest",
    });
  };

  const handleApprove = (booking: CompanionBooking) => {
    setActionDialog({ open: true, type: "approve", booking });
  };

  const handleReject = (booking: CompanionBooking) => {
    setActionDialog({ open: true, type: "reject", booking });
  };

  const handleViewDetail = (booking: CompanionBooking) => {
    setDetailModal({ open: true, booking });
  };

  const handleConfirmAction = async (notes?: string) => {
    if (!actionDialog.booking || !actionDialog.type) return;
    
    const success = await updateBookingStatus(
      actionDialog.booking.id, 
      actionDialog.type === "approve" ? "approved" : "rejected",
      notes
    );

    if (success) {
      // Close dialog handled by component via open change, but we ensure it here
      setActionDialog(prev => ({ ...prev, open: false }));
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
                Booking Masuk
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
                Menunggu: {stats.pendingCount}
              </Badge>
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-200">
                Diterima: {stats.approvedCount}
              </Badge>
              <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-200">
                Ditolak: {stats.rejectedCount}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="default" size="sm" onClick={() => navigate("/dashboard/companion")}>
              Dashboard
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <section className="mb-8">
          <BookingStatsCards stats={stats} loading={loading} />
        </section>

        {/* Main Content */}
        <div className="space-y-6">
          <BookingFilters 
            filters={filters} 
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          <BookingTable 
            bookings={filteredBookings} 
            loading={loading}
            onApprove={handleApprove}
            onReject={handleReject}
            onViewDetail={handleViewDetail}
          />
        </div>

        {/* Dialogs */}
        <BookingActionDialog
          open={actionDialog.open}
          onOpenChange={(open) => setActionDialog(prev => ({ ...prev, open }))}
          type={actionDialog.type}
          booking={actionDialog.booking}
          onConfirm={handleConfirmAction}
        />

        <BookingDetailModal
          open={detailModal.open}
          onOpenChange={(open) => setDetailModal(prev => ({ ...prev, open }))}
          booking={detailModal.booking}
        />
      </div>
    </MobileLayout>
  );
}
