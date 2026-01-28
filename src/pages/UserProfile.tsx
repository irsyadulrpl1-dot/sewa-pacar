import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, User, Sparkles, BadgeCheck, MessageCircle, Clock, Check, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MobileLayout } from "@/components/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatCount } from "@/lib/formatters";
 
// Hapus dialog pembayaran

interface PublicProfile {
  user_id: string;
  full_name: string | null;
  username: string | null;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  date_of_birth?: string | null;
  interests: string[] | null;
  is_online: boolean | null;
  is_verified: boolean | null;
  gender: string | null;
}

const getMockProfileInfo = (profile: PublicProfile) => ({
  age: 22,
  hourlyRate: 250000,
  availability: "Weekdays & Weekend",
  personality: ["Friendly", "Ceria", "Humble", "Good Listener"],
  activities: ["Coffee date", "Art exhibition", "Foto session", "Jalan santai", "Nonton film", "Shopping trip"],
  packages: [
    { name: "Paket Hangout", duration: "3 jam", price: 500000, description: "Temani ngobrol, jalan-jalan santai" },
    { name: "Paket Full Day", duration: "8 jam", price: 1200000, description: "Temani seharian penuh untuk berbagai aktivitas" },
    { name: "Paket Event", duration: "5 jam", price: 800000, description: "Temani ke acara atau event spesial" },
  ],
});

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("info");
  const [extras, setExtras] = useState<{ availability?: string; hourly_rate?: number; personality?: string[]; activities?: string[]; packages?: { name: string; duration: string; price: number }[] } | null>(null);
  

  // Redirect to own profile if viewing self
  useEffect(() => {
    if (user && userId === user.id) {
      navigate("/profile");
    }
  }, [user, userId, navigate]);

  // Fetch public profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["public-profile", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("public_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data as PublicProfile | null;
    },
    enabled: !!userId,
  });

  const { data: profileExtras } = useQuery({
    queryKey: ["profile-extras", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from("profiles")
        .select("availability,hourly_rate,personality,activities,packages")
        .eq("user_id", userId)
        .maybeSingle();
      return data as any;
    },
    enabled: !!userId,
  });

  const handleChat = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate(`/chat/${userId}`);
  };

  

  

  

  if (isLoading) {
    return (
      <MobileLayout showFooter={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Sparkles className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  if (!profile) {
    return (
      <MobileLayout showFooter={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <User className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Pengguna Tidak Ditemukan</h2>
          <p className="text-muted-foreground text-center mb-4">
            Profil yang kamu cari tidak tersedia
          </p>
          <Button onClick={() => navigate(-1)} variant="outline">
            Kembali
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const profileInfo = (() => {
    const mock = getMockProfileInfo(profile);
    const merged = {
      age: mock.age,
      hourlyRate: profileExtras?.hourly_rate ?? mock.hourlyRate,
      availability: profileExtras?.availability ?? mock.availability,
      personality: profileExtras?.personality ?? mock.personality,
      activities: profileExtras?.activities ?? mock.activities,
      packages: profileExtras?.packages ?? mock.packages,
    };
    return merged;
  })();

  return (
    <MobileLayout showFooter={false}>
      <div className="px-4 py-6 pb-24 md:py-24 max-w-2xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-lavender to-pink p-1">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Online indicator */}
            {profile.is_online && (
              <div className="absolute top-2 right-2 w-4 h-4 bg-mint rounded-full border-2 border-background" />
            )}
          </div>

          {/* Name & Username */}
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-2xl font-display font-bold text-foreground">
              {profile.full_name || "Pengguna"}
            </h1>
            {profile.is_verified && (
              <BadgeCheck className="h-6 w-6 text-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-muted-foreground">@{profile.username || "user"}</p>

          {/* Location & Age */}
          <div className="flex items-center justify-center gap-4 mt-3 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {profileInfo.age} tahun
            </span>
            {profile.city && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {profile.city}
                </span>
              </>
            )}
            <span className="text-muted-foreground">•</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {profileInfo.availability}
            </span>
          </div>
          {profileInfo.hourlyRate && (
            <div className="mt-3 text-primary font-bold text-lg">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(profileInfo.hourlyRate)}/jam
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className="mt-4 max-w-sm mx-auto">
              <p className="text-foreground text-sm leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap justify-center gap-2">
                {profile.interests.map((interest) => (
                  <Badge
                    key={interest}
                    variant="secondary"
                    className="rounded-full px-3 py-1 text-xs"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center mb-6">
          <Button
            variant="gradient"
            onClick={handleChat}
            className="rounded-xl px-6"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Kirim Pesan
          </Button>
        </div>

        {/* Info Section */}
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
              {/* About Section */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">Tentang Aku</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {profile.bio || `Halo! Nama aku ${profile.full_name}. Aku orangnya kalem tapi tetep asik kok kalau udah kenal. Kalau kamu butuh temen yang bisa bikin suasana nyaman dan fun, aku siap!`}
                </p>
              </div>

              {/* Personality Section */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Kepribadian</h3>
                <div className="flex flex-wrap gap-2">
                  {profileInfo.personality.map((trait) => (
                    <Badge
                      key={trait}
                      variant="outline"
                      className="rounded-full px-4 py-1.5 text-sm border-border bg-background"
                    >
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Activities Section */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Bisa Nemenin Untuk</h3>
                <div className="grid grid-cols-2 gap-2">
                  {profileInfo.activities.map((activity) => (
                    <div key={activity} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      {activity}
                    </div>
                  ))}
                </div>
              </div>

              
          </motion.div>
        </div>
      </div>

      
    </MobileLayout>
  );
}
