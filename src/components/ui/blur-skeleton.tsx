import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BlurSkeletonProps {
  className?: string;
  variant?: "page" | "card" | "profile" | "feed";
}

/**
 * Blurred skeleton that mimics page structure during lazy loading
 */
export function BlurSkeleton({ className, variant = "page" }: BlurSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("relative", className)}
    >
      {variant === "page" && <PageSkeleton />}
      {variant === "card" && <CardSkeleton />}
      {variant === "profile" && <ProfileSkeleton />}
      {variant === "feed" && <FeedSkeleton />}
      
      {/* Shimmer overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ translateX: ["−100%", "100%"] }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "linear",
          }}
        />
      </div>
    </motion.div>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 blur-sm opacity-60">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-32 bg-muted rounded-lg" />
        <div className="flex gap-3">
          <div className="h-8 w-20 bg-muted rounded-lg" />
          <div className="h-8 w-8 bg-muted rounded-full" />
        </div>
      </div>
      
      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border/30">
            <div className="aspect-square bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-muted rounded-full" />
                <div className="h-6 w-16 bg-muted rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border/30 blur-sm opacity-60">
      <div className="aspect-square bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="p-6 blur-sm opacity-60">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-28 h-28 rounded-full bg-muted mb-4" />
        <div className="h-6 w-32 bg-muted rounded mb-2" />
        <div className="h-4 w-24 bg-muted rounded" />
      </div>
      
      {/* Stats */}
      <div className="flex justify-center gap-8 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <div className="h-6 w-12 bg-muted rounded mb-1 mx-auto" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
      
      {/* Bio */}
      <div className="space-y-2 max-w-sm mx-auto">
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded" />
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="p-4 space-y-6 blur-sm opacity-60">
      {/* Tabs */}
      <div className="flex justify-center gap-4 border-b border-border pb-3">
        <div className="h-8 w-20 bg-muted rounded-lg" />
        <div className="h-8 w-20 bg-muted rounded-lg" />
      </div>
      
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border/30">
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-24 bg-muted rounded" />
                <div className="h-2.5 w-16 bg-muted rounded" />
              </div>
            </div>
            <div className="aspect-square bg-muted" />
            <div className="p-4 space-y-3">
              <div className="flex gap-3">
                <div className="h-6 w-6 bg-muted rounded" />
                <div className="h-6 w-6 bg-muted rounded" />
                <div className="h-6 w-6 bg-muted rounded" />
              </div>
              <div className="h-3 w-20 bg-muted rounded" />
              <div className="h-3 w-full bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
