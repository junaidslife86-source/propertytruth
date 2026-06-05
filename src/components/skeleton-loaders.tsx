import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function ReportPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <Skeleton className="h-48 w-full" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-96 w-full" />
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    </div>
  );
}

export function DevelopmentCardSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="mb-3 h-4 w-1/3" />
      <Skeleton className="mb-2 h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
    </Card>
  );
}

export function MapSkeleton() {
  return <Skeleton className="h-[420px] w-full rounded-2xl" />;
}
