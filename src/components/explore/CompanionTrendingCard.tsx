import { motion } from "framer-motion";
import { MapPin, Clock, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Companion } from "@/data/companions";

export function CompanionTrendingCard({ companion, isTrending }: { companion: Companion; isTrending?: boolean }) {
  const navigate = useNavigate();

  const handleProfile = () => {
    navigate(`/companion/${companion.id}`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden bg-card border-border/50 shadow-lg hover:shadow-xl transition-shadow">
        <div className="relative cursor-pointer" onClick={handleProfile}>
          <div className="aspect-[4/3] overflow-hidden">
            <img src={companion.image} alt={companion.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
          </div>
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-background/90 text-foreground backdrop-blur-sm border-0 gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {companion.rating}
            </Badge>
            {isTrending && <Badge className="bg-primary text-primary-foreground border-0">🔥 Trending</Badge>}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors" onClick={handleProfile}>
              {companion.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {companion.city}
              </span>
              <span>•</span>
              <span>{companion.age} tahun</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {companion.availability}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground line-clamp-3">{companion.bio}</p>
          </div>
          <div className="pt-2">
            <Button onClick={handleProfile} variant="outline" className="w-full rounded-xl">
              Lihat Profil
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
