import { Skeleton } from "@/components/ui/skeleton";

export default function RootStudioLoading() {
  return (
    <div className="flex h-screen flex-col bg-surface-secondary animate-fade-in">
      <div className="flex h-14 items-center justify-between border-b border-border bg-surface px-4">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-8 w-40 rounded-lg" />
      </div>
      <div className="flex flex-1 items-center justify-center p-8 bg-[#E6EEF4]/30">
        <div className="h-[750px] w-[530px] rounded-lg border border-border/80 bg-white shadow-md p-8" />
      </div>
    </div>
  );
}
