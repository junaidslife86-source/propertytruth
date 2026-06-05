"use client";

import type { Development } from "@/lib/schemas";
import { DevelopmentCard } from "@/components/development-card";
import { DevelopmentCardSkeleton } from "@/components/skeleton-loaders";

interface DevelopmentFeedProps {
  developments: Development[];
  loading?: boolean;
}

export function DevelopmentFeed({ developments, loading }: DevelopmentFeedProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <DevelopmentCardSkeleton />
        <DevelopmentCardSkeleton />
      </div>
    );
  }

  if (!developments.length) {
    return (
      <p className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-8 text-center text-sm text-stone-500">
        No development applications were found in this area with our current dataset.
        This doesn&apos;t mean nothing will change — try a wider radius when more data is loaded.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {developments.map((d) => (
        <DevelopmentCard key={d.id} development={d} />
      ))}
    </div>
  );
}
