import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Bookmark, MapPin, Clock, Star, BadgeCheck, UserPlus, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExplorePost } from "@/hooks/useExplore";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ExplorePostCardProps {
  post: ExplorePost;
  onLike: (postId: string, isLiked: boolean) => void;
  onSave: (postId: string, isSaved: boolean) => void;
  onView: (postId: string) => void;
}

// Mock data untuk informasi tambahan companion (karena tidak ada di database post)
const getMockCompanionInfo = (username: string) => {
  const mockData: Record<string, { age: number; hourlyRate: number; availability: string; personality: string[] }> = {
    default: {
      age: 22,
      hourlyRate: 250000,
      availability: "Weekdays & Weekend",
      personality: ["Friendly", "Ceria", "Humble", "Good Listener"],
    },
  };
  return mockData[username] || mockData.default;
};

export function ExplorePostCard({ post, onLike, onSave, onView }: ExplorePostCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [isSaved, setIsSaved] = useState(post.is_saved);
  const [likeCount, setLikeCount] = useState(Number(post.like_count));
  const cardRef = useRef<HTMLDivElement>(null);
  const hasTrackedView = useRef(false);

  const companionInfo = getMockCompanionInfo(post.author_username);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Track view when card becomes visible
  useEffect(() => {
    if (!cardRef.current || hasTrackedView.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onView(post.id);
          hasTrackedView.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [post.id, onView]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    onLike(post.id, isLiked);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave(post.id, isSaved);
  };

  const handleChatClick = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate(`/messages?user=${post.user_id}`);
  };

  const handleProfileClick = () => {
    navigate(`/user/${post.user_id}`);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-card border-border/50 shadow-lg hover:shadow-xl transition-shadow">
        {/* Post Image */}
        <div className="relative cursor-pointer" onClick={handleProfileClick}>
          <div className="aspect-[4/3] overflow-hidden bg-muted">
            <img
              src={post.image_url}
              alt={post.caption || "Post"}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          </div>
          
          {/* Rating Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-background/90 text-foreground backdrop-blur-sm border-0 gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              4.9
            </Badge>
          </div>

          {/* Tags overlay */}
          {post.tags && post.tags.length > 0 && (
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-background/80 backdrop-blur-sm text-xs"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Timestamp */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs">
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: false,
                locale: id,
              })}
            </Badge>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Profile & Info Section */}
        <div className="p-4 space-y-3">
          {/* Name & Basic Info */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src={post.author_avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold text-xs">
                  {post.author_full_name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <h3 
                className="text-lg font-bold text-foreground cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5"
                onClick={handleProfileClick}
              >
                {post.author_full_name}
                {post.author_is_verified && (
                  <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              {post.author_city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {post.author_city}
                </span>
              )}
              <span>•</span>
              <span>{companionInfo.age} tahun</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {companionInfo.availability}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="text-primary font-bold text-lg">
            {formatPrice(companionInfo.hourlyRate)}/jam
          </div>

          {/* Caption as Bio */}
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-1">Tentang Aku</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {post.caption || post.author_bio || "Hai! Aku siap menemani kamu untuk berbagai kegiatan seru. Yuk kenalan!"}
            </p>
          </div>

          {/* Personality Tags */}
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-2">Kepribadian</h4>
            <div className="flex flex-wrap gap-2">
              {companionInfo.personality.map((trait) => (
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

          {/* Engagement Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
            <button 
              onClick={handleLike}
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <motion.div
                animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.2 }}
              >
                <Heart
                  className={`h-4 w-4 ${isLiked ? "fill-primary text-primary" : ""}`}
                />
              </motion.div>
              <span>{likeCount}</span>
            </button>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" />
              {Number(post.comment_count)}
            </span>
            <button 
              onClick={handleSave}
              className="flex items-center gap-1.5 hover:text-primary transition-colors ml-auto"
            >
              <motion.div
                animate={isSaved ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.2 }}
              >
                <Bookmark
                  className={`h-4 w-4 ${isSaved ? "fill-primary text-primary" : ""}`}
                />
              </motion.div>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleChatClick}
              variant="default"
              className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <MessageCircle className="h-4 w-4" />
              Chat
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleSave}
              className={`shrink-0 ${isSaved ? "bg-pink-50 border-pink-200 text-pink-500" : ""}`}
            >
              <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
