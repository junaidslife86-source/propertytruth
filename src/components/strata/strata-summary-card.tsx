"use client";

import type { StrataSummary } from "@/lib/strata/schemas";
import { CONFIDENCE_LABELS } from "@/lib/strata/schemas";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StrataSummaryCardProps {
  summary: StrataSummary;
}

const labelTone: Record<StrataSummary["confidenceLabel"], string> = {
  strong: "text-emerald-700",
  mostly_clear: "text-emerald-700",
  proceed_with_caution: "text-amber-700",
  high_concern: "text-red-700",
  incomplete_review: "text-stone-600",
};

export function StrataSummaryCard({ summary }: StrataSummaryCardProps) {
  return (
    <Card className="overflow-hidden border-stone-200/80">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
              Strata review confidence
            </p>
            <p className="mt-1 text-4xl font-semibold tabular-nums text-stone-900">
              {summary.confidenceScore}
              <span className="text-lg text-stone-400">/100</span>
            </p>
            <p
              className={cn(
                "mt-1 text-sm font-medium capitalize",
                labelTone[summary.confidenceLabel],
              )}
            >
              {CONFIDENCE_LABELS[summary.confidenceLabel]}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-600">
          {summary.headline}
        </p>

        {summary.topRisks.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase text-stone-400">
              Top risks
            </p>
            <ul className="mt-2 space-y-1 text-sm text-stone-700">
              {summary.topRisks.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          </div>
        )}

        {summary.missingOrUnknown.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/50 p-3">
            <p className="text-xs font-medium uppercase text-amber-800">
              Could not verify / missing
            </p>
            <ul className="mt-2 space-y-1 text-sm text-amber-900/80">
              {summary.missingOrUnknown.slice(0, 5).map((m) => (
                <li key={m}>• {m}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
