import { supabase } from '@/integrations/supabase/client';
import { DashboardStats } from '@/types/admin';
import { startOfToday, endOfToday } from 'date-fns';

export class DashboardService {
  /**
   * Fetch all dashboard statistics
   */
  static async fetchDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch user counts
      const { renters, companions } = await this.fetchUserCounts();
      
      // Fetch booking stats
      const bookingStats = await this.fetchBookingStats();
      
      // Fetch payment stats
      const { data: payments } = await supabase
        .from('payments')
        .select('status')
        .eq('status', 'waiting_validation');

      return {
        totalRenters: renters,
        totalCompanions: companions,
        totalBookings: bookingStats.total,
        todayBookings: bookingStats.today,
        pendingBookings: bookingStats.pending,
        approvedBookings: bookingStats.approved,
        verifiedCompanions: bookingStats.verifiedCompanions,
        unverifiedCompanions: companions - bookingStats.verifiedCompanions,
        pendingPayments: payments?.length || 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalRenters: 0,
        totalCompanions: 0,
        totalBookings: 0,
        todayBookings: 0,
        pendingBookings: 0,
        approvedBookings: 0,
        verifiedCompanions: 0,
        unverifiedCompanions: 0,
        pendingPayments: 0,
      };
    }
  }

  /**
   * Fetch user counts by role
   */
  private static async fetchUserCounts(): Promise<{ renters: number; companions: number }> {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role');

    const renters = roles?.filter(r => r.role === 'user').length || 0;
    const companions = roles?.filter(r => r.role === 'talent').length || 0;

    return { renters, companions };
  }

  /**
   * Fetch booking statistics
   */
  private static async fetchBookingStats(): Promise<{
    total: number;
    today: number;
    pending: number;
    approved: number;
    verifiedCompanions: number;
  }> {
    try {
      // Fetch all bookings
      const { data: allBookings } = await supabase
        .from('bookings' as any)
        .select('status, booking_date, created_at');

      // Type cast to work with bookings data
      const bookings = (allBookings || []) as any[];

      const today = new Date().toISOString().split('T')[0];
      const todayBookings = bookings.filter(b => 
        b.booking_date?.startsWith(today)
      ).length;

      const pendingBookings = bookings.filter(b => 
        b.status === 'pending'
      ).length;

      const approvedBookings = bookings.filter(b => 
        b.status === 'approved'
      ).length;

      // Fetch verified companions
      const { data: verifiedCompanions } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('is_verified', true);

      // Get only those with talent role
      const { data: companionRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'talent')
        .in('user_id', verifiedCompanions?.map(c => c.user_id) || []);

      return {
        total: bookings.length,
        today: todayBookings,
        pending: pendingBookings,
        approved: approvedBookings,
        verifiedCompanions: companionRoles?.length || 0,
      };
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      return {
        total: 0,
        today: 0,
        pending: 0,
        approved: 0,
        verifiedCompanions: 0,
      };
    }
  }
}