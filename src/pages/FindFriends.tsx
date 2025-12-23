import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, User, UserPlus, Clock, Check, Sparkles, Heart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileLayout } from "@/components/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useSearch } from "@/hooks/useSearch";
import { useFriends } from "@/hooks/useFriends";
import { useProfile, Profile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

export default function FindFriends() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useProfile();
  const { results, loading, getRecommendedUsers } = useSearch();
  const { 
    sendFriendRequest, 
    cancelFriendRequest,
    acceptFriendRequest,
    getFriendStatus, 
    getRequestByUser 
  } = useFriends();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      getRecommendedUsers(profile);
    }
  }, [user, profile]);

  const handleRefresh = () => {
    getRecommendedUsers(profile);
  };

  const handleFriendAction = async (targetProfile: Profile) => {
    const status = getFriendStatus(targetProfile.user_id);
    const request = getRequestByUser(targetProfile.user_id);

    if (status === "none") {
      const { error } = await sendFriendRequest(targetProfile.user_id);
      if (error) {
        toast({
          title: "Gagal mengirim permintaan",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Permintaan terkirim! 💌",
          description: `Menunggu ${targetProfile.full_name} menerima`,
        });
      }
    } else if (status === "request_sent" && request) {
      const { error } = await cancelFriendRequest(request.id);
      if (!error) {
        toast({
          title: "Permintaan dibatalkan",
        });
      }
    } else if (status === "request_received" && request) {
      const { error } = await acceptFriendRequest(request.id, targetProfile.user_id);
      if (!error) {
        toast({
          title: "Sekarang berteman! 🎉",
          description: `Kamu dan ${targetProfile.full_name} sekarang berteman`,
        });
      }
    }
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getSharedInfo = (targetProfile: Profile) => {
    const shared: string[] = [];
    
    if (profile?.city && targetProfile.city && 
        profile.city.toLowerCase() === targetProfile.city.toLowerCase()) {
      shared.push(`📍 Sama-sama di ${targetProfile.city}`);
    }
    
    if (profile?.interests && targetProfile.interests) {
      const sharedInterests = profile.interests.filter(
        interest => targetProfile.interests?.includes(interest)
      );
      if (sharedInterests.length > 0) {
        shared.push(`💫 Minat sama: ${sharedInterests.slice(0, 2).join(", ")}`);
      }
    }
    
    return shared;
  };

  const FriendButton = ({ profile: targetProfile }: { profile: Profile }) => {
    const status = getFriendStatus(targetProfile.user_id);
    
    switch (status) {
      case "friends":
        return (
          <Button size="sm" variant="soft" className="rounded-xl" disabled>
            <Check className="w-4 h-4 mr-1" />
            Teman
          </Button>
        );
      case "request_sent":
        return (
          <Button 
            size="sm" 
            variant="outline" 
            className="rounded-xl"
            onClick={() => handleFriendAction(targetProfile)}
          >
            <Clock className="w-4 h-4 mr-1" />
            Menunggu
          </Button>
        );
      case "request_received":
        return (
          <Button 
            size="sm" 
            variant="gradient" 
            className="rounded-xl"
            onClick={() => handleFriendAction(targetProfile)}
          >
            <Check className="w-4 h-4 mr-1" />
            Terima
          </Button>
        );
      default:
        return (
          <Button 
            size="sm" 
            variant="gradient" 
            className="rounded-xl"
            onClick={() => handleFriendAction(targetProfile)}
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Tambah
          </Button>
        );
    }
  };

  return (
    <MobileLayout showFooter={false}>
      <div className="px-4 py-6 pb-24 md:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-start justify-between"
        >
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink" />
              Rekomendasi Teman
            </h1>
            <p className="text-muted-foreground">
              Teman yang cocok buat kamu
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </motion.div>

        {/* Results */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Sparkles className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada rekomendasi</p>
              <p className="text-sm text-muted-foreground mt-2">
                Lengkapi profil untuk rekomendasi lebih baik
              </p>
            </div>
          ) : (
            results.map((targetProfile, index) => {
              const sharedInfo = getSharedInfo(targetProfile);
              
              return (
                <motion.div
                  key={targetProfile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card rounded-2xl p-4"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-lavender to-pink p-0.5">
                        <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                          {targetProfile.avatar_url ? (
                            <img 
                              src={targetProfile.avatar_url} 
                              alt={targetProfile.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      {targetProfile.is_online && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-mint rounded-full border-2 border-background" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {targetProfile.full_name}
                        </h3>
                        {targetProfile.is_verified && (
                          <Badge className="bg-mint/20 text-mint text-xs px-2">✓</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        @{targetProfile.username}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {targetProfile.date_of_birth && (
                          <span>{calculateAge(targetProfile.date_of_birth)} tahun</span>
                        )}
                        {targetProfile.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {targetProfile.city}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <FriendButton profile={targetProfile} />
                  </div>
                  
                  {/* Shared Info */}
                  {sharedInfo.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex flex-wrap gap-2">
                        {sharedInfo.map((info, i) => (
                          <span 
                            key={i}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                          >
                            {info}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
