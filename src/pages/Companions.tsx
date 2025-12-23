import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { CompanionCard } from "@/components/CompanionCard";
import { companions } from "@/data/companions";
import { Search, SlidersHorizontal, X, Heart, MapPin, User, UserPlus, Clock, Check, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useSearch, SafeProfile } from "@/hooks/useSearch";
import { useFriends } from "@/hooks/useFriends";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

const Companions = () => {
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

  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);

  const cities = [...new Set(companions.map((c) => c.city))];

  useEffect(() => {
    if (user) {
      getRecommendedUsers(profile);
    }
  }, [user, profile]);

  const filteredCompanions = companions
    .filter((companion) => {
      const matchesSearch =
        companion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        companion.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = cityFilter === "all" || companion.city === cityFilter;
      return matchesSearch && matchesCity;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price-low") return a.hourlyRate - b.hourlyRate;
      if (sortBy === "price-high") return b.hourlyRate - a.hourlyRate;
      return 0;
    });

  const handleFriendAction = async (targetProfile: SafeProfile) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
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
        toast({ title: "Permintaan dibatalkan" });
      }
    } else if (status === "request_received" && request) {
      const { error } = await acceptFriendRequest(request.id, targetProfile.user_id);
      if (!error) {
        toast({
          title: "It's a match! 💕",
          description: `Kamu dan ${targetProfile.full_name} sekarang connected`,
        });
      }
    }
  };

  const getSharedInfo = (targetProfile: SafeProfile) => {
    const shared: string[] = [];
    if (profile?.city && targetProfile.city && 
        profile.city.toLowerCase() === targetProfile.city.toLowerCase()) {
      shared.push(`📍 ${targetProfile.city}`);
    }
    if (profile?.interests && targetProfile.interests) {
      const sharedInterests = profile.interests.filter(
        interest => targetProfile.interests?.includes(interest)
      );
      if (sharedInterests.length > 0) {
        shared.push(`💫 ${sharedInterests.slice(0, 2).join(", ")}`);
      }
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
      {/* Header */}
      <section className="pt-8 md:pt-32 pb-6 md:pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="text-primary font-medium text-xs md:text-sm tracking-wider uppercase">
              Katalog
            </span>
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-display font-bold text-foreground mt-2 md:mt-4">
              Pacar Sewaan 💕
            </h1>
            <p className="text-muted-foreground mt-2 md:mt-4 max-w-xl mx-auto text-sm md:text-base">
              Temuin yang cocok buat jadi plus one kamu kapan aja dan di mana aja!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Recommendations Section - Only for logged in users */}
      {user && (
        <section className="pb-6 md:pb-8">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-pink" />
                <h2 className="text-lg md:text-xl font-display font-semibold text-foreground">
                  Rekomendasi Untukmu
                </h2>
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
                    onClick={() => navigate("/profile")}
                  >
                    Lengkapi profilmu
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                  {results.slice(0, 6).map((targetProfile, index) => {
                    const sharedInfo = getSharedInfo(targetProfile);
                    
                    return (
                      <motion.div
                        key={targetProfile.user_id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex-shrink-0 w-[200px] glass-card rounded-2xl p-4"
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

      {/* Search & Filters */}
      <section className="pb-4 md:pb-8 sticky top-14 md:top-0 z-30 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Cari nama atau kota..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card border-border rounded-xl h-12"
                />
              </div>
              <Button 
                variant={showFilters ? "gradient" : "outline"}
                size="icon" 
                className="h-12 w-12 rounded-xl shrink-0"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? <X size={18} /> : <SlidersHorizontal size={18} />}
              </Button>
            </div>

            {/* Filters - collapsible on mobile */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-3 p-4 bg-card rounded-xl border border-border"
              >
                {/* City Filter */}
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger className="flex-1 min-w-[120px] bg-background border-border rounded-xl">
                    <SelectValue placeholder="Kota" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kota</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex-1 min-w-[120px] bg-background border-border rounded-xl">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating Tertinggi</SelectItem>
                    <SelectItem value="price-low">Harga: Terendah</SelectItem>
                    <SelectItem value="price-high">Harga: Tertinggi</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            )}

            {/* Quick filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:hidden scrollbar-hide">
              {cities.slice(0, 4).map((city) => (
                <button
                  key={city}
                  onClick={() => setCityFilter(cityFilter === city ? "all" : city)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    cityFilter === city
                      ? "bg-gradient-to-r from-lavender to-pink text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Companions Grid */}
      <section className="py-4 md:py-8">
        <div className="container mx-auto px-4">
          {filteredCompanions.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {filteredCompanions.map((companion, index) => (
                <CompanionCard key={companion.id} companion={companion} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 md:py-20">
              <p className="text-muted-foreground text-base md:text-lg">
                Waduh, nggak ada yang cocok nih bestie. Coba ubah filter ya! 😅
              </p>
            </div>
          )}
        </div>
      </section>
    </MobileLayout>
  );
};

export default Companions;
