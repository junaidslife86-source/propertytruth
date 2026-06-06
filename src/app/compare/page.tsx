"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, GitCompareArrows, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PropertyComparisonTable } from "@/components/property-comparison-table";
import {
  MAX_COMPARE_PROPERTIES,
  useCompareStore,
} from "@/stores/compare-store";

export default function ComparePage() {
  const properties = useCompareStore((s) => s.properties);
  const removeProperty = useCompareStore((s) => s.removeProperty);
  const clearAll = useCompareStore((s) => s.clearAll);
  const hasHydrated = useCompareStore((s) => s._hasHydrated);
  const setHasHydrated = useCompareStore((s) => s.setHasHydrated);

  useEffect(() => {
    setHasHydrated(true);
  }, [setHasHydrated]);

  if (!hasHydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="h-64 animate-pulse rounded-2xl bg-stone-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"
        >
          <ArrowLeft className="h-4 w-4" />
          New search
        </Link>
        {properties.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="h-5 w-5 text-stone-500" />
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            Compare properties
          </h1>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-stone-500">
          Side-by-side buyer risk snapshot for up to {MAX_COMPARE_PROPERTIES}{" "}
          scanned properties. Based on available public data.
        </p>
      </div>

      {properties.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <div className="rounded-2xl bg-stone-100 p-4">
              <Search className="h-8 w-8 text-stone-400" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-stone-900">
                Scan a property to start comparing buyer risks.
              </p>
              <p className="max-w-md text-sm text-stone-500">
                Open a property report and tap &ldquo;Add to compare&rdquo; to
                build your shortlist — no login required.
              </p>
            </div>
            <Button asChild>
              <Link href="/">Search an address</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <PropertyComparisonTable
          properties={properties}
          onRemove={removeProperty}
        />
      )}
    </div>
  );
}
