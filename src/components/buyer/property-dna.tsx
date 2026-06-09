"use client";

import { useState } from "react";
import type { DnaStrand } from "@/lib/property-dna/build";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface PropertyDnaProps {
  categories: DnaStrand[];
}

function CompletenessBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-on-surface-variant">
        <span>{label}</span>
        <span className="tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-high">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function PropertyDna({ categories }: PropertyDnaProps) {
  const [expanded, setExpanded] = useState<string | null>(categories[0]?.id ?? null);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Property DNA</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          How complete your understanding is — not a quality score. Known / unknown /
          verify.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((strand) => {
          const open = expanded === strand.id;
          return (
            <Card
              key={strand.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setExpanded(open ? null : strand.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-foreground">{strand.label}</p>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-on-surface-variant transition-transform",
                      open && "rotate-180",
                    )}
                  />
                </div>
                <div className="mt-3 space-y-2">
                  <CompletenessBar
                    label="Known"
                    value={strand.known}
                    color="bg-evidence-known"
                  />
                  <CompletenessBar
                    label="Unknown"
                    value={strand.unknown}
                    color="bg-evidence-missing"
                  />
                  <CompletenessBar
                    label="Verify"
                    value={strand.verify}
                    color="bg-evidence-verify"
                  />
                </div>
                {open && strand.signals.length > 0 && (
                  <ul className="mt-3 space-y-1 border-t border-outline-variant/20 pt-3 text-xs text-on-surface-variant">
                    {strand.signals.map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
