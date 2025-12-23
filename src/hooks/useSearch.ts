import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Safe profile type for search results (without sensitive data like email, date_of_birth)
export interface SafeProfile {
  user_id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  city: string | null;
  bio: string | null;
  interests: string[] | null;
  is_online: boolean | null;
  is_verified: boolean | null;
  gender: "male" | "female" | "other" | "prefer_not_to_say" | null;
}

// Type for profile with optional sensitive fields (for compatibility)
interface ProfileWithOptionalSensitive {
  city?: string | null;
  interests?: string[] | null;
}

export function useSearch() {
  const { user } = useAuth();
  const [results, setResults] = useState<SafeProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const getRecommendedUsers = async (userProfile: ProfileWithOptionalSensitive | null) => {
    if (!user) return;

    setLoading(true);

    // Use the secure search_profiles function instead of direct table access
    const { data, error } = await supabase.rpc("search_profiles", {
      search_query: "",
    });

    if (error) {
      console.error("Fetch error:", error);
      setResults([]);
    } else {
      let profiles = (data || []) as SafeProfile[];
      
      // Score and sort by relevance
      if (userProfile) {
        profiles = profiles.map(profile => {
          let score = 0;
          
          // Same city = +3 points
          if (userProfile.city && profile.city && 
              userProfile.city.toLowerCase() === profile.city.toLowerCase()) {
            score += 3;
          }
          
          // Shared interests = +2 points per interest
          if (userProfile.interests && profile.interests) {
            const sharedInterests = userProfile.interests.filter(
              interest => profile.interests?.includes(interest)
            );
            score += sharedInterests.length * 2;
          }
          
          // Online users = +1 point
          if (profile.is_online) {
            score += 1;
          }
          
          return { ...profile, _score: score };
        });
        
        // Sort by score descending
        profiles.sort((a, b) => ((b as any)._score || 0) - ((a as any)._score || 0));
      }
      
      setResults(profiles);
    }

    setLoading(false);
  };

  const searchUsers = async (query: string) => {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase.rpc("search_profiles", {
      search_query: query,
    });

    if (error) {
      console.error("Search error:", error);
      setResults([]);
    } else {
      setResults((data || []) as SafeProfile[]);
    }

    setLoading(false);
  };

  return {
    results,
    loading,
    getRecommendedUsers,
    searchUsers,
  };
}
