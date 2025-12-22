import { motion } from "framer-motion";
import { Star, MessageCircle } from "lucide-react";
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
}

export function CompanionCard({ companion, index = 0 }: CompanionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={companion.image}
          alt={companion.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Star size={14} className="text-primary fill-primary" />
          <span className="text-sm font-medium text-foreground">{companion.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-xl font-display font-semibold text-foreground">
              {companion.name}, {companion.age}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">{companion.city}</p>
            <p className="text-primary font-semibold mt-2">
              ${companion.hourlyRate}/hour
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="gold" size="sm" asChild>
              <Link to={`/companion/${companion.id}`}>
                View Profile
              </Link>
            </Button>
            <Button variant="whatsapp" size="sm">
              <MessageCircle size={16} />
              Chat
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
