"use client";

import { useMemo, useState } from "react";
import type { BuyerRiskSignal, RiskCategory } from "@/lib/schemas";
import { BuyerRiskSignalCard } from "@/components/buyer-risk-signal-card";
import { cn } from "@/lib/utils";

type FilterId =
  | "all"
  | "critical"
  | "planning"
  | "environmental"
  | "strata"
  | "inspection"
  | "finance";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "critical", label: "High severity" },
  { id: "planning", label: "Planning" },
  { id: "environmental", label: "Environmental" },
  { id: "strata", label: "Strata" },
  { id: "inspection", label: "Inspection" },
  { id: "finance", label: "Finance" },
];

const ENV_CATEGORIES: RiskCategory[] = ["flood", "bushfire", "noise"];

const SEVERITY_ORDER: Record<string, number> = {
  high: 0,
  medium: 1,
  unknown: 2,
  low: 3,
};

const CATEGORY_LABELS: Partial<Record<RiskCategory, string>> = {
  planning: "Planning & development",
  flood: "Flood",
  bushfire: "Bushfire",
  noise: "Noise",
  strata: "Strata",
  inspection: "Inspection",
  ownership_cost: "Ownership cost",
};

function matchesFilter(signal: BuyerRiskSignal, filter: FilterId): boolean {
  switch (filter) {
    case "all":
      return true;
    case "critical":
      return signal.severity === "high";
    case "planning":
      return signal.category === "planning";
    case "environmental":
      return ENV_CATEGORIES.includes(signal.category);
    case "strata":
      return signal.category === "strata";
    case "inspection":
      return signal.category === "inspection";
    case "finance":
      return signal.category === "ownership_cost";
    default:
      return true;
  }
}

interface RiskSignalGridProps {
  signals: BuyerRiskSignal[];
}

export function RiskSignalGrid({ signals }: RiskSignalGridProps) {
  const [filter, setFilter] = useState<FilterId>("all");

  const filtered = useMemo(
    () =>
      [...signals]
        .filter((s) => matchesFilter(s, filter))
        .sort(
          (a, b) =>
            (SEVERITY_ORDER[a.severity] ?? 9) -
            (SEVERITY_ORDER[b.severity] ?? 9),
        ),
    [signals, filter],
  );

  const grouped = useMemo(() => {
    const map = new Map<RiskCategory, BuyerRiskSignal[]>();
    for (const signal of filtered) {
      const list = map.get(signal.category) ?? [];
      list.push(signal);
      map.set(signal.category, list);
    }
    return [...map.entries()].sort(
      (a, b) =>
        Math.min(...a[1].map((s) => SEVERITY_ORDER[s.severity] ?? 9)) -
        Math.min(...b[1].map((s) => SEVERITY_ORDER[s.severity] ?? 9)),
    );
  }, [filtered]);

  return (
    <section aria-labelledby="risk-signals-heading">
      <div className="mb-4 space-y-3">
        <div>
          <h2
            id="risk-signals-heading"
            className="text-lg font-semibold text-stone-900"
          >
            Risk signals
          </h2>
          <p className="text-sm text-stone-500">
            Based on available public data — not a substitute for professional
            advice.
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                filter === f.id
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-200 px-6 py-12 text-center text-sm text-stone-500">
          No signals match this filter. Try &ldquo;All&rdquo; to see every
          finding.
        </p>
      ) : (
        <div className="space-y-8">
          {grouped.map(([category, categorySignals]) => (
            <div key={category}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
                {CATEGORY_LABELS[category] ?? category}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {categorySignals.map((signal, i) => (
                  <BuyerRiskSignalCard
                    key={signal.id}
                    signal={signal}
                    index={i}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
