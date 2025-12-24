import { Flame, Clock, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterType } from "@/hooks/useExplore";
import { motion } from "framer-motion";

interface ExploreFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: { id: FilterType; label: string; icon: React.ElementType }[] = [
  { id: "popular", label: "Populer", icon: Flame },
  { id: "latest", label: "Terbaru", icon: Clock },
  { id: "nearby", label: "Terdekat", icon: MapPin },
  { id: "interests", label: "Untukmu", icon: Sparkles },
];

export function ExploreFilters({ activeFilter, onFilterChange }: ExploreFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.id;
        
        return (
          <motion.div
            key={filter.id}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={`
                gap-1.5 whitespace-nowrap rounded-full transition-all
                ${isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                  : "hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                }
              `}
              onClick={() => onFilterChange(filter.id)}
            >
              <Icon className="h-4 w-4" />
              {filter.label}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}
