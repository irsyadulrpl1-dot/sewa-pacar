import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "./useProfile";
import { useAuth } from "@/contexts/AuthContext";

interface SearchFilters {
  query?: string;
  city?: string;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  interests?: string[];
  onlineOnly?: boolean;
}

export function useSearch() {
  const { user } = useAuth();
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async (filters: SearchFilters) => {
    if (!user) return;

    setLoading(true);

    let query = supabase
      .from("profiles")
      .select("*")
      .neq("user_id", user.id);

    // Text search on name or username
    if (filters.query) {
      query = query.or(`full_name.ilike.%${filters.query}%,username.ilike.%${filters.query}%`);
    }

    // City filter
    if (filters.city) {
      query = query.ilike("city", `%${filters.city}%`);
    }

    // Gender filter
    if (filters.gender && filters.gender !== "all") {
      query = query.eq("gender", filters.gender as "male" | "female" | "other" | "prefer_not_to_say");
    }

    // Online only
    if (filters.onlineOnly) {
      query = query.eq("is_online", true);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error("Search error:", error);
      setResults([]);
    } else {
      // Filter by age if needed
      let filteredData = data as Profile[];
      
      if (filters.minAge || filters.maxAge) {
        const today = new Date();
        filteredData = filteredData.filter(profile => {
          if (!profile.date_of_birth) return true;
          
          const birthDate = new Date(profile.date_of_birth);
          const age = today.getFullYear() - birthDate.getFullYear();
          
          if (filters.minAge && age < filters.minAge) return false;
          if (filters.maxAge && age > filters.maxAge) return false;
          
          return true;
        });
      }

      // Filter by interests if needed
      if (filters.interests && filters.interests.length > 0) {
        filteredData = filteredData.filter(profile => {
          if (!profile.interests) return false;
          return filters.interests!.some(interest => 
            profile.interests!.includes(interest)
          );
        });
      }

      setResults(filteredData);
    }

    setLoading(false);
  };

  const getAllUsers = async () => {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("user_id", user.id)
      .limit(50);

    if (error) {
      console.error("Fetch error:", error);
      setResults([]);
    } else {
      setResults(data as Profile[]);
    }

    setLoading(false);
  };

  return {
    results,
    loading,
    searchUsers,
    getAllUsers,
  };
}
