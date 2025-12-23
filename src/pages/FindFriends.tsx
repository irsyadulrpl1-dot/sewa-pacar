import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, User, UserPlus, Clock, Check, Sparkles, Heart, RefreshCw, Search, SlidersHorizontal, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MobileLayout } from "@/components/MobileLayout";
import { CompanionCard } from "@/components/CompanionCard";
import { companions } from "@/data/companions";
import { useAuth } from "@/contexts/AuthContext";
import { useSearch } from "@/hooks/useSearch";
import { useFriends } from "@/hooks/useFriends";
import { useProfile, Profile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  // Companions filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);

  const cities = [...new Set(companions.map((c) => c.city))];

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

  const FriendButton = ({ profile: targetProfile }: { profile: Profile }) => {
    const status = getFriendStatus(targetProfile.user_id);
    
    switch (status) {
      case "friends":
        return (
          <Button size="sm" variant="soft" className="rounded-xl h-7 text-xs px-2.5 w-full" disabled>
            <Check className="w-3 h-3 mr-1" />
            Matched
          </Button>
        );
      case "request_sent":
        return (
          <Button 
            size="sm" 
            variant="outline" 
            className="rounded-xl h-7 text-xs px-2.5 w-full"
            onClick={() => handleFriendAction(targetProfile)}
          >
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Button>
        );
      case "request_received":
        return (
          <Button 
            size="sm" 
            variant="gradient" 
            className="rounded-xl h-7 text-xs px-2.5 w-full"
            onClick={() => handleFriendAction(targetProfile)}
          >
            <Check className="w-3 h-3 mr-1" />
            Terima
          </Button>
        );
      default:
        return (
          <Button 
            size="sm" 
            variant="gradient" 
            className="rounded-xl h-7 text-xs px-2.5 w-full"
            onClick={() => handleFriendAction(targetProfile)}
          >
            <UserPlus className="w-3 h-3 mr-1" />
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
          className="mb-6"
        >
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Cari Pacar Sewaan 💕
          </h1>
          <p className="text-muted-foreground">
            Temuin yang cocok buat jadi plus one kamu!
          </p>
        </motion.div>

        {/* Recommendations Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink" />
              <h2 className="text-lg font-display font-semibold text-foreground">
                Match Untukmu 💘
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-8 w-8"
              onClick={handleRefresh}
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
            <div className="text-center py-6 glass-card rounded-2xl">
              <User className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">Belum ada rekomendasi</p>
              <Button 
                variant="link" 
                className="mt-2 text-sm"
                onClick={() => navigate("/profile")}
              >
                Lengkapi profilmu
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-3 sm:overflow-x-auto sm:pb-2 sm:-mx-4 sm:px-4 scrollbar-hide">
              {results.slice(0, 8).map((targetProfile, index) => {
                const sharedInfo = getSharedInfo(targetProfile);
                
                return (
                  <motion.div
                    key={targetProfile.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="sm:flex-shrink-0 sm:w-[160px] glass-card rounded-2xl p-3"
                  >
                    {/* Avatar */}
                    <div className="relative mb-2 flex justify-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lavender to-pink p-0.5">
                        <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                          {targetProfile.avatar_url ? (
                            <img 
                              src={targetProfile.avatar_url} 
                              alt={targetProfile.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      {targetProfile.is_online && (
                        <div className="absolute bottom-0 right-1/2 translate-x-5 w-2.5 h-2.5 bg-mint rounded-full border-2 border-background" />
                      )}
                    </div>

                    {/* Name & Info */}
                    <div className="text-center mb-2">
                      <h3 className="font-semibold text-foreground text-xs truncate px-1">
                        {targetProfile.full_name}
                      </h3>
                      <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                        {targetProfile.date_of_birth && (
                          <span>{calculateAge(targetProfile.date_of_birth)} th</span>
                        )}
                        {targetProfile.city && (
                          <span className="flex items-center gap-0.5 truncate max-w-[60px]">
                            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                            <span className="truncate">{targetProfile.city}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Shared Info */}
                    {sharedInfo.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center mb-2">
                        {sharedInfo.slice(0, 1).map((info, i) => (
                          <span 
                            key={i}
                            className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full truncate max-w-full"
                          >
                            {info}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex justify-center">
                      <FriendButton profile={targetProfile} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Companions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-lavender" />
            <h2 className="text-lg font-display font-semibold text-foreground">
              Pacar Available ✨
            </h2>
          </div>

          {/* Search & Filters */}
          <div className="space-y-3 mb-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Cari nama atau kota..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card border-border rounded-xl h-11"
                />
              </div>
              <Button 
                variant={showFilters ? "gradient" : "outline"}
                size="icon" 
                className="h-11 w-11 rounded-xl shrink-0"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? <X size={18} /> : <SlidersHorizontal size={18} />}
              </Button>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-3 p-4 bg-card rounded-xl border border-border"
              >
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
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
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
          </div>

          {/* Companions Grid */}
          {filteredCompanions.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredCompanions.map((companion, index) => (
                <CompanionCard key={companion.id} companion={companion} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nggak ada yang cocok. Coba ubah filter! 😅
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </MobileLayout>
  );
}
