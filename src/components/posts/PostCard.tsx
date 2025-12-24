import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Post, usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import { PostComments } from "./PostComments";
import { Link } from "react-router-dom";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { toggleLike, deletePost } = usePosts();
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);

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
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Card className="overflow-hidden bg-card border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link to={`/profile/${post.user_id}`} className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.profile.avatar_url || undefined} />
            <AvatarFallback>{post.profile.full_name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{post.profile.full_name}</p>
            <p className="text-sm text-muted-foreground">@{post.profile.username}</p>
          </div>
        </Link>
        
        {user?.id === post.user_id && (
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

      {/* Image */}
      <div className="relative aspect-square">
        <img
          src={post.image_url}
          alt={post.caption || "Post image"}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className="flex items-center gap-1"
          >
            <Heart
              className={`h-6 w-6 transition-colors ${
                isLiked ? "fill-red-500 text-red-500" : "text-foreground"
              }`}
            />
          </motion.button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1"
          >
            <MessageCircle className="h-6 w-6 text-foreground" />
          </button>
          
          <button onClick={handleShare}>
            <Share2 className="h-6 w-6 text-foreground" />
          </button>
        </div>

        {/* Likes count */}
        <p className="font-semibold text-foreground">
          {likesCount} suka
        </p>

        {/* Caption */}
        {post.caption && (
          <p className="text-foreground">
            <span className="font-semibold">{post.profile.username}</span>{" "}
            {post.caption}
          </p>
        )}

        {/* Comments preview */}
        {post.comments_count > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="text-muted-foreground text-sm"
          >
            Lihat semua {post.comments_count} komentar
          </button>
        )}

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground uppercase">
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: id })}
        </p>

        {/* Comments section */}
        {showComments && <PostComments postId={post.id} />}
      </div>
    </Card>
  );
}
