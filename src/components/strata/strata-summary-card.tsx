"use client";

import type { StrataSummary } from "@/lib/strata/schemas";
import { CONFIDENCE_LABELS } from "@/lib/strata/schemas";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StrataSummaryCardProps {
  summary: StrataSummary;
}

const labelTone: Record<StrataSummary["confidenceLabel"], string> = {
  strong: "text-evidence-positive",
  mostly_clear: "text-evidence-positive",
  proceed_with_caution: "text-evidence-verify",
  high_concern: "text-evidence-issue",
  incomplete_review: "text-evidence-missing",
};

export function StrataSummaryCard({ summary }: StrataSummaryCardProps) {
  return (
    <Card className="overflow-hidden border-outline-variant/30">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-label-caps text-on-surface-variant">
              Strata scan coverage
            </p>
            <p className="mt-1 font-[family-name:var(--font-manrope)] text-4xl font-bold tabular-nums">
              {summary.confidenceScore}%
            </p>
            <p
              className={cn(
                "mt-1 text-sm font-medium",
                labelTone[summary.confidenceLabel],
              )}
            >
              {CONFIDENCE_LABELS[summary.confidenceLabel]}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
          {summary.headline}
        </p>

        {summary.topRisks.length > 0 && (
          <div className="mt-4">
            <p className="font-label-caps text-on-surface-variant">
              Known issues in processed pages
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {summary.topRisks.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          </div>
        )}

        {summary.missingOrUnknown.length > 0 && (
          <div className="mt-4 rounded-xl border border-evidence-verify/20 bg-evidence-verify/5 p-3">
            <p className="font-label-caps text-evidence-verify">
              Could not verify
            </p>
            <ul className="mt-2 space-y-1 text-sm text-on-surface-variant">
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
