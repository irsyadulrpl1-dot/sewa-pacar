import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MobileLayout } from "@/components/MobileLayout";
import { Sparkles, Compass, Heart, MapPin, User, RefreshCw, UserPlus, Clock, Check } from "lucide-react";
import { CompanionExploreFeed } from "@/components/explore/CompanionExploreFeed";
import { useAuth } from "@/contexts/AuthContext";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { PopularPartners } from "@/components/home/PopularPartners";
import { PlatformFeatures } from "@/components/home/PlatformFeatures";
import { FeatureHighlights } from "@/components/home/FeatureHighlights";
import { FinalCTA } from "@/components/home/FinalCTA";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearch, SafeProfile } from "@/hooks/useSearch";
import { useFriends } from "@/hooks/useFriends";
import { useProfile } from "@/hooks/useProfile";
import { useCompanions } from "@/hooks/useCompanions";

const Index = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { results, loading, getRecommendedUsers } = useSearch();
  const { companions: guestCompanions, loading: guestLoading } = useCompanions({ sort: "rating_desc", limit: 8 });
  const { 
    sendFriendRequest, 
    cancelFriendRequest,
    acceptFriendRequest,
    getFriendStatus, 
    getRequestByUser 
  } = useFriends();
  
  const profileRef = useRef<{ city: string | null; interests: string[] | null } | null>(null);
  
  useEffect(() => {
    if (user && profile) {
      // If user is logged in, route them based on role (role is chosen once)
      if (!profile.role) {
        navigate("/choose-role", { replace: true });
        return;
      }

      const currentProfile = {
        city: profile.city || null,
        interests: profile.interests || null,
      };
      
      // Only fetch if profile data actually changed
      const prevProfile = profileRef.current;
      const cityChanged = prevProfile?.city !== currentProfile.city;
      const interestsChanged = JSON.stringify(prevProfile?.interests) !== JSON.stringify(currentProfile.interests);
      
      if (!prevProfile || cityChanged || interestsChanged) {
        profileRef.current = currentProfile;
        getRecommendedUsers(currentProfile);
      }
    }
  }, [user, profile, getRecommendedUsers, navigate]);

  const handleFriendAction = async (targetProfile: SafeProfile) => {
    const status = getFriendStatus(targetProfile.user_id);
    const request = getRequestByUser(targetProfile.user_id);

    if (status === "none") {
      await sendFriendRequest(targetProfile.user_id);
    } else if (status === "request_sent" && request) {
      await cancelFriendRequest(request.id);
    } else if (status === "request_received" && request) {
      await acceptFriendRequest(request.id, targetProfile.user_id);
    }
  };

  const getSharedInfo = (targetProfile: SafeProfile) => {
    const shared: string[] = [];
    if (profile?.city && targetProfile.city && 
        profile.city.toLowerCase() === targetProfile.city.toLowerCase()) {
      shared.push(`📍 ${targetProfile.city}`);
    }
    if (profile?.interests && targetProfile.interests) {
      const subset = profile.interests.filter(interest => targetProfile.interests?.includes(interest));
      if (subset.length > 0) shared.push(`💫 ${subset.slice(0, 2).join(", ")}`);
    }
    return shared;
  };

  const FriendButton = ({ profile: targetProfile }: { profile: SafeProfile }) => {
    const status = getFriendStatus(targetProfile.user_id);
    
    switch (status) {
      case "friends":
        return (
          <Button size="sm" variant="soft" className="rounded-xl" disabled>
            <Check className="w-4 h-4 mr-1" />
            Matched
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
            Pending
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
    <MobileLayout>
      {/* Unified Home Page - Landing Page + Recommendations */}
      <div className="w-full">
        {/* Landing Page Sections - Always visible */}
        <HeroSection />
        <HowItWorks />
        
        {/* Recommendations Section - merged into Home, no tabs */}
        {user && profile?.role === "renter" && (
          <section className="pb-6 md:pb-8">
            <div className="container mx-auto px-4 max-w-6xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink" />
                    <h2 className="text-lg md:text-xl font-display font-semibold text-foreground">
                      Rekomendasi Untukmu
                    </h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl h-8 w-8"
                    onClick={() => getRecommendedUsers(profile)}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Sparkles className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : results.length === 0 ? (
                  <div className="text-center py-8 glass-card rounded-2xl">
                    <User className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm">Belum ada rekomendasi</p>
                    <Button 
                      variant="link" 
                      className="mt-2"
                      onClick={() => getRecommendedUsers(profile)}
                    >
                      Perbarui rekomendasi
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide snap-x snap-mandatory translate-z-0"
                    style={{ willChange: 'transform', WebkitOverflowScrolling: 'touch', contain: 'paint' }}
                  >
                    {results.slice(0, 6).map((targetProfile, index) => {
                      const sharedInfo = getSharedInfo(targetProfile);
                      
                      return (
                        <motion.div
                          key={targetProfile.user_id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex-shrink-0 w-[200px] rounded-2xl p-4 bg-card border border-border/50 md:glass-card snap-start translate-z-0"
                        >
                          {/* Avatar */}
                          <div className="relative mb-3 flex justify-center">
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
                              <div className="absolute bottom-0 right-1/2 translate-x-8 w-4 h-4 bg-mint rounded-full border-2 border-background" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="text-center mb-3">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <h3 className="font-semibold text-foreground text-sm truncate">
                                {targetProfile.full_name}
                              </h3>
                              {targetProfile.is_verified && (
                                <Badge className="bg-mint/20 text-mint text-[10px] px-1">✓</Badge>
                              )}
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                              {targetProfile.city && (
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="w-3 h-3" />
                                  {targetProfile.city}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Shared Info */}
                          {sharedInfo.length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-center mb-3">
                              {sharedInfo.map((info, i) => (
                                <span 
                                  key={i}
                                  className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                                >
                                  {info}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Action */}
                          <FriendButton profile={targetProfile} />
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>
          </section>
        )}

        {/* Guest Recommendations - visible for non-logged users */}
        {!user && (
          <section className="pb-6 md:pb-10">
            <div className="container mx-auto px-4 max-w-6xl">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink" />
                    <h2 className="text-lg md:text-xl font-display font-semibold text-foreground">
                      Rekomendasi Untukmu
                    </h2>
                  </div>
                </div>
                {guestLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Sparkles className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : guestCompanions.length === 0 ? (
                  <div className="text-center py-8 glass-card rounded-2xl">
                    <User className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm">Belum ada rekomendasi</p>
                  </div>
                ) : (
                  <div
                    className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide snap-x snap-mandatory translate-z-0"
                    style={{ willChange: 'transform', WebkitOverflowScrolling: 'touch', contain: 'paint' }}
                  >
                    {guestCompanions.slice(0, 8).map((companion, index) => (
                      <motion.div
                        key={companion.user_id || companion.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex-shrink-0 w-[200px] rounded-2xl p-0 snap-start translate-z-0"
                      >
                        {/* Reuse CompanionCard for preview gating */}
                        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                        {/* @ts-ignore */}
                        <CompanionCard companion={companion as any} index={index} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </section>
        )}

        {/* Jelajahi Feed */}
        {user && (
          <section className="pb-8 md:pb-12">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="flex items-center gap-2 mb-4">
                <Compass className="w-5 h-5 text-primary" />
                <h2 className="text-lg md:text-xl font-display font-semibold text-foreground">
                  Jelajahi
                </h2>
              </div>
              <CompanionExploreFeed />
            </div>
          </section>
        )}

        {/* Popular Partners - Show for non-logged users, or show different content for logged-in */}
        {!user ? (
          <>
            <PopularPartners />
            <PlatformFeatures />
            <FeatureHighlights />
            <FinalCTA />
          </>
        ) : (
          <>
            {/* Additional sections for logged-in users */}
            <PlatformFeatures />
            <FeatureHighlights />
          </>
        )}
      </div>
    </MobileLayout>
  );
};

export default Index;
