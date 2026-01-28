import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Search, SlidersHorizontal, Flame, Star, Clock, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanionExploreCard } from "./CompanionExploreCard";
import { useCompanions, CompanionFilters } from "@/hooks/useCompanions";
import { ExploreSkeletonCard } from "./ExploreSkeletonCard";

type FilterType = "all" | "trending" | "latest" | "top-rated";

// City filters will be populated dynamically from database

export function CompanionExploreFeed() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [cityFilter, setCityFilter] = useState("Semua");
  const [availabilityFilter, setAvailabilityFilter] = useState("Semua");
  const [activityFilter, setActivityFilter] = useState("Semua");
  const [genderFilter, setGenderFilter] = useState("Semua");
  const [onlineOnly, setOnlineOnly] = useState(false);

  // Build filters for useCompanions hook
  const filters: CompanionFilters = useMemo(() => {
    const result: CompanionFilters = {};

    if (searchQuery) {
      result.search = searchQuery;
    }

    if (cityFilter !== "Semua") {
      result.city = cityFilter;
    }

    if (availabilityFilter !== "Semua") {
      result.availability = availabilityFilter;
    }

    if (genderFilter !== "Semua") {
      result.gender = genderFilter === "Pria" ? "male" : "female";
    }

    if (onlineOnly) {
      result.onlineOnly = true;
    }

    // Map filter type to sort
    switch (activeFilter) {
      case "trending":
        result.sort = "rating_desc";
        break;
      case "latest":
        result.sort = "created_at";
        break;
      case "top-rated":
        result.sort = "rating_desc";
        break;
      default:
        result.sort = "created_at";
        break;
    }

    return result;
  }, [searchQuery, cityFilter, availabilityFilter, genderFilter, onlineOnly, activeFilter]);

  // Fetch companions from database
  const { companions, loading, error, refetch } = useCompanions(filters);

  // Get unique city, availability and activity options from fetched companions
  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    companions.forEach(c => {
      if (c.city) set.add(c.city);
    });
    return ["Semua", ...Array.from(set).sort()];
  }, [companions]);

  const availabilityOptions = useMemo(() => {
    const set = new Set<string>();
    companions.forEach(c => {
      if (c.availability) set.add(c.availability);
    });
    return ["Semua", ...Array.from(set)];
  }, [companions]);

  const activityOptions = useMemo(() => {
    const set = new Set<string>();
    companions.forEach(c => {
      if (c.activities && Array.isArray(c.activities)) {
        c.activities.forEach(a => set.add(a));
      }
    });
    return ["Semua", ...Array.from(set)];
  }, [companions]);

  // Filter by activity (client-side since it's an array field)
  const filteredCompanions = useMemo(() => {
    let result = [...companions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.city.toLowerCase().includes(query) ||
          c.personality.some((p) => p.toLowerCase().includes(query)) ||
          c.activities.some((a) => a.toLowerCase().includes(query))
      );
    }

    if (cityFilter !== "Semua") {
      result = result.filter((c) => c.city === cityFilter);
    }

    if (availabilityFilter !== "Semua") {
      result = result.filter(c => c.availability === availabilityFilter);
    }

    if (activityFilter !== "Semua") {
      result = result.filter(c => c.activities.includes(activityFilter));
    }

    // Additional client-side sorting if needed
    switch (activeFilter) {
      case "trending": {
        const maxRate = Math.max(...result.map(c => c.hourlyRate || c.hourly_rate || 0), 1);
        result.sort((a, b) => {
          const aActivity = activityFilter !== "Semua" ? (a.activities.includes(activityFilter) ? 1 : 0) : 0;
          const bActivity = activityFilter !== "Semua" ? (b.activities.includes(activityFilter) ? 1 : 0) : 0;
          const aAfford = 1 - (a.hourlyRate || a.hourly_rate || 0) / maxRate;
          const bAfford = 1 - (b.hourlyRate || b.hourly_rate || 0) / maxRate;
          const aScore = a.rating * 0.6 + aActivity * 0.3 + aAfford * 0.1;
          const bScore = b.rating * 0.6 + bActivity * 0.3 + bAfford * 0.1;
          return bScore - aScore;
        });
        break;
      }
      case "latest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "top-rated":
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return result;
  }, [companions, activeFilter, activityFilter]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama, kota, atau aktivitas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-background border-border/50"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Badge
          variant={activeFilter === "all" ? "default" : "outline"}
          className="cursor-pointer shrink-0 rounded-full px-4 py-1.5"
          onClick={() => setActiveFilter("all")}
        >
          <Compass className="h-3.5 w-3.5 mr-1.5" />
          Jelajahi
        </Badge>
        <Badge
          variant={activeFilter === "trending" ? "default" : "outline"}
          className="cursor-pointer shrink-0 rounded-full px-4 py-1.5"
          onClick={() => setActiveFilter("trending")}
        >
          <Flame className="h-3.5 w-3.5 mr-1.5" />
          Trending
        </Badge>
        <Badge
          variant={activeFilter === "latest" ? "default" : "outline"}
          className="cursor-pointer shrink-0 rounded-full px-4 py-1.5"
          onClick={() => setActiveFilter("latest")}
        >
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          Terbaru
        </Badge>
        <Badge
          variant={activeFilter === "top-rated" ? "default" : "outline"}
          className="cursor-pointer shrink-0 rounded-full px-4 py-1.5"
          onClick={() => setActiveFilter("top-rated")}
        >
          <Star className="h-3.5 w-3.5 mr-1.5" />
          Rating Tertinggi
        </Badge>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {cityOptions.map((city) => (
          <Button
            key={city}
            variant={cityFilter === city ? "default" : "ghost"}
            size="sm"
            onClick={() => setCityFilter(city)}
            className={`shrink-0 rounded-full ${
              cityFilter === city
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-muted-foreground"
            }`}
          >
            {city}
          </Button>
        ))}
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {availabilityOptions.map((opt) => (
          <Button
            key={opt}
            variant={availabilityFilter === opt ? "default" : "ghost"}
            size="sm"
            onClick={() => setAvailabilityFilter(opt)}
            className={`shrink-0 rounded-full ${
              availabilityFilter === opt
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-muted-foreground"
            }`}
          >
            {opt === "Semua" ? "Semua Waktu" : opt}
          </Button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {activityOptions.map((opt) => (
          <Button
            key={opt}
            variant={activityFilter === opt ? "default" : "ghost"}
            size="sm"
            onClick={() => setActivityFilter(opt)}
            className={`shrink-0 rounded-full ${
              activityFilter === opt
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-muted-foreground"
            }`}
          >
            {opt === "Semua" ? "Semua Aktivitas" : opt}
          </Button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["Semua", "Pria", "Wanita"].map((opt) => (
          <Button
            key={opt}
            variant={genderFilter === opt ? "default" : "ghost"}
            size="sm"
            onClick={() => setGenderFilter(opt)}
            className={`shrink-0 rounded-full ${
              genderFilter === opt
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-muted-foreground"
            }`}
          >
            {opt === "Semua" ? "Semua Gender" : opt}
          </Button>
        ))}
      </div>

      {/* Online Only Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={onlineOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlineOnly(!onlineOnly)}
            className="gap-1.5"
          >
            <Star className="h-4 w-4" />
            {onlineOnly ? "Hanya Online" : "Semua Status"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Menampilkan <span className="font-medium text-foreground">{filteredCompanions.length}</span> partner
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <ExploreSkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-4">
            <Loader2 className="h-10 w-10 text-destructive animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Gagal memuat data
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-4">
            {error}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Coba Lagi
          </Button>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredCompanions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Compass className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Tidak ada hasil
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Coba ubah filter atau kata kunci pencarian untuk menemukan companion yang cocok.
          </p>
        </motion.div>
      ) : (
        !loading && !error && (
          <AnimatePresence mode="popLayout">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCompanions.map((companion, index) => (
                <motion.div
                  key={companion.user_id || companion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CompanionExploreCard companion={companion} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )
      )}
    </div>
  );
}
