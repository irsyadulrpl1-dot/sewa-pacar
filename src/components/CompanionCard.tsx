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
      whileHover={{ y: -4 }}
      className="group relative bg-card rounded-2xl md:rounded-3xl overflow-hidden border border-border/50 shadow-soft hover:shadow-card-hover transition-all duration-500"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={companion.image}
          alt={companion.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
        
        {/* Badge */}
        {getBadge()}
        
        {/* Rating Badge */}
        <div className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center gap-1 bg-card/90 backdrop-blur-md px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg">
          <Star size={12} className="text-pink fill-pink md:w-3.5 md:h-3.5" />
          <span className="text-xs md:text-sm font-semibold text-foreground">{companion.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
        <div className="space-y-1.5 md:space-y-2">
          {/* Name & Age */}
          <h3 className="text-sm md:text-xl font-display font-bold text-primary-foreground flex items-center gap-1 md:gap-2 leading-tight">
            <span className="truncate">{companion.name}</span>
            <span className="flex-shrink-0">{companion.age}</span>
            <Verified size={12} className="text-sky flex-shrink-0 md:w-4 md:h-4" />
          </h3>
          
          {/* City */}
          <p className="text-primary-foreground/80 text-xs md:text-sm">
            📍 {companion.city}
          </p>
          
          {/* Price */}
          <div className="flex items-baseline gap-0.5 md:gap-1">
            <span className="text-sm md:text-lg font-bold text-primary-foreground">
              Rp{companion.hourlyRate.toLocaleString('id-ID')}
            </span>
            <span className="text-primary-foreground/70 text-[10px] md:text-sm">/jam</span>
          </div>
          
          {/* Buttons - hidden on small mobile, shown on larger screens */}
          <div className="hidden md:flex gap-2 pt-1">
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
      
      {/* Mobile: Full card is clickable */}
      <Link 
        to={`/companion/${companion.id}`} 
        className="absolute inset-0 z-10 md:hidden"
        aria-label={`Lihat profil ${companion.name}`}
      />
    </motion.div>
  );
}