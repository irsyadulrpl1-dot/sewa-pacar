import { motion } from "framer-motion";
import { Star, MessageCircle, Verified, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export interface Companion {
  id: string;
  name: string;
  age: number;
  city: string;
  rating: number;
  hourlyRate: number;
  image: string;
  bio: string;
  activities: string[];
}

interface CompanionCardProps {
  companion: Companion;
  index?: number;
  badge?: "popular" | "new" | "verified";
}

export function CompanionCard({ companion, index = 0, badge }: CompanionCardProps) {
  const getBadge = () => {
    if (badge === "popular") {
      return (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-to-r from-pink to-coral text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
          <Sparkles size={12} />
          Populer
        </div>
      );
    }
    if (badge === "new") {
      return (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-to-r from-mint to-sky text-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
          ✨ Baru
        </div>
      );
    }
    if (badge === "verified") {
      return (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-to-r from-lavender to-pink text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
          <Verified size={12} />
          Verified
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group relative bg-card rounded-3xl overflow-hidden border border-border/50 shadow-soft hover:shadow-card-hover transition-all duration-500"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={companion.image}
          alt={companion.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        
        {/* Badge */}
        {getBadge()}
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-card/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
          <Star size={14} className="text-pink fill-pink" />
          <span className="text-sm font-semibold text-foreground">{companion.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-xl font-display font-bold text-primary-foreground flex items-center gap-2">
              {companion.name}, {companion.age}
              <Verified size={16} className="text-sky" />
            </h3>
            <p className="text-primary-foreground/80 text-sm mt-1">📍 {companion.city}</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-lg font-bold text-primary-foreground">
                Rp{companion.hourlyRate.toLocaleString('id-ID')}
              </span>
              <span className="text-primary-foreground/70 text-sm">/jam</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="gradient" size="sm" asChild className="shadow-lg">
              <Link to={`/companion/${companion.id}`}>
                Lihat Profil
              </Link>
            </Button>
            <Button variant="whatsapp" size="sm" className="shadow-lg">
              <MessageCircle size={14} />
              Chat
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}