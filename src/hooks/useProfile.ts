import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  email: string;
  gender: "male" | "female" | "other" | "prefer_not_to_say" | null;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  interests: string[] | null;
  is_online: boolean | null;
  last_seen: string | null;
  is_verified: boolean | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setProfile(data as Profile);
    }
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);

    if (!error) {
      await fetchProfile();
    }

    return { error };
  };

  const updateOnlineStatus = async (isOnline: boolean) => {
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ 
        is_online: isOnline, 
        last_seen: new Date().toISOString() 
      })
      .eq("user_id", user.id);
  };

  return { profile, loading, updateProfile, updateOnlineStatus, refetch: fetchProfile };
}
