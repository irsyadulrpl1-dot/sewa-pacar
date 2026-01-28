/**
 * Centralized API Service Layer
 * All database/API calls should go through this service layer
 */

import { supabase } from "@/integrations/supabase/client";
import type {
  Profile,
  Booking,
  Payment,
  Message,
  Companion,
  Notification,
  FriendRequest,
  Follow,
} from "@/types";

// ==================== Error Handling ====================
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError("An unknown error occurred");
}

// ==================== Profile Service ====================
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      // Transform to Profile type with all fields
      return {
        ...data,
        hourly_rate: null, // Field doesn't exist in schema
        availability: null,
        personality: null,
        activities: null,
        packages: null,
      } as Profile;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    try {
      // Remove fields that don't exist in schema
      const { hourly_rate, availability, personality, activities, packages, ...validUpdates } = updates;
      
      const { data, error } = await supabase
        .from("profiles")
        .update(validUpdates)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        hourly_rate: null,
        availability: null,
        personality: null,
        activities: null,
        packages: null,
      } as Profile;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async searchProfiles(query: string): Promise<Profile[]> {
    try {
      const { data, error } = await supabase.rpc("search_profiles", {
        search_query: query,
      });

      if (error) throw error;
      return (data || []) as Profile[];
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// ==================== Booking Service ====================
export const bookingService = {
  async createBooking(bookingData: Omit<Booking, "id" | "created_at" | "updated_at">): Promise<Booking> {
    try {
      // bookings table exists but not in generated types yet
      const { data, error } = await (supabase as any)
        .from("bookings")
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Booking;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getBooking(bookingId: string): Promise<Booking | null> {
    try {
      // bookings table exists but not in generated types yet
      const { data, error } = await (supabase as any)
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .maybeSingle();

      if (error) throw error;
      return (data as unknown) as Booking | null;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      // bookings table exists but not in generated types yet
      const { data, error } = await (supabase as any)
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return ((data || []) as unknown) as Booking[];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updateBookingStatus(bookingId: string, status: Booking["status"]): Promise<Booking> {
    try {
      // bookings table exists but not in generated types yet
      const { data, error } = await (supabase as any)
        .from("bookings")
        .update({ status })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;
      return (data as unknown) as Booking;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// ==================== Payment Service ====================
export const paymentService = {
  async createPayment(paymentData: Omit<Payment, "id" | "created_at" | "updated_at">): Promise<Payment> {
    try {
      const { data, error } = await supabase
        .from("payments")
        .insert(paymentData)
        .select()
        .single();

      if (error) throw error;
      return data as Payment;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getUserPayments(userId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Payment[];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updatePaymentStatus(
    paymentId: string,
    status: Payment["status"],
    adminNotes?: string
  ): Promise<Payment> {
    try {
      const { data, error } = await supabase
        .from("payments")
        .update({
          status,
          admin_notes: adminNotes || null,
          validated_at: new Date().toISOString(),
        })
        .eq("id", paymentId)
        .select()
        .single();

      if (error) throw error;
      return data as Payment;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async uploadProof(paymentId: string, proofUrl: string): Promise<Payment> {
    try {
      const { data, error } = await supabase
        .from("payments")
        .update({
          proof_url: proofUrl,
          status: "waiting_validation",
        })
        .eq("id", paymentId)
        .select()
        .single();

      if (error) throw error;
      return data as Payment;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// ==================== Message Service ====================
export const messageService = {
  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string
  ): Promise<Message> {
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as Message;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getConversation(userId: string, partnerId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
        )
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as Message[];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async markAsRead(messageIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .in("id", messageIds);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// ==================== Companion Service ====================
export const companionService = {
  async getCompanions(filters?: {
    search?: string;
    city?: string;
    availability?: string;
    onlineOnly?: boolean;
    sort?: string;
    limit?: number;
  }): Promise<Companion[]> {
    try {
      // Note: hourly_rate might not exist in profiles table
      // We'll filter companions by checking if they have packages or other indicators
      // Use untyped query here to avoid extremely-deep type instantiation issues
      let query = (supabase as any)
        .from("profiles")
        .select("*");

      if (filters?.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,city.ilike.%${filters.search}%`
        );
      }

      if (filters?.city) {
        query = query.eq("city", filters.city);
      }

      if (filters?.availability) {
        query = query.eq("availability", filters.availability);
      }

      if (filters?.onlineOnly) {
        query = query.eq("is_online", true);
      }

      if (filters?.sort) {
        if (filters.sort === "created_at") {
          query = query.order("created_at", { ascending: false });
        } else {
          // For price sorting, we'll sort by created_at as fallback
          // since hourly_rate might not exist
          query = query.order("created_at", { ascending: false });
        }
      } else {
        query = query.order("created_at", { ascending: false });
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform profiles to Companion format
      const companions: Companion[] = (data || []).map((profile: any) => ({
        user_id: profile.user_id,
        id: profile.user_id,
        name: profile.full_name || profile.username || "Unknown",
        full_name: profile.full_name,
        age: profile.date_of_birth 
          ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()
          : 0,
        city: profile.city || "",
        rating: profile.is_verified ? 4.5 : 4.0,
        hourlyRate: 0, // Will be calculated from packages if available
        hourly_rate: 0,
        image: profile.avatar_url || "/placeholder-avatar.png",
        avatar_url: profile.avatar_url,
        bio: profile.bio || "",
        description: profile.bio || "",
        personality: Array.isArray(profile.personality) ? profile.personality : [],
        activities: Array.isArray(profile.activities) ? profile.activities : [],
        availability: profile.availability || "",
        packages: Array.isArray(profile.packages) ? profile.packages : [],
        is_online: profile.is_online || false,
        created_at: profile.created_at || new Date().toISOString(),
      }));
      
      return companions;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// ==================== Follow Service ====================
export const followService = {
  async follow(followerId: string, followingId: string): Promise<Follow> {
    try {
      const { data, error } = await supabase
        .from("follows")
        .insert({
          follower_id: followerId,
          following_id: followingId,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Follow;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async unfollow(followerId: string, followingId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", followerId)
        .eq("following_id", followingId);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getFollowers(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", userId);

      if (error) throw error;
      return data.map((f) => f.follower_id);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getFollowing(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);

      if (error) throw error;
      return data.map((f) => f.following_id);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// ==================== Notification Service ====================
export const notificationService = {
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      // notifications table exists but not in generated types yet
      const { data, error } = await (supabase as any)
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return ((data || []) as unknown) as Notification[];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    try {
      // notifications table exists but not in generated types yet
      const { error } = await (supabase as any)
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

