import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Companion {
  id: string;
  user_id: string;
  name: string;
  full_name: string;
  username: string;
  age?: number;
  city: string | null;
  gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;
  rating: number;
  hourlyRate: number;
  hourly_rate: number;
  image: string | null;
  avatar_url: string | null;
  bio: string | null;
  description?: string;
  personality: string[];
  hobbies?: string[];
  activities: string[];
  availability: string | null;
  status: "online" | "offline" | "busy";
  is_online: boolean;
  is_verified: boolean;
  packages?: { name: string; duration: string; price: number }[] | null;
  created_at: string;
}

export interface CompanionFilters {
  search?: string;
  city?: string;
  availability?: string;
  activity?: string;
  gender?: "male" | "female";
  onlineOnly?: boolean;
  sort?: "price_asc" | "price_desc" | "rating_desc" | "created_at";
  limit?: number;
}

export function useCompanions(filters?: CompanionFilters) {
  const { user } = useAuth();
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const initialLoad = useRef(true);
  const lastSnapshot = useRef<string>("");

  type ProfileRow = {
    user_id: string;
    full_name: string | null;
    username: string | null;
    city: string | null;
    gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;
    avatar_url: string | null;
    bio: string | null;
    date_of_birth: string | null;
    is_verified: boolean | null;
    is_online: boolean | null;
    created_at: string;
    availability?: string | null;
    hourly_rate?: number | null;
    personality?: string[] | null;
    activities?: string[] | null;
    packages?: { name: string; duration: string; price: number }[] | null;
  };

  const fetchCompanions = useCallback(async () => {
    try {
      if (initialLoad.current) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      // Build query - only fetch profiles that have hourly_rate (companions)
      let query = (supabase as any)
        .from("profiles")
        .select("*")
        .eq("role", "companion") // Only companions (role-based)
        .not("hourly_rate", "is", null) // Must have hourly_rate to be listed
        .neq("user_id", user?.id || "00000000-0000-0000-0000-000000000000"); // Exclude current user

      // Apply filters
      if (filters?.city && filters.city !== "Semua") {
        query = query.eq("city", filters.city);
      }

      if (filters?.availability && filters.availability !== "Semua") {
        query = query.eq("availability", filters.availability);
      }

      if (filters?.gender) {
        query = query.eq("gender", filters.gender);
      }

      // Ignore online-only filter as online/offline system is removed

      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        query = query.or(
          `full_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`,
        );
      }

      // Apply sorting
      if (filters?.sort === "price_asc") {
        query = query.order("hourly_rate", { ascending: true });
      } else if (filters?.sort === "price_desc") {
        query = query.order("hourly_rate", { ascending: false });
      } else if (filters?.sort === "rating_desc") {
        // Note: Rating might need to be calculated from reviews/bookings
        // For now, we'll use is_verified as a proxy
        query = query.order("is_verified", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // Apply limit if specified
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error("Error fetching companions:", fetchError);
        setError(fetchError.message);
        toast.error("Gagal memuat data partner");
        return;
      }

      // Transform data to Companion format
      const transformedCompanions: Companion[] = ((data || []) as ProfileRow[]).map((profile: ProfileRow) => {
        // Calculate age from date_of_birth if available
        let age: number | undefined;
        if (profile.date_of_birth) {
          const birthDate = new Date(profile.date_of_birth);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        }

      // Status removed: booking always available
      const status: "online" | "offline" | "busy" = "online";

        // Default rating (can be calculated from reviews later)
        const rating = profile.is_verified ? 4.5 : 4.0;

        return {
          id: profile.user_id, // Use user_id as id for compatibility
          user_id: profile.user_id,
          name: profile.full_name || profile.username || "Unknown",
          full_name: profile.full_name || profile.username || "Unknown",
          username: profile.username || "",
          age,
          city: profile.city,
          gender: profile.gender ?? null,
          rating,
          hourlyRate: profile.hourly_rate || 0,
          hourly_rate: profile.hourly_rate || 0,
          image: profile.avatar_url,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          description: profile.bio || "",
          personality: (profile.personality as string[]) || [],
          activities: (profile.activities as string[]) || [],
          availability: profile.availability,
          status,
          is_online: profile.is_online || false,
          is_verified: profile.is_verified || false,
          packages: (profile.packages as { name: string; duration: string; price: number }[]) || null,
          created_at: profile.created_at,
        };
      });

      const snapshot = JSON.stringify(
        transformedCompanions.map((c) => [c.id, c.is_online, c.hourlyRate, c.availability, c.city]),
      );
      if (snapshot !== lastSnapshot.current) {
        setCompanions(transformedCompanions);
        lastSnapshot.current = snapshot;
      }
    } catch (err) {
      console.error("Unexpected error fetching companions:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
      setRefreshing(false);
      if (initialLoad.current) {
        initialLoad.current = false;
      }
    }
  }, [user, filters]);

  useEffect(() => {
    fetchCompanions();
  }, [fetchCompanions]);

  // Real-time subscription removed per request (no online/offline system)

  return {
    companions,
    loading,
    error,
    refreshing,
    refetch: fetchCompanions,
  };
}

