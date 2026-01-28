import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompanionExploreCard } from "@/components/explore/CompanionExploreCard";
import { Sparkles } from "lucide-react";
import { useCompanions } from "@/hooks/useCompanions";
import { ExploreSkeletonCard } from "@/components/explore/ExploreSkeletonCard";

type SortOption = "trending" | "rating" | "price-low" | "price-high";

export function InfoList() {
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  
  // Map sort option to useCompanions sort parameter
  const sortMap: Record<SortOption, "rating_desc" | "price_asc" | "price_desc" | "created_at"> = {
    "trending": "created_at",
    "rating": "rating_desc",
    "price-low": "price_asc",
    "price-high": "price_desc",
  };

  const { companions, loading, error, refreshing } = useCompanions({
    sort: sortMap[sortBy],
    limit: 12,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-display font-bold text-foreground">Rekomendasi Untukmu</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-48 bg-background border-border/50">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="rating">Rating Tertinggi</SelectItem>
              <SelectItem value="price-low">Harga Terendah</SelectItem>
              <SelectItem value="price-high">Harga Tertinggi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ExploreSkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Gagal memuat rekomendasi. Silakan coba lagi.</p>
        </div>
      ) : companions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Belum ada partner yang tersedia.</p>
        </div>
      ) : (
        <div className="relative">
          {refreshing && (
            <div className="absolute -top-8 right-0 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex h-3 w-3 rounded-full bg-primary animate-pulse" />
              Memperbarui rekomendasi...
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companions.map((companion) => (
              <CompanionExploreCard key={companion.id} companion={companion} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
