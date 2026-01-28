import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, MapPin, Clock, BadgeCheck, Flame, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { companions } from "@/data/companions";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Postingan dihapus dari Jelajahi
const samplePosts: Array<never> = [];

type FilterType = "popular" | "latest" | "nearby" | "interests";

const filters: { id: FilterType; label: string; icon: React.ElementType }[] = [
  { id: "popular", label: "Populer", icon: Flame },
  { id: "latest", label: "Terbaru", icon: Clock },
  { id: "nearby", label: "Terdekat", icon: MapPin },
  { id: "interests", label: "Untukmu", icon: Sparkles },
];

export function ExploreFeed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterType>("popular");
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleSave = (postId: string) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleChat = (companionId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate(`/companion/${companionId}/chat`);
  };

  const handleProfile = (companionId: string) => {
    navigate(`/companion/${companionId}`);
  };

  // Sort posts based on filter
  const sortedPosts: Array<never> = [];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((f) => {
          const Icon = f.icon;
          const isActive = filter === f.id;
          
          return (
            <motion.div key={f.id} whileTap={{ scale: 0.95 }}>
              <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`gap-1.5 whitespace-nowrap rounded-full transition-all ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                }`}
                onClick={() => setFilter(f.id)}
              >
                <Icon className="h-4 w-4" />
                {f.label}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Grid layout dipertahankan tanpa konten postingan */}
      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tidak ada item ditampilkan */}
        </div>
      </AnimatePresence>

      {/* End of feed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <p className="text-sm text-muted-foreground">
          Konten postingan di Jelajahi telah dihapus
        </p>
      </motion.div>
    </div>
  );
}
