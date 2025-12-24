import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ExploreSkeletonCard() {
  return (
    <Card className="overflow-hidden bg-card border-border/50">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 p-4">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* Image skeleton */}
      <Skeleton className="aspect-square w-full" />

      {/* Actions skeleton */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </Card>
  );
}
