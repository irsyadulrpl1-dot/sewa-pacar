import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { PaymentMethod } from "./usePayments";
import { CompanionInfo } from "@/components/booking/BookingWizard";
import { useChatFromBooking } from "./useChatFromBooking";

// Helper function to validate UUID
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export interface BookingPackage {
  name: string;
  duration: string;
  price: number;
}

export interface BookingData {
  companion: CompanionInfo | null;
  selectedPackage: BookingPackage | null;
  selectedDate: string | null;
  selectedTime: string | null;
  duration: number | null; // in hours
  notes: string | null;
  paymentMethod: PaymentMethod | null;
  bookingId: string | null;
  paymentId: string | null;
  totalAmount: number;
}

export interface Booking {
  id: string;
  user_id: string;
  companion_id: string;
  package_name: string;
  package_duration: string;
  booking_date: string;
  booking_time: string;
  duration_hours: number;
  total_amount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string | null;
  payment_id: string | null;
  created_at: string;
  updated_at: string;
}

const initialBookingData: BookingData = {
  companion: null,
  selectedPackage: null,
  selectedDate: null,
  selectedTime: null,
  duration: null,
  notes: null,
  paymentMethod: null,
  bookingId: null,
  paymentId: null,
  totalAmount: 0,
};

export function useBooking() {
  const { user } = useAuth();
  const [bookingData, setBookingData] = useState<BookingData>(initialBookingData);
  const [isLoading, setIsLoading] = useState(false);
  const { createChatFromBooking } = useChatFromBooking();

  // Create notification safely (does not break booking flow if notifications table/policy isn't ready)
  const safeNotify = useCallback(
    async (payload: {
      type: string;
      title: string;
      message: string;
      related_id?: string | null;
      related_type?: string | null;
      metadata?: Record<string, any> | null;
    }) => {
      if (!user) return;
      try {
        await (supabase as any).from("notifications").insert({
          user_id: user.id,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          related_id: payload.related_id || null,
          related_type: payload.related_type || null,
          metadata: payload.metadata || null,
        });
      } catch {
        // ignore
      }
    },
    [user?.id],
  );

  const updateBookingData = useCallback((updates: Partial<BookingData>) => {
    console.log("updateBookingData called with:", updates);
    setBookingData((prev) => {
      const updated = { ...prev, ...updates };
      
      // Auto-calculate total amount
      if (updated.selectedPackage && updated.duration && updated.duration > 0) {
        const hourlyRate = updated.companion?.hourlyRate || updated.selectedPackage.price;
        updated.totalAmount = hourlyRate * updated.duration;
        console.log("Total amount calculated:", updated.totalAmount, "from", hourlyRate, "x", updated.duration);
      } else if (updated.selectedPackage) {
        // If no duration yet, use package price as base
        updated.totalAmount = updated.selectedPackage.price;
        console.log("Total amount set to package price:", updated.totalAmount);
      }
      
      console.log("Booking data updated:", {
        ...updated,
        selectedPackage: updated.selectedPackage ? {
          name: updated.selectedPackage.name,
          duration: updated.selectedPackage.duration,
          price: updated.selectedPackage.price,
        } : null,
      });
      return updated;
    });
  }, []);

  const resetBooking = useCallback(() => {
    setBookingData(initialBookingData);
  }, []);

  const createBooking = useCallback(async (): Promise<Booking | null> => {
    if (!user) {
      throw new Error("Silakan login terlebih dahulu");
    }

    try {
      const { data: me } = await (supabase as any)
        .from("profiles")
        .select("hourly_rate, role")
        .eq("user_id", user.id)
        .maybeSingle();
      const currentIsCompanion = !!me?.hourly_rate || me?.role === "companion";
      const targetIsCompanion = (bookingData.companion?.hourlyRate || 0) > 0;
      if (currentIsCompanion && targetIsCompanion) {
        throw new Error("Akun talent tidak bisa memesan sesama talent");
      }
    } catch (e: any) {
      if (e?.message) {
        throw new Error(e.message);
      }
      throw new Error("Gagal memvalidasi akun pemesan");
    }

    // Detailed validation with specific error messages
    if (!bookingData.companion) {
      throw new Error("Data companion tidak ditemukan. Silakan refresh halaman.");
    }
    if (!bookingData.selectedPackage) {
      throw new Error("Paket belum dipilih. Silakan kembali ke step 1.");
    }
    if (!bookingData.selectedDate) {
      throw new Error("Tanggal belum dipilih. Silakan kembali ke step 2.");
    }
    if (!bookingData.selectedTime) {
      throw new Error("Jam belum dipilih. Silakan kembali ke step 2.");
    }
    if (!bookingData.duration || bookingData.duration <= 0) {
      throw new Error("Durasi belum dipilih atau tidak valid. Silakan kembali ke step 2.");
    }
    if (!bookingData.totalAmount || bookingData.totalAmount <= 0) {
      // Recalculate total amount if needed
      const hourlyRate = bookingData.companion?.hourlyRate || bookingData.selectedPackage.price;
      const calculatedAmount = hourlyRate * bookingData.duration;
      if (calculatedAmount <= 0) {
        throw new Error("Total pembayaran tidak valid. Silakan coba lagi.");
      }
      // Update total amount
      setBookingData((prev) => ({ ...prev, totalAmount: calculatedAmount }));
    }

    setIsLoading(true);
    try {
      // Validate and handle companion_id (may not be UUID if from static data)
      let companionId: string | null = null;
      if (bookingData.companion?.id) {
        if (isValidUUID(bookingData.companion.id)) {
          companionId = bookingData.companion.id;
        } else {
          console.warn('companion_id is not a valid UUID, setting to null:', bookingData.companion.id);
          // companion_id is not a UUID (e.g., "luna-salsabila"), set to null
          // Companion info will be stored in notes or we can add a companion_name field
        }
      }

      // Prepare notes with companion info if companion_id is not UUID
      let finalNotes = bookingData.notes || "";
      if (!companionId && bookingData.companion) {
        const companionInfo = [
          `Companion: ${bookingData.companion.name}`,
          bookingData.companion.city ? `Lokasi: ${bookingData.companion.city}` : null,
          `ID: ${bookingData.companion.id}`,
        ].filter(Boolean).join("\n");
        finalNotes = finalNotes 
          ? `${finalNotes}\n\n--- Informasi Companion ---\n${companionInfo}`
          : `--- Informasi Companion ---\n${companionInfo}`;
      }

      // Prepare booking data
      const bookingPayload = {
        user_id: user.id,
        companion_id: companionId, // null if not UUID
        package_name: bookingData.selectedPackage.name,
        package_duration: bookingData.selectedPackage.duration,
        booking_date: bookingData.selectedDate,
        booking_time: bookingData.selectedTime,
        duration_hours: bookingData.duration,
        total_amount: bookingData.totalAmount || (bookingData.companion?.hourlyRate || bookingData.selectedPackage.price) * bookingData.duration,
        notes: finalNotes || null,
        status: "pending" as const,
      };

      console.log("Creating booking with payload:", {
        ...bookingPayload,
        companion_id_original: bookingData.companion?.id,
        companion_id_validated: companionId,
      });

      // bookings table exists but not in generated types yet
      const { data, error } = await (supabase as any)
        .from("bookings")
        .insert(bookingPayload)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        // Provide more specific error messages
        if (error.code === "42P01") {
          throw new Error("Tabel bookings belum dibuat. Silakan jalankan migration terlebih dahulu.");
        }
        if (error.code === "42501") {
          throw new Error("Tidak memiliki izin untuk membuat pemesanan. Silakan hubungi admin.");
        }
        if (error.code === "23503") {
          throw new Error("Data tidak valid. Pastikan companion ID benar.");
        }
        throw error;
      }

      if (!data) {
        throw new Error("Gagal membuat pemesanan: Data tidak dikembalikan dari server.");
      }

      updateBookingData({ bookingId: data.id });
      toast.success("Pemesanan berhasil dibuat");

      // Notification for user: booking created (pending)
      await safeNotify({
        type: "system_announcement",
        title: "Pemesanan dibuat ✅",
        message: `Pemesanan kamu berhasil dibuat dan sedang menunggu konfirmasi. Partner: ${bookingData.companion?.name || "Partner"}`,
        related_id: data.id,
        related_type: "booking",
        metadata: {
          booking_id: data.id,
          companion_name: bookingData.companion?.name || null,
          package_name: bookingData.selectedPackage?.name || null,
          booking_date: bookingData.selectedDate || null,
          booking_time: bookingData.selectedTime || null,
          duration_hours: bookingData.duration || null,
          total_amount: bookingPayload.total_amount,
          status: "pending",
        },
      });

      // Auto-create system chat message with booking details (will be read-only until aktif)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const companionValidId = bookingPayload.companion_id;
      if (companionValidId && uuidRegex.test(companionValidId)) {
        await createChatFromBooking(
          data.id,
          user.id,
          companionValidId,
          {
            date: bookingPayload.booking_date,
            time: bookingPayload.booking_time as string,
            duration: bookingPayload.duration_hours as number,
            packageName: bookingPayload.package_name,
          }
        );
      }

      return (data as unknown) as Booking;
    } catch (error: any) {
      console.error("Error creating booking:", error);
      const errorMessage = error.message || error.details || "Gagal membuat pemesanan. Silakan coba lagi.";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user, bookingData, updateBookingData, safeNotify]);

  const updateBookingStatus = useCallback(async (bookingId: string, status: Booking["status"]) => {
    if (!user) {
      throw new Error("Silakan login terlebih dahulu");
    }

    setIsLoading(true);
    try {
      // bookings table exists but not in generated types yet
      const { data, error } = await (supabase as any)
        .from("bookings")
        .update({ status })
        .eq("id", bookingId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return (data as unknown) as Booking;
    } catch (error: any) {
      console.error("Error updating booking status:", error);
      throw new Error(error.message || "Gagal mengupdate status pemesanan");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const linkPaymentToBooking = useCallback(async (bookingId: string, paymentId: string) => {
    if (!user) {
      throw new Error("Silakan login terlebih dahulu");
    }

    setIsLoading(true);
    try {
      // bookings table exists but not in generated types yet
      const { error } = await (supabase as any)
        .from("bookings")
        .update({ payment_id: paymentId })
        .eq("id", bookingId)
        .eq("user_id", user.id);

      if (error) throw error;
      updateBookingData({ paymentId });
    } catch (error: any) {
      console.error("Error linking payment to booking:", error);
      throw new Error(error.message || "Gagal menghubungkan pembayaran");
    } finally {
      setIsLoading(false);
    }
  }, [user, updateBookingData]);

  return {
    bookingData,
    updateBookingData,
    resetBooking,
    createBooking,
    updateBookingStatus,
    linkPaymentToBooking,
    isLoading,
  };
}

