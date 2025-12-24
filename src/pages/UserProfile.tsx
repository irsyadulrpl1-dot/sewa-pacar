import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Calendar, User, Sparkles, BadgeCheck, MessageCircle, UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileLayout } from "@/components/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFollowCounts, useFollowStatus } from "@/hooks/useFollows";
import { useQuery } from "@tanstack/react-query";
import { formatCount } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Grid3X3, ImageOff } from "lucide-react";

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

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { followersCount, followingCount } = useFollowCounts(userId || "");
  const { isFollowing, toggleFollow, isLoading: isFollowLoading } = useFollowStatus(userId || "");

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

  // Fetch user posts
  const { data: userPosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["user-posts", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("posts")
        .select("id, image_url, caption, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const handleFollow = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    await toggleFollow();
  };

  const handleChat = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate(`/chat/${userId}`);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
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

          {/* Followers/Following Stats */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{userPosts?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{formatCount(followersCount)}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{formatCount(followingCount)}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </div>

          {/* Location & Age */}
          <div className="flex items-center justify-center gap-4 mt-3 text-sm">
            {profile.city && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {profile.city}
              </span>
            )}
          </div>

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
            variant={isFollowing ? "outline" : "gradient"}
            onClick={handleFollow}
            disabled={isFollowLoading}
            className="rounded-xl"
          >
            {isFollowing ? (
              <>
                <UserMinus className="w-4 h-4 mr-2" />
                Berhenti Ikuti
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Ikuti
              </>
            )}
          </Button>
          <Button
            variant="soft"
            onClick={handleChat}
            className="rounded-xl"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Pesan
          </Button>
        </div>

        {/* User Posts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {isLoadingPosts ? (
            <div className="grid grid-cols-3 gap-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          ) : !userPosts || userPosts.length === 0 ? (
            <div className="text-center py-12">
              <ImageOff className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Belum ada postingan</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-center gap-2 py-4 border-t border-border">
                <Grid3X3 className="h-4 w-4" />
                <span className="text-sm font-semibold">POSTINGAN</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {userPosts.map((post) => (
                  <div key={post.id} className="relative aspect-square group">
                    <img
                      src={post.image_url}
                      alt={post.caption || "Post"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Lihat</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </MobileLayout>
  );
}
