import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { startOfToday, startOfWeek, isSameDay, isAfter, parseISO, startOfMonth } from "date-fns";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "rejected" | "approved";

export interface BookingWithPayment {
  id: string;
  user_id: string;
  companion_id: string | null;
  package_name: string;
  package_duration: string;
  booking_date: string;
  booking_time: string;
  duration_hours: number;
  total_amount: number;
  status: BookingStatus;
  notes: string | null;
  payment_id: string | null;
  created_at: string;
  updated_at: string;
  // Payment details (joined)
  payment?: {
    id: string;
    method: string;
    status: string;
    proof_url: string | null;
    validated_at: string | null;
    created_at: string;
  } | null;
  // Companion details (from notes or companion_id)
  companion_name?: string;
  companion_image?: string;
  companion?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    city: string | null;
  } | null;
}

export interface BookingFilters {
  status?: BookingStatus | "all";
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "newest" | "oldest" | "highest_price" | "lowest_price";
  search?: string;
}

export interface RenterBookingStats {
  activeBookings: number;
  completedBookings: number;
  totalSpent: number;
  avgDuration: number;
}

export function useBookingsHistory() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<RenterBookingStats>({
    activeBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    avgDuration: 0,
  });
  
  const [filters, setFilters] = useState<BookingFilters>({
    status: "all",
    sortBy: "newest",
    search: "",
  });

  const calculateStats = useCallback((data: BookingWithPayment[]) => {
    let active = 0;
    let completed = 0;
    let spent = 0;
    let totalDuration = 0;
    let countForDuration = 0;

    data.forEach(b => {
      // Active: pending, confirmed, approved
      if (["pending", "confirmed", "approved"].includes(b.status)) {
        active++;
      }
      
      // Completed
      if (b.status === "completed") {
        completed++;
        spent += b.total_amount || 0;
        
        if (b.duration_hours > 0) {
          totalDuration += b.duration_hours;
          countForDuration++;
        }
      }
    });

    setStats({
      activeBookings: active,
      completedBookings: completed,
      totalSpent: spent,
      avgDuration: countForDuration > 0 ? totalDuration / countForDuration : 0,
    });
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      // bookings table exists but not in generated types yet
      let query = (supabase as any)
        .from("bookings")
        .select("*")
        .eq("user_id", user.id);

      // We fetch ALL bookings first to calculate stats correctly, then filter in memory or separate query
      // For simplicity and stats accuracy, let's fetch all user bookings and filter in memory for the list view
      // But wait, if we have thousands, this is bad. 
      // Given the scale, fetching all for a single user is likely fine for now (MVP).
      // Let's stick to fetching all for stats, and we can optimize later if needed.
      
      const { data, error: fetchError } = await query.order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Fetch payments for bookings that have payment_id
      const bookingIds = (data || []).map((b: any) => b.id);
      const paymentIds = (data || [])
        .map((b: any) => b.payment_id)
        .filter((id: string | null) => id !== null);
      
      const companionIds = (data || [])
        .map((b: any) => b.companion_id)
        .filter((id: string | null) => id !== null);

      let paymentsMap: Record<string, any> = {};
      if (paymentIds.length > 0) {
        const { data: paymentsData } = await supabase
          .from("payments")
          .select("id, method, status, proof_url, validated_at, created_at, notes, admin_notes")
          .in("id", paymentIds);

        if (paymentsData) {
          paymentsMap = paymentsData.reduce((acc: Record<string, any>, payment: any) => {
            acc[payment.id] = payment;
            return acc;
          }, {});
        }
      }

      let companionsMap: Record<string, any> = {};
      if (companionIds.length > 0) {
        const { data: companionsData } = await supabase
          .from("public_profiles")
          .select("user_id, full_name, username, avatar_url, city")
          .in("user_id", companionIds);
          
        if (companionsData) {
          companionsMap = companionsData.reduce((acc: Record<string, any>, c: any) => {
            acc[c.user_id] = c;
            return acc;
          }, {});
        }
      }

      // Process bookings to extract companion info from notes
      const processedBookings = (data || []).map((booking: any) => {
        const bookingWithPayment: BookingWithPayment = {
          ...booking,
          payment: (booking as any).payment_id ? paymentsMap[(booking as any).payment_id] || null : null,
          companion: (booking as any).companion_id ? companionsMap[(booking as any).companion_id] || null : null,
        };

        // Extract companion info from notes if companion_id is not UUID or just as fallback
        if ((booking as any).notes) {
          const companionMatch = (booking as any).notes.match(/Companion: (.+)/);
          if (companionMatch) {
            bookingWithPayment.companion_name = companionMatch[1];
          }
        }
        
        // Use profile name if available
        if (bookingWithPayment.companion?.full_name) {
            bookingWithPayment.companion_name = bookingWithPayment.companion.full_name;
        }

        return bookingWithPayment;
      });

      setBookings(processedBookings);
      calculateStats(processedBookings);
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Gagal memuat riwayat pemesanan");
      toast.error("Gagal memuat riwayat pemesanan");
    } finally {
      setLoading(false);
    }
  }, [user, calculateStats]);

  useEffect(() => {
    fetchBookings();

    // Subscribe to real-time updates
    if (!user) return;

    const channel = supabase
      .channel("bookings-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchBookings]);

  const updateFilters = useCallback((newFilters: Partial<BookingFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const cancelBooking = async (bookingId: string, reason?: string) => {
    try {
        const { error } = await (supabase as any)
            .from("bookings")
            .update({ status: "cancelled", notes: reason ? `Cancelled by user. Reason: ${reason}` : "Cancelled by user" })
            .eq("id", bookingId)
            .eq("user_id", user?.id); // Ensure ownership

        if (error) throw error;
        
        toast.success("Booking berhasil dibatalkan");
        fetchBookings(); // Refresh
        return true;
    } catch (err: any) {
        console.error("Error cancelling booking:", err);
        toast.error("Gagal membatalkan booking");
        return false;
    }
  };

  const getBookingById = useCallback(
    async (bookingId: string): Promise<BookingWithPayment | null> => {
      if (!user) return null;

      try {
        // bookings table exists but not in generated types yet
        const { data, error } = await (supabase as any)
          .from("bookings")
          .select("*")
          .eq("id", bookingId)
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        if (!data) return null;

        // Fetch payment if payment_id exists
        let payment = null;
        const bookingData = data as any;
        if (bookingData.payment_id) {
          const { data: paymentData } = await supabase
            .from("payments")
            .select("id, method, status, proof_url, validated_at, created_at, notes, admin_notes")
            .eq("id", bookingData.payment_id)
            .single();

          payment = paymentData || null;
        }

        // Fetch companion profile
        let companion = null;
        if (bookingData.companion_id) {
            const { data: companionData } = await supabase
                .from("public_profiles")
                .select("user_id, full_name, username, avatar_url, city")
                .eq("user_id", bookingData.companion_id)
                .single();
            companion = companionData || null;
        }

        const booking: BookingWithPayment = {
          ...bookingData,
          payment,
          companion
        };

        // Extract companion info from notes
        if (bookingData.notes) {
          const companionMatch = bookingData.notes.match(/Companion: (.+)/);
          if (companionMatch) {
            booking.companion_name = companionMatch[1];
          }
        }
        
        if (companion?.full_name) {
            booking.companion_name = companion.full_name;
        }

        return booking;
      } catch (err: any) {
        console.error("Error fetching booking:", err);
        toast.error("Gagal memuat detail pemesanan");
        return null;
      }
    },
    [user]
  );

  return {
    bookings,
    stats,
    loading,
    error,
    filters,
    updateFilters,
    refetch: fetchBookings,
    getBookingById,
    cancelBooking
  };
}

