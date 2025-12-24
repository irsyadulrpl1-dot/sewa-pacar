import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Bookmark, Share2, BadgeCheck, MapPin } from "lucide-react";
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

interface ExplorePostCardProps {
  post: ExplorePost;
  onLike: (postId: string, isLiked: boolean) => void;
  onSave: (postId: string, isSaved: boolean) => void;
  onView: (postId: string) => void;
}

export function ExplorePostCard({ post, onLike, onSave, onView }: ExplorePostCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [isSaved, setIsSaved] = useState(post.is_saved);
  const [likeCount, setLikeCount] = useState(Number(post.like_count));
  const cardRef = useRef<HTMLDivElement>(null);
  const hasTrackedView = useRef(false);

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

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.caption || "Check this post!",
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link disalin!" });
    }
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
      <Card className="overflow-hidden bg-card border-border/50 backdrop-blur-sm">
        {/* Header */}
        <div 
          className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={handleProfileClick}
        >
          <Avatar className="h-11 w-11 ring-2 ring-primary/20">
            <AvatarImage src={post.author_avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold">
              {post.author_full_name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground truncate">
                {post.author_full_name}
              </span>
              {post.author_is_verified && (
                <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>@{post.author_username}</span>
              {post.author_city && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" />
                    {post.author_city}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="relative aspect-square bg-muted">
          <img
            src={post.image_url}
            alt={post.caption || "Post"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
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
        </div>

        {/* Actions */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 hover:text-primary"
                onClick={handleLike}
              >
                <motion.div
                  animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <Heart
                    className={`h-5 w-5 ${isLiked ? "fill-primary text-primary" : ""}`}
                  />
                </motion.div>
                <span className="text-sm font-medium">{likeCount}</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">{Number(post.comment_count)}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="hover:text-primary"
            >
              <motion.div
                animate={isSaved ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.2 }}
              >
                <Bookmark
                  className={`h-5 w-5 ${isSaved ? "fill-primary text-primary" : ""}`}
                />
              </motion.div>
            </Button>
          </div>

          {/* Caption */}
          {post.caption && (
            <p className="text-sm text-foreground line-clamp-2">{post.caption}</p>
          )}

          {/* Bio preview */}
          {post.author_bio && (
            <p className="text-xs text-muted-foreground line-clamp-1 italic">
              {post.author_bio}
            </p>
          )}

          {/* Timestamp */}
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
              locale: id,
            })}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
