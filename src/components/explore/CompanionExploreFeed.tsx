import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { companions } from "@/data/companions";
import { CompanionExploreCard } from "./CompanionExploreCard";

type FilterType = "all" | "nearby" | "top-rated" | "affordable";

const CITY_FILTERS = ["Semua", "Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Malang"];

export function CompanionExploreFeed() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [cityFilter, setCityFilter] = useState("Semua");

  const filteredCompanions = useMemo(() => {
    let result = [...companions];

    // Search filter
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

    // City filter
    if (cityFilter !== "Semua") {
      result = result.filter((c) => c.city === cityFilter);
    }

    // Sort by filter type
    switch (activeFilter) {
      case "top-rated":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "affordable":
        result.sort((a, b) => a.hourlyRate - b.hourlyRate);
        break;
      case "nearby":
        // For demo, just shuffle
        result.sort(() => Math.random() - 0.5);
        break;
      default:
        // Keep original order
        break;
    }

    return result;
  }, [searchQuery, activeFilter, cityFilter]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama, kota, atau aktivitas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-background border-border/50"
        />
      </div>

      {/* Filter Chips */}
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
          variant={activeFilter === "top-rated" ? "default" : "outline"}
          className="cursor-pointer shrink-0 rounded-full px-4 py-1.5"
          onClick={() => setActiveFilter("top-rated")}
        >
          ⭐ Rating Tertinggi
        </Badge>
        <Badge
          variant={activeFilter === "affordable" ? "default" : "outline"}
          className="cursor-pointer shrink-0 rounded-full px-4 py-1.5"
          onClick={() => setActiveFilter("affordable")}
        >
          💰 Termurah
        </Badge>
        <Badge
          variant={activeFilter === "nearby" ? "default" : "outline"}
          className="cursor-pointer shrink-0 rounded-full px-4 py-1.5"
          onClick={() => setActiveFilter("nearby")}
        >
          📍 Terdekat
        </Badge>
      </div>

      {/* City Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CITY_FILTERS.map((city) => (
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

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Menampilkan <span className="font-medium text-foreground">{filteredCompanions.length}</span> companion
        </p>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Companion Cards */}
      {filteredCompanions.length === 0 ? (
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
        <AnimatePresence mode="popLayout">
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredCompanions.map((companion, index) => (
              <motion.div
                key={companion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <CompanionExploreCard companion={companion} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
