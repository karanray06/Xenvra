import { Skeleton } from "@/components/ui/skeleton";

export default function StudioLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-surface-secondary animate-fade-in">
      {/* Studio Toolbar skeleton */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-surface px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-6 w-36 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      {/* Studio Workspace skeleton */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side Panel */}
        <div className="w-72 border-r border-border bg-surface p-4 space-y-4 hidden md:block">
          <div className="flex gap-2">
            <Skeleton className="h-8 flex-1 rounded-md" />
            <Skeleton className="h-8 flex-1 rounded-md" />
            <Skeleton className="h-8 flex-1 rounded-md" />
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>

        {/* Center Canvas Area */}
        <div className="flex flex-1 items-center justify-center p-8 bg-[#E6EEF4]/30">
          <div className="h-[750px] w-[530px] rounded-lg border border-border/80 bg-white shadow-md p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="pt-6 space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/6" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-16 w-full rounded-md" />
            </div>
          </div>
        </div>

        {/* Right Properties Panel */}
        <div className="w-64 border-l border-border bg-surface p-4 space-y-4 hidden lg:block">
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
