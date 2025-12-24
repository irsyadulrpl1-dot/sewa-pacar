import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, User, Sparkles, BadgeCheck, MessageCircle, UserPlus, UserMinus, Grid3X3, ImageOff, Clock, Heart, Check, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileLayout } from "@/components/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFollowCounts, useFollowStatus } from "@/hooks/useFollows";
import { useQuery } from "@tanstack/react-query";
import { formatCount } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingPaymentDialog } from "@/components/payments/BookingPaymentDialog";

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

// Mock profile info - in real app this would come from database
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
  const { followersCount, followingCount } = useFollowCounts(userId || "");
  const { isFollowing, toggleFollow, isLoading: isFollowLoading } = useFollowStatus(userId || "");
  const [activeTab, setActiveTab] = useState("posts");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{ name: string; duration: string; price: number } | null>(null);

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

  const handleBookPackage = (pkg: { name: string; duration: string; price: number }) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setSelectedPackage(pkg);
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Booking Berhasil!",
      description: "Kami akan menghubungi kamu segera untuk konfirmasi.",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
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

  const profileInfo = getMockProfileInfo(profile);

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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Postingan
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Informasi
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts">
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
              )}
            </motion.div>
          </TabsContent>

          {/* Info Tab */}
          <TabsContent value="info">
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

              {/* Packages Section */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Paket Tersedia</h3>
                <div className="space-y-3">
                  {profileInfo.packages.map((pkg) => (
                    <Card key={pkg.name} className="overflow-hidden border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-foreground">{pkg.name}</h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {pkg.duration}
                            </p>
                          </div>
                          <p className="text-lg font-bold text-primary">{formatPrice(pkg.price)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                        <Button 
                          className="w-full rounded-xl"
                          variant="gradient"
                          onClick={() => handleBookPackage(pkg)}
                        >
                          Book Sekarang
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Dialog */}
      {selectedPackage && (
        <BookingPaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          companion={{
            id: userId || "",
            name: profile.full_name || "User",
            image: profile.avatar_url || "",
          }}
          selectedPackage={selectedPackage}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </MobileLayout>
  );
}
