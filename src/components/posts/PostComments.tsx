import { useState } from "react";
import { Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePostComments } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface PostCommentsProps {
  postId: string;
}

export function PostComments({ postId }: PostCommentsProps) {
  const { user } = useAuth();
  const { comments, isLoading, addComment } = usePostComments(postId);
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    addComment.mutate(newComment);
    setNewComment("");
  };

  if (isLoading) {
    return (
      <div className="space-y-3 pt-3 border-t border-border">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-3 border-t border-border">
      {/* Comments list */}
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {comments?.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.profile.avatar_url || undefined} />
              <AvatarFallback>{comment.profile.full_name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm text-foreground">
                <span className="font-semibold">{comment.profile.username}</span>{" "}
                {comment.content}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: id })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add comment form */}
      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tambahkan komentar..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newComment.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  );
}
