import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, MapPin, Clock, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Post, usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import { PostComments } from "./PostComments";
import { Link, useNavigate } from "react-router-dom";

interface PostCardProps {
  post: Post;
}

// Mock companion data for profile info
const getMockProfileInfo = () => ({
  age: 22,
  hourlyRate: 250000,
  availability: "Weekdays & Weekend",
  personality: ["Friendly", "Ceria", "Humble", "Good Listener"],
  bio: "Hai! Aku siap menemani kamu untuk berbagai kegiatan seru. Dari coffee date sampai traveling, aku bisa jadi teman yang asik!",
});

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toggleLike, deletePost } = usePosts();
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isSaved, setIsSaved] = useState(false);

  const profileInfo = getMockProfileInfo();
  const isOwnPost = user?.id === post.user_id;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleLike = () => {
    if (!user) return;
    
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    toggleLike.mutate({ postId: post.id, isLiked });
  };

  const handleDelete = () => {
    deletePost.mutate(post.id);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post.caption || "Check out this post",
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleChat = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate(`/messages?user=${post.user_id}`);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  return (
    <Card className="overflow-hidden bg-card border-border/50 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link to={`/profile/${post.user_id}`} className="flex items-center gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-primary/20">
            <AvatarImage src={post.profile.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold">
              {post.profile.full_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-foreground">{post.profile.full_name}</p>
              <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
            </div>
            <p className="text-sm text-muted-foreground">@{post.profile.username}</p>
          </div>
        </Link>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: false, locale: id })}
          </span>
          {isOwnPost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-muted">
        <img
          src={post.image_url}
          alt={post.caption || "Post image"}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Actions */}
      <div className="px-4 pt-3 flex items-center gap-1">
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
            <Heart className={`h-6 w-6 ${isLiked ? "fill-primary text-primary" : ""}`} />
          </motion.div>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}>
          <MessageCircle className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share2 className="h-6 w-6" />
        </Button>
      </div>

      {/* Likes & Caption */}
      <div className="px-4 pb-2">
        <p className="font-semibold text-sm mb-1">{likesCount} suka</p>
        {post.caption && (
          <p className="text-sm">
            <span className="font-semibold">{post.profile.username}</span>{" "}
            {post.caption}
          </p>
        )}
        
        {/* Comments preview */}
        {post.comments_count > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="text-muted-foreground text-sm mt-1"
          >
            Lihat semua {post.comments_count} komentar
          </button>
        )}
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="px-4 pb-4">
          <PostComments postId={post.id} />
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-border mx-4" />

      {/* Profile Info Section */}
      <div className="p-4 space-y-3 bg-muted/30">
        {/* Name & Info */}
        <div>
          <h3 className="text-lg font-bold text-foreground">{post.profile.full_name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              Jakarta
            </span>
            <span>•</span>
            <span>{profileInfo.age} tahun</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {profileInfo.availability}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="text-primary font-bold text-lg">
          {formatPrice(profileInfo.hourlyRate)}/jam
        </div>

        {/* Bio */}
        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1">Tentang Aku</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {profileInfo.bio}
          </p>
        </div>

        {/* Personality */}
        <div>
          <h4 className="font-semibold text-foreground text-sm mb-2">Kepribadian</h4>
          <div className="flex flex-wrap gap-2">
            {profileInfo.personality.map((trait) => (
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

        {/* Action Buttons - Only show for other users' posts */}
        {!isOwnPost && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleChat}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Chat Sekarang
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
        )}
      </div>
    </Card>
  );
}
