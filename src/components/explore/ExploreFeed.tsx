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

// Sample posts data combining companion info with activity posts
const samplePosts = [
  {
    id: "post-1",
    companion: companions[0], // Ayu Lestari
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800",
    caption: "☕ Coffee date vibes di cafe favorit! Siapa mau join? #coffeelover #cafehopping",
    tags: ["coffee", "cafe", "hangout"],
    likes: 128,
    comments: 24,
    createdAt: "2 jam lalu",
  },
  {
    id: "post-2",
    companion: companions[1], // Raka Pratama
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    caption: "🏔️ Weekend hiking ke Gunung Bromo! View-nya juara banget ✨ #hiking #bromo #adventure",
    tags: ["hiking", "nature", "travel"],
    likes: 256,
    comments: 42,
    createdAt: "5 jam lalu",
  },
  {
    id: "post-3",
    companion: companions[2], // Sinta Dewi
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
    caption: "🎨 Art exhibition bareng! Seni itu indah kalau dinikmati berdua 💫 #art #exhibition #culture",
    tags: ["art", "exhibition", "culture"],
    likes: 189,
    comments: 31,
    createdAt: "1 hari lalu",
  },
  {
    id: "post-4",
    companion: companions[3], // Dimas Putra
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
    caption: "🍜 Kuliner hunting hari ini! Ramen authentic dari Jepang 🇯🇵 #foodie #ramen #kuliner",
    tags: ["food", "culinary", "ramen"],
    likes: 312,
    comments: 56,
    createdAt: "1 hari lalu",
  },
  {
    id: "post-5",
    companion: companions[0], // Ayu Lestari
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
    caption: "🌅 Golden hour di pantai! Perfect moment untuk foto session 📸 #sunset #beach #photography",
    tags: ["photography", "sunset", "beach"],
    likes: 423,
    comments: 67,
    createdAt: "2 hari lalu",
  },
  {
    id: "post-6",
    companion: companions[1], // Raka Pratama
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
    caption: "🎵 Nonton konser bareng yuk! Vibesnya beda kalau rame-rame ✨ #concert #music #liveshow",
    tags: ["music", "concert", "entertainment"],
    likes: 567,
    comments: 89,
    createdAt: "3 hari lalu",
  },
];

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
  const sortedPosts = [...samplePosts].sort((a, b) => {
    switch (filter) {
      case "latest":
        return 0;
      case "popular":
        return b.likes - a.likes;
      default:
        return 0;
    }
  });

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

      {/* Posts */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-6">
          {sortedPosts.map((post, index) => {
            const isLiked = likedPosts.has(post.id);
            const isSaved = savedPosts.has(post.id);
            const companion = post.companion;

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden bg-card border-border/50 shadow-lg">
                  {/* Header - Profile Info */}
                  <div 
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleProfile(companion.id)}
                  >
                    <Avatar className="h-11 w-11 ring-2 ring-primary/20">
                      <AvatarImage src={companion.image} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold">
                        {companion.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground truncate">
                          {companion.name}
                        </span>
                        <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        @{companion.id.replace("-", "")}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{post.createdAt}</span>
                  </div>

                  {/* Post Image */}
                  <div className="relative aspect-square bg-muted">
                    <img
                      src={post.image}
                      alt={post.caption}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Actions */}
                  <div className="px-4 pt-3 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 hover:text-primary"
                      onClick={() => handleLike(post.id)}
                    >
                      <motion.div
                        animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.2 }}
                      >
                        <Heart className={`h-6 w-6 ${isLiked ? "fill-primary text-primary" : ""}`} />
                      </motion.div>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="h-6 w-6" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-6 w-6" />
                    </Button>
                  </div>

                  {/* Likes & Caption */}
                  <div className="px-4 pb-2">
                    <p className="font-semibold text-sm mb-1">
                      {isLiked ? post.likes + 1 : post.likes} suka
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">{companion.id.replace("-", "")}_</span>{" "}
                      {post.caption}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border mx-4" />

                  {/* Companion Profile Info */}
                  <div className="p-4 space-y-3 bg-muted/30">
                    {/* Name & Info */}
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{companion.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap mt-1">
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
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {companion.description}
                      </p>
                    </div>

                    {/* Personality */}
                    <div>
                      <h4 className="font-semibold text-foreground text-sm mb-2">Kepribadian</h4>
                      <div className="flex flex-wrap gap-2">
                        {companion.personality.map((trait) => (
                          <Badge
                            key={trait}
                            variant="outline"
                            className="rounded-full text-xs font-medium border-border bg-background"
                          >
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleChat(companion.id)}
                        className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Chat Sekarang
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleSave(post.id)}
                        className={`shrink-0 ${isSaved ? "bg-pink-50 border-pink-200 text-pink-500" : ""}`}
                      >
                        <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>

      {/* End of feed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <p className="text-sm text-muted-foreground">
          Kamu sudah melihat semua postingan 🎉
        </p>
      </motion.div>
    </div>
  );
}
