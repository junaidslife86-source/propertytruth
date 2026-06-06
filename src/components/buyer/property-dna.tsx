"use client";

import { useState } from "react";
import type { DnaCategory } from "@/lib/property-dna/build";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface PropertyDnaProps {
  categories: DnaCategory[];
}

const statusStyles = {
  strong: "border-emerald-200 bg-emerald-50/50",
  caution: "border-amber-200 bg-amber-50/50",
  concern: "border-orange-200 bg-orange-50/50",
  incomplete: "border-stone-200 bg-stone-50",
};

export function PropertyDna({ categories }: PropertyDnaProps) {
  const [expanded, setExpanded] = useState<string | null>(categories[0]?.id ?? null);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((cat) => {
        const open = expanded === cat.id;
        return (
          <Card
            key={cat.id}
            className={cn("cursor-pointer transition-shadow hover:shadow-md", statusStyles[cat.status])}
            onClick={() => setExpanded(open ? null : cat.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    {cat.label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-stone-900">
                    {cat.score}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-stone-400 transition-transform",
                    open && "rotate-180",
                  )}
                />
              </div>
              {open && (
                <ul className="mt-3 space-y-1 border-t border-stone-200/60 pt-3 text-xs text-stone-600">
                  {cat.signals.map((s) => (
                    <li key={s}>• {s}</li>
                  ))}
                  {cat.missingCount > 0 && (
                    <li className="text-stone-400">
                      {cat.missingCount} missing data point(s)
                    </li>
                  )}
                </ul>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
