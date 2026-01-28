import { supabase } from '@/integrations/supabase/client';
import { AdminBooking, BookingFilters, BookingStatus } from '@/types/admin';

export class BookingService {
  /**
   * Fetch bookings with optional filters
   */
  static async fetchBookings(filters?: BookingFilters): Promise<AdminBooking[]> {
    try {
      let query = supabase
        .from('bookings' as any)
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.dateFrom) {
        query = query.gte('booking_date', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('booking_date', filters.dateTo);
      }

      if (filters?.companionId) {
        query = query.eq('companion_id', filters.companionId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bookings:', error);
        return [];
      }

      // Fetch user details for each booking
      const bookingsWithDetails = await Promise.all(
        (data || []).map(async (booking: any) => {
          const { data: renter } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', booking.renter_id)
            .single();

          const { data: companion } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', booking.companion_id)
            .single();

          return {
            ...booking,
            renter_name: renter?.full_name || 'Unknown',
            renter_email: renter?.email || '',
            companion_name: companion?.full_name || 'Unknown',
            companion_avatar: companion?.avatar_url || null,
          };
        })
      );

      return bookingsWithDetails;
    } catch (error) {
      console.error('Error in fetchBookings:', error);
      return [];
    }
  }

  /**
   * Get booking by ID with full details
   */
  static async getBookingById(bookingId: string): Promise<AdminBooking | null> {
    try {
      const { data, error } = await supabase
        .from('bookings' as any)
        .select('*')
        .eq('id', bookingId)
        .single();

      if (error) throw error;

      const bookingData = data as any;

      // Fetch user details
      const { data: renter } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('user_id', bookingData.renter_id)
        .single();

      const { data: companion } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', bookingData.companion_id)
        .single();

      return {
        ...bookingData,
        renter_name: renter?.full_name || 'Unknown',
        renter_email: renter?.email || '',
        companion_name: companion?.full_name || 'Unknown',
        companion_avatar: companion?.avatar_url || null,
      } as AdminBooking;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      return null;
    }
  }

  /**
   * Approve booking
   */
  static async approveBooking(bookingId: string, adminNotes?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('bookings' as any)
        .update({
          status: 'approved',
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;
    } catch (error) {
      console.error('Error approving booking:', error);
      throw error;
    }
  }

  /**
   * Reject booking
   */
  static async rejectBooking(bookingId: string, reason: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('bookings' as any)
        .update({
          status: 'rejected',
          admin_notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;
    } catch (error) {
      console.error('Error rejecting booking:', error);
      throw error;
    }
  }

  /**
   * Cancel booking
   */
  static async cancelBooking(bookingId: string, reason: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('bookings' as any)
        .update({
          status: 'cancelled',
          admin_notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }
}