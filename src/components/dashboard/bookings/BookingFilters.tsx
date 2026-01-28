import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

export interface FilterState {
  search: string;
  status: string;
  dateRange: string;
  sortBy: string;
}

interface BookingFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
}

export function BookingFilters({ filters, onFilterChange, onReset }: BookingFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Cari nama penyewa atau ID booking..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="pl-9 h-10 bg-background"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <Select
            value={filters.status}
            onValueChange={(val) => onFilterChange("status", val)}
          >
            <SelectTrigger className="w-[140px] h-10 bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="approved">Diterima</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
              <SelectItem value="cancelled">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.dateRange}
            onValueChange={(val) => onFilterChange("dateRange", val)}
          >
            <SelectTrigger className="w-[140px] h-10 bg-background">
              <SelectValue placeholder="Waktu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Waktu</SelectItem>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="week">Minggu Ini</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showAdvanced ? "default" : "outline"}
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
          
          {(filters.search || filters.status !== "all" || filters.dateRange !== "all") && (
             <Button
             variant="ghost"
             size="icon"
             className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
             onClick={onReset}
           >
             <X className="w-4 h-4" />
           </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 rounded-xl border border-border/50 bg-muted/30 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Urutkan</label>
            <Select
              value={filters.sortBy}
              onValueChange={(val) => onFilterChange("sortBy", val)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Urutan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Terbaru</SelectItem>
                <SelectItem value="oldest">Terlama</SelectItem>
                <SelectItem value="highest_price">Harga Tertinggi</SelectItem>
                <SelectItem value="lowest_price">Harga Terendah</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
