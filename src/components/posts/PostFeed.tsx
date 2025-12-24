import { usePosts } from "@/hooks/usePosts";
import { PostCard } from "./PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOff, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function PostFeed() {
  const { feedPosts, isLoadingFeed } = usePosts();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-12">
        <UserPlus className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Login untuk melihat feed</h3>
        <p className="text-muted-foreground mb-4">
          Login dan follow orang untuk melihat postingan mereka di feed
        </p>
        <Button asChild>
          <Link to="/auth">Login</Link>
        </Button>
      </div>
    );
  }

  if (isLoadingFeed) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card rounded-lg overflow-hidden border border-border/50">
            <div className="flex items-center gap-3 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="aspect-square w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!feedPosts || feedPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageOff className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Feed kosong</h3>
        <p className="text-muted-foreground mb-4">
          Follow orang lain atau buat postingan pertamamu!
        </p>
        <Button asChild variant="outline">
          <Link to="/find-friends">Cari Teman</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {feedPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
