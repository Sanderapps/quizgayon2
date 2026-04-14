import { cn } from "@/lib/utils";

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="h-8 rounded-xl shimmer dark:bg-purple-500/5 bg-gray-200" />
      <div className="h-32 rounded-xl shimmer dark:bg-purple-500/5 bg-gray-200" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 rounded-xl shimmer dark:bg-purple-500/5 bg-gray-200" />
        <div className="h-20 rounded-xl shimmer dark:bg-purple-500/5 bg-gray-200" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="dark:bg-[#0e0e1a]/80 bg-white/80 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md dark:border border-purple-500/10 border-gray-200">
      <LoadingSkeleton />
    </div>
  );
}
