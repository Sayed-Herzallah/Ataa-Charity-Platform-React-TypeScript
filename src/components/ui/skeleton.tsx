import { cn } from "../../lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-neutral-200/50 dark:bg-neutral-800/60", className)}
      {...props}
    />
  );
}

// 1. Stats Metrics Skeleton
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 rounded-2xl border border-neutral-100/50 dark:border-neutral-800/40 bg-white/40 dark:bg-neutral-900/30 backdrop-blur-md flex flex-col gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

// 2. Table Loader Skeleton
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full flex flex-col gap-4 p-4">
      <div className="flex gap-4 border-b border-neutral-100/80 dark:border-neutral-800/50 pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-3 items-center border-b border-neutral-100/30 dark:border-neutral-800/10 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// 3. Card Grid Skeleton
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-2xl border border-neutral-100/50 dark:border-neutral-800/40 bg-white/40 dark:bg-neutral-900/30 backdrop-blur-md flex flex-col gap-4">
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 4. Chat Bubble Skeleton
export function ChatSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6 py-4">
      <div className="flex gap-3 justify-end items-start max-w-[80%] ml-auto">
        <div className="flex flex-col gap-2 items-end">
          <Skeleton className="h-12 w-64 rounded-2xl rounded-tr-sm bg-teal-500/10 dark:bg-teal-500/5" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-9 w-9 rounded-xl flex-shrink-0" />
      </div>
      <div className="flex gap-3 justify-start items-start max-w-[80%]">
        <Skeleton className="h-9 w-9 rounded-xl flex-shrink-0" />
        <div className="flex flex-col gap-2 items-start w-full">
          <Skeleton className="h-20 w-80 rounded-2xl rounded-tl-sm" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export { Skeleton };
