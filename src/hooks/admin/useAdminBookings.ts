import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { BookingService } from '@/services/admin/bookingService';
import { AdminBooking, BookingFilters } from '@/types/admin';

export function useAdminBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BookingFilters>({ status: 'all' });

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await BookingService.fetchBookings(filters);
      setBookings(data);
    } catch (error) {
      toast.error('Gagal memuat data booking');
    } finally {
      setLoading(false);
    }
  };

  const approveBooking = async (bookingId: string, adminNotes?: string) => {
    try {
      await BookingService.approveBooking(bookingId, adminNotes);
      toast.success('Booking berhasil disetujui');
      await fetchBookings();
    } catch (error) {
      toast.error('Gagal menyetujui booking');
    }
  };

  const rejectBooking = async (bookingId: string, reason: string) => {
    try {
      await BookingService.rejectBooking(bookingId, reason);
      toast.success('Booking ditolak');
      await fetchBookings();
    } catch (error) {
      toast.error('Gagal menolak booking');
    }
  };

  const cancelBooking = async (bookingId: string, reason: string) => {
    try {
      await BookingService.cancelBooking(bookingId, reason);
      toast.success('Booking dibatalkan');
      await fetchBookings();
    } catch (error) {
      toast.error('Gagal membatalkan booking');
    }
  };

  const getBookingById = async (bookingId: string) => {
    return await BookingService.getBookingById(bookingId);
  };

  const updateFilters = (newFilters: Partial<BookingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    bookings,
    loading,
    filters,
    updateFilters,
    approveBooking,
    rejectBooking,
    cancelBooking,
    getBookingById,
    refetch: fetchBookings,
  };
}