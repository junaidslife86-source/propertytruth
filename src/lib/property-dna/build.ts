import type { PropertyScanResult } from "@/lib/schemas";
import type { BuyerRiskSignal } from "@/lib/schemas";

export interface DnaCategory {
  id: string;
  label: string;
  status: "strong" | "caution" | "concern" | "incomplete";
  score: number;
  signals: string[];
  missingCount: number;
}

const CATEGORY_MAP: Record<string, string[]> = {
  planning: ["planning"],
  environmental: ["flood", "bushfire", "noise"],
  building: ["inspection", "strata"],
  financial: ["ownership_cost"],
  future: ["planning"],
};

export function buildPropertyDna(scan: PropertyScanResult): DnaCategory[] {
  const signals = scan.buyerRiskSignals;

  return [
    buildCategory("planning", "Planning DNA", signals, ["planning"]),
    buildCategory("environmental", "Environmental DNA", signals, [
      "flood",
      "bushfire",
      "noise",
    ]),
    buildCategory("building", "Building DNA", signals, ["inspection", "strata"]),
    buildCategory("financial", "Financial DNA", signals, ["ownership_cost"]),
    buildCategory(
      "future",
      "Future Change DNA",
      signals,
      ["planning"],
      scan.developments.length,
    ),
    buildCategory("lifestyle", "Lifestyle DNA", signals, [], 0, true),
  ];
}

function buildCategory(
  id: string,
  label: string,
  signals: BuyerRiskSignal[],
  categories: string[],
  extraMetric = 0,
  mockPositive = false,
): DnaCategory {
  const relevant = signals.filter((s) => categories.includes(s.category));
  const unknowns = relevant.filter((s) => s.severity === "unknown").length;
  const highs = relevant.filter((s) => s.severity === "high").length;
  const mediums = relevant.filter((s) => s.severity === "medium").length;

  let score = 75 - highs * 20 - mediums * 8 - unknowns * 5;
  if (mockPositive && relevant.length === 0) score = 70;
  if (extraMetric >= 3) score -= 10;
  score = Math.max(10, Math.min(95, score));

  let status: DnaCategory["status"] = "strong";
  if (unknowns >= 2) status = "incomplete";
  else if (highs > 0) status = "concern";
  else if (mediums > 0 || unknowns > 0) status = "caution";

  const topSignals = relevant
    .sort((a, b) => {
      const r = { high: 0, medium: 1, low: 2, unknown: 3 };
      return r[a.severity] - r[b.severity];
    })
    .slice(0, 3)
    .map((s) => s.title);

  if (mockPositive && !topSignals.length) {
    topSignals.push("Walk the neighbourhood at different times");
    topSignals.push("Check commute and local amenities");
  }

  return {
    id,
    label,
    status,
    score,
    signals: topSignals,
    missingCount: unknowns,
  };
}
