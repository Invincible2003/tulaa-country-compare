import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface SkeletonCardProps {
  index: number;
}

export const SkeletonCard = ({ index }: SkeletonCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="rounded-2xl border border-border bg-gradient-card p-5 shadow-md"
    >
      {/* Flag skeleton */}
      <Skeleton className="mb-4 h-40 w-full rounded-xl" />
      
      {/* Title */}
      <Skeleton className="mb-2 h-6 w-3/4" />
      <Skeleton className="mb-4 h-4 w-1/2" />
      
      {/* Grid items */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton className="mb-1 h-3 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div>
          <Skeleton className="mb-1 h-3 w-16" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <Skeleton className="mb-1 h-3 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div>
          <Skeleton className="mb-1 h-3 w-12" />
          <Skeleton className="h-6 w-28" />
        </div>
      </div>
      
      <div className="mt-4 space-y-4">
        <div>
          <Skeleton className="mb-1 h-3 w-16" />
          <Skeleton className="h-5 w-full" />
        </div>
        <div>
          <Skeleton className="mb-1 h-3 w-20" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <div>
          <Skeleton className="mb-1 h-3 w-18" />
          <Skeleton className="h-5 w-2/3" />
        </div>
      </div>
      
      {/* Button */}
      <Skeleton className="mt-4 h-10 w-full rounded-lg" />
    </motion.div>
  );
};
