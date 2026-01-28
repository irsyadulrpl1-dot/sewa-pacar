import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/**
 * Hook untuk membuat chat otomatis dari booking yang dikonfirmasi
 */
export function useChatFromBooking() {
  const { user } = useAuth();

  /**
   * Membuat chat room dan pesan sistem otomatis saat booking dikonfirmasi
   */
  const createChatFromBooking = async (
    bookingId: string,
    userId: string,
    companionId: string,
    bookingDetails?: {
      date?: string;
      time?: string;
      duration?: number;
      packageName?: string;
    }
  ) => {
    if (!user) {
      console.error("User not authenticated");
      return { error: new Error("User not authenticated") };
    }

    try {
      // Validasi UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId) || !uuidRegex.test(companionId)) {
        console.error("Invalid user ID format");
        return { error: new Error("Invalid user ID format") };
      }

      // Cek apakah chat sudah ada
      const { data: existingMessages } = await supabase
        .from("messages")
        .select("id")
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${companionId}),and(sender_id.eq.${companionId},receiver_id.eq.${userId})`)
        .limit(1);

      // Jika sudah ada chat, tidak perlu membuat baru
      if (existingMessages && existingMessages.length > 0) {
        console.log("Chat already exists, skipping creation");
        return { error: null, chatExists: true };
      }

      // Buat pesan sistem otomatis
      const systemMessage = buildSystemMessage(bookingDetails);

      // Insert pesan sistem ke database
      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .insert({
          sender_id: userId, // User yang melakukan booking
          receiver_id: companionId, // Companion
          content: systemMessage,
          is_read: false,
        })
        .select()
        .single();

      if (messageError) {
        console.error("Error creating system message:", messageError);
        return { error: messageError };
      }

      console.log("Chat created successfully from booking:", {
        bookingId,
        userId,
        companionId,
        messageId: messageData?.id,
      });

      return { error: null, message: messageData, chatExists: false };
    } catch (err) {
      console.error("Error in createChatFromBooking:", err);
      return { error: err instanceof Error ? err : new Error("Unknown error") };
    }
  };

  /**
   * Membangun pesan sistem otomatis berdasarkan detail booking
   */
  const buildSystemMessage = (bookingDetails?: {
    date?: string;
    time?: string;
    duration?: number;
    packageName?: string;
  }): string => {
    let message = "💬 Chat ini dibuat karena pemesanan telah dikonfirmasi.\n\n";
    message += "Silakan gunakan chat ini untuk koordinasi lebih lanjut.\n\n";

    if (bookingDetails) {
      message += "📋 Detail Pemesanan:\n";
      
      if (bookingDetails.packageName) {
        message += `• Paket: ${bookingDetails.packageName}\n`;
      }
      
      if (bookingDetails.date) {
        const date = new Date(bookingDetails.date);
        message += `• Tanggal: ${date.toLocaleDateString("id-ID", { 
          weekday: "long", 
          year: "numeric", 
          month: "long", 
          day: "numeric" 
        })}\n`;
      }
      
      if (bookingDetails.time) {
        message += `• Waktu: ${bookingDetails.time}\n`;
      }
      
      if (bookingDetails.duration) {
        message += `• Durasi: ${bookingDetails.duration} jam\n`;
      }
    }

    return message;
  };

  return {
    createChatFromBooking,
  };
}

