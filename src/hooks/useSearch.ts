import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "./useProfile";
import { useAuth } from "@/contexts/AuthContext";

export function useSearch() {
  const { user } = useAuth();
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const getRecommendedUsers = async (userProfile: Profile | null) => {
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
      let profiles = data as Profile[];
      
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

  return {
    results,
    loading,
    getRecommendedUsers,
  };
}
