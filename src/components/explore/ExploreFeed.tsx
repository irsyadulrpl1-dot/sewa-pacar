import { useEffect, useRef, useCallback } from "react";
import { useExplore } from "@/hooks/useExplore";
import { ExplorePostCard } from "./ExplorePostCard";
import { ExploreFilters } from "./ExploreFilters";
import { ExploreSkeletonCard } from "./ExploreSkeletonCard";
import { Compass, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function ExploreFeed() {
  const {
    posts,
    isLoading,
    isFetching,
    filter,
    changeFilter,
    loadMore,
    hasMore,
    recordView,
    toggleLike,
    toggleSave,
    refetch,
  } = useExplore();

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMore, isLoading, isFetching, loadMore]);

  const handleView = useCallback((postId: string) => {
    recordView(postId);
  }, [recordView]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <ExploreFilters activeFilter={filter} onFilterChange={changeFilter} />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <ExploreSkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <ExploreFilters activeFilter={filter} onFilterChange={changeFilter} />

      {/* Refresh button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-1.5 text-muted-foreground hover:text-primary"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Compass className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Belum ada postingan
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Coba filter lain atau kembali nanti untuk melihat konten baru dari pengguna lain.
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <ExplorePostCard
                  post={post}
                  onLike={toggleLike}
                  onSave={toggleSave}
                  onView={handleView}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-8">
          {isFetching && (
            <div className="space-y-6">
              <ExploreSkeletonCard />
              <ExploreSkeletonCard />
            </div>
          )}
        </div>
      )}

      {/* End of feed */}
      {!hasMore && posts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <p className="text-sm text-muted-foreground">
            Kamu sudah melihat semua postingan 🎉
          </p>
        </motion.div>
      )}
    </div>
  );
}
