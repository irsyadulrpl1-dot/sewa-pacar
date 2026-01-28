import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardGridSkeleton } from "@/components/ui/loading-states";
import { InfoCard } from "./InfoCard";
import { useInfo, type InfoCategory } from "@/hooks/useInfo";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

const categories: { id: InfoCategory; label: string }[] = [
  { id: "tips", label: "Tips" },
  { id: "announcement", label: "Pengumuman" },
  { id: "guide", label: "Panduan" },
  { id: "system_update", label: "Update Sistem" },
];

export function InfoList() {
  const [category, setCategory] = useState<InfoCategory | undefined>(undefined);
  const { infos, isLoading } = useInfo(category);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter</span>
        </div>
        <div className="flex items-center gap-2">
          <Select onValueChange={(v) => setCategory(v as InfoCategory)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" disabled>
            Terbaru
          </Button>
        </div>
      </div>

      {isLoading && <CardGridSkeleton count={6} />}

      {!isLoading && infos && infos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Belum ada info.</p>
        </div>
      )}

      {!isLoading && infos && infos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {infos.map((info) => (
            <InfoCard key={info.id} info={info} />
          ))}
        </div>
      )}
    </div>
  );
}
