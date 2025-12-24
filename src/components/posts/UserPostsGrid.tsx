import { usePosts } from "@/hooks/usePosts";
import { Skeleton } from "@/components/ui/skeleton";
import { Grid3X3, ImageOff } from "lucide-react";
import { Link } from "react-router-dom";

export function UserPostsGrid() {
  const { userPosts, isLoadingUserPosts } = usePosts();

  if (isLoadingUserPosts) {
    return (
      <div className="grid grid-cols-3 gap-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    );
  }

  if (!userPosts || userPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageOff className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Belum ada postingan</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-center gap-2 py-4 border-t border-border">
        <Grid3X3 className="h-4 w-4" />
        <span className="text-sm font-semibold">POSTINGAN</span>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {userPosts.map((post) => (
          <Link key={post.id} to="/" className="relative aspect-square group">
            <img
              src={post.image_url}
              alt={post.caption || "Post"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium">Lihat</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
