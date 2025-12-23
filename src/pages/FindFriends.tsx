import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, MapPin, User, UserPlus, Clock, Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MobileLayout } from "@/components/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useSearch } from "@/hooks/useSearch";
import { useFriends } from "@/hooks/useFriends";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/hooks/useProfile";

export default function FindFriends() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { results, loading, searchUsers, getAllUsers } = useSearch();
  const { 
    sendFriendRequest, 
    cancelFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendStatus, 
    getRequestByUser 
  } = useFriends();

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    query: "",
    city: "",
    gender: "all",
    minAge: 18,
    maxAge: 100,
    onlineOnly: false,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else {
      getAllUsers();
    }
  }, [user, navigate]);

  const handleSearch = () => {
    searchUsers({
      query: filters.query || undefined,
      city: filters.city || undefined,
      gender: filters.gender !== "all" ? filters.gender : undefined,
      minAge: filters.minAge,
      maxAge: filters.maxAge,
      onlineOnly: filters.onlineOnly,
    });
  };

  const handleFriendAction = async (profile: Profile) => {
    const status = getFriendStatus(profile.user_id);
    const request = getRequestByUser(profile.user_id);

    if (status === "none") {
      const { error } = await sendFriendRequest(profile.user_id);
      if (error) {
        toast({
          title: "Gagal mengirim permintaan",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Permintaan terkirim! 💌",
          description: `Menunggu ${profile.full_name} menerima`,
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
      const { error } = await acceptFriendRequest(request.id, profile.user_id);
      if (!error) {
        toast({
          title: "Sekarang berteman! 🎉",
          description: `Kamu dan ${profile.full_name} sekarang berteman`,
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

  const FriendButton = ({ profile }: { profile: Profile }) => {
    const status = getFriendStatus(profile.user_id);
    
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
            onClick={() => handleFriendAction(profile)}
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
            onClick={() => handleFriendAction(profile)}
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
            onClick={() => handleFriendAction(profile)}
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
          className="mb-6"
        >
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Cari Teman ✨
          </h1>
          <p className="text-muted-foreground">
            Temukan teman baru untuk hangout bareng
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau username..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              className="pl-10 rounded-xl h-12"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button
            variant={showFilters ? "gradient" : "outline"}
            size="icon"
            className="h-12 w-12 rounded-xl shrink-0"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-5 h-5" />
          </Button>
          <Button
            variant="gradient"
            className="h-12 rounded-xl shrink-0"
            onClick={handleSearch}
          >
            Cari
          </Button>
        </motion.div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 glass-card rounded-2xl p-4 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Kota</label>
                  <Input
                    placeholder="Semua kota"
                    value={filters.city}
                    onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Gender</label>
                  <select
                    value={filters.gender}
                    onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-background border border-input text-foreground"
                  >
                    <option value="all">Semua</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Usia: {filters.minAge} - {filters.maxAge} tahun
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={filters.minAge}
                      onChange={(e) => setFilters(prev => ({ ...prev, minAge: parseInt(e.target.value) || 18 }))}
                      className="rounded-xl"
                      min={18}
                    />
                    <Input
                      type="number"
                      value={filters.maxAge}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxAge: parseInt(e.target.value) || 100 }))}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="onlineOnly"
                  checked={filters.onlineOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, onlineOnly: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="onlineOnly" className="text-sm">Online sekarang</label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Sparkles className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada hasil pencarian</p>
            </div>
          ) : (
            results.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card rounded-2xl p-4 flex items-center gap-4"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-lavender to-pink p-0.5">
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  {profile.is_online && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-mint rounded-full border-2 border-background" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {profile.full_name}
                    </h3>
                    {profile.is_verified && (
                      <Badge className="bg-mint/20 text-mint text-xs px-2">✓</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    @{profile.username}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {profile.date_of_birth && (
                      <span>{calculateAge(profile.date_of_birth)} tahun</span>
                    )}
                    {profile.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {profile.city}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action */}
                <FriendButton profile={profile} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
