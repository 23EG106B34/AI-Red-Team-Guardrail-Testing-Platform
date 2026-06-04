import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-96 md:col-span-2" />
        <Skeleton className="h-96" />
      </div>
    </main>
  );
}
