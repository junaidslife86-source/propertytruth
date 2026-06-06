"use client";

import type { StrataSummary } from "@/lib/strata/schemas";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface SectionCoverageProps {
  coverage: StrataSummary["sectionCoverage"];
  detectedSections: StrataSummary["detectedSections"];
}

export function StrataSectionCoverage({
  coverage,
  detectedSections,
}: SectionCoverageProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-stone-900">Detected in this file</h3>
      <ul className="grid gap-2 sm:grid-cols-2">
        {coverage.map((item) => (
          <li key={item.type} className="flex items-center gap-2 text-sm">
            {item.detected ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
            )}
            <span className={item.detected ? "text-stone-700" : "text-stone-500"}>
              {item.type}
            </span>
          </li>
        ))}
      </ul>
      {detectedSections.length > 0 && (
        <div className="border-t border-stone-100 pt-3">
          <p className="text-xs font-medium uppercase text-stone-400">
            Analysed sections
          </p>
          <ul className="mt-2 space-y-1 text-sm text-stone-600">
            {detectedSections.map((s) => (
              <li key={`${s.label}-${s.pageRange}`}>
                {s.label} · {s.pageRange}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
