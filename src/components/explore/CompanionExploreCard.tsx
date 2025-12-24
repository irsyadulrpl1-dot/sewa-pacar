import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Star, Heart, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Companion } from "@/data/companions";

interface CompanionExploreCardProps {
  companion: Companion;
}

export function CompanionExploreCard({ companion }: CompanionExploreCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleChatClick = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate(`/companion/${companion.id}/chat`);
  };

  const handleCardClick = () => {
    navigate(`/companion/${companion.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-card border-border/50 shadow-lg hover:shadow-xl transition-shadow">
        {/* Image Section */}
        <div 
          className="relative cursor-pointer"
          onClick={handleCardClick}
        >
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={companion.image}
              alt={companion.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          
          {/* Rating Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-background/90 text-foreground backdrop-blur-sm border-0 gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {companion.rating}
            </Badge>
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Name & Basic Info */}
          <div>
            <h3 
              className="text-xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
              onClick={handleCardClick}
            >
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

          {/* Price */}
          <div className="text-primary font-bold text-lg">
            {formatPrice(companion.hourlyRate)}/jam
          </div>

          {/* Bio */}
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-1">Tentang Aku</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {companion.description}
            </p>
          </div>

          {/* Personality Tags */}
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-2">Kepribadian</h4>
            <div className="flex flex-wrap gap-2">
              {companion.personality.slice(0, 4).map((trait) => (
                <Badge
                  key={trait}
                  variant="outline"
                  className="rounded-full text-xs font-medium border-border bg-background/50"
                >
                  {trait}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleChatClick}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Chat Sekarang
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`shrink-0 ${isFavorite ? "bg-pink-50 border-pink-200 text-pink-500" : ""}`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
