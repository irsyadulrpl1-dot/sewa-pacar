import { motion } from "framer-motion";
import { useState } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { CompanionCard } from "@/components/CompanionCard";
import { companions } from "@/data/companions";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Companions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);

  const cities = [...new Set(companions.map((c) => c.city))];

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
              Jelajahi
            </span>
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-display font-bold text-foreground mt-2 md:mt-4">
              Teman Tersedia
            </h1>
            <p className="text-muted-foreground mt-2 md:mt-4 max-w-xl mx-auto text-sm md:text-base">
              Temuin teman yang cocok buat nemenin kamu kapan aja dan di mana aja!
            </p>
          </motion.div>
        </div>
      </section>

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
                Waduh, nggak ada teman yang cocok nih. Coba ubah filter ya! 😅
              </p>
            </div>
          )}
        </div>
      </section>
    </MobileLayout>
  );
};

export default Companions;
