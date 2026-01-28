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
  role?: "renter" | "companion" | null;
  created_at: string;
  updated_at: string;
  // Extended fields for companion features
  availability?: string | null;
  hourly_rate?: number | null;
  personality?: string[] | null;
  activities?: string[] | null;
  packages?: { name: string; duration: string; price: number }[] | null;
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

  const updateProfile = async (updates: Partial<Profile> & Record<string, unknown>) => {
    if (!user) {
      console.error('updateProfile: User not authenticated');
      return { error: new Error("Not authenticated") };
    }

    console.log('=== UPDATE PROFILE START ===');
    console.log('User ID:', user.id);
    console.log('Updates received:', updates);

    // Define allowed fields that can be updated
    // Include both standard fields and extended fields
    const allowedFields = [
      'full_name',
      'username',
      'city',
      'bio',
      'interests',
      'avatar_url',
      'date_of_birth',
      'gender',
      // Extended fields for companion features
      'availability',
      'hourly_rate',
      'personality',
      'activities',
      'packages',
    ];

    // Filter updates to only include allowed fields and non-null values
    const filteredUpdates: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(updates)) {
      // Skip if field is not allowed
      if (!allowedFields.includes(key)) {
        console.warn(`Field '${key}' is not allowed for update, skipping`);
        continue;
      }
      
      // Skip if value is undefined (but allow null explicitly)
      if (value === undefined) {
        console.warn(`Field '${key}' has undefined value, skipping`);
        continue;
      }
      
      // Include the field
      filteredUpdates[key] = value;
    }

    console.log('Filtered updates (allowed fields only):', filteredUpdates);

    if (Object.keys(filteredUpdates).length === 0) {
      console.warn('No valid fields to update');
      return { error: new Error("Tidak ada field yang valid untuk diupdate") };
    }

    // Perform the update with .select() to get the updated data
    const { data: updatedData, error } = await supabase
      .from("profiles")
      .update(filteredUpdates)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error('=== UPDATE PROFILE ERROR ===');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      
      if (error.code === '42501') {
        errorMessage = 'Akses ditolak. Pastikan Anda memiliki izin untuk mengupdate profil ini.';
      } else if (error.code === '23505') {
        errorMessage = 'Username sudah digunakan. Silakan pilih username lain.';
      } else if (error.code === '23503') {
        errorMessage = 'Data tidak valid. Pastikan semua field yang diisi benar.';
      } else if (error.message.includes('duplicate') || error.message.includes('unique')) {
        errorMessage = 'Data duplikat. Pastikan username unik.';
      }
      
      return { error: new Error(errorMessage) };
    }

    console.log('=== UPDATE PROFILE SUCCESS ===');
    console.log('Updated data:', updatedData);

    // Verify the update was successful by fetching the profile
    if (updatedData) {
      setProfile(updatedData as Profile);
      console.log('Profile state updated in memory');
    } else {
      // If no data returned, fetch it manually
      console.log('No data returned, fetching profile...');
      await fetchProfile();
    }

    return { error: null };
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
