import { Skeleton } from "@/components/ui/skeleton";

interface CardSkeletonProps {
  count?: number;
  height?: string;
}

export function CardSkeleton({ count = 4, height = "h-28" }: CardSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`${height} w-full rounded-2xl sm:rounded-3xl`} />
      ))}
    </div>
  );
}
