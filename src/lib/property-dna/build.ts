import type { PropertyScanResult, BuyerRiskSignal } from "@/lib/schemas";

export interface DnaStrand {
  id: string;
  label: string;
  known: number;
  unknown: number;
  verify: number;
  signals: string[];
}

const STRANDS: { id: string; label: string; categories: string[] }[] = [
  { id: "location", label: "Location change", categories: ["planning"] },
  {
    id: "building",
    label: "Building condition",
    categories: ["inspection", "strata"],
  },
  { id: "strata", label: "Strata health", categories: ["strata"] },
  { id: "cost", label: "Ownership cost", categories: ["ownership_cost"] },
  { id: "offer", label: "Offer readiness", categories: ["planning", "flood", "bushfire"] },
];

export function buildPropertyDna(scan: PropertyScanResult): DnaStrand[] {
  const signals = scan.buyerRiskSignals;

  return STRANDS.map((strand) => {
    const relevant = signals.filter((s) => strand.categories.includes(s.category));
    const { known, unknown, verify } = completenessFromSignals(
      relevant,
      strand.id === "location" ? scan.developments.length : 0,
    );
    const topSignals = relevant
      .sort((a, b) => severityRank(a) - severityRank(b))
      .slice(0, 3)
      .map((s) => s.title);

    if (strand.id === "offer" && topSignals.length === 0) {
      topSignals.push("Complete checklist items to improve readiness");
    }

    return {
      id: strand.id,
      label: strand.label,
      known,
      unknown,
      verify,
      signals: topSignals,
    };
  });
}

function severityRank(s: BuyerRiskSignal): number {
  const r = { high: 0, medium: 1, low: 2, unknown: 3 };
  return r[s.severity];
}

function completenessFromSignals(
  relevant: BuyerRiskSignal[],
  extraActivity: number,
): { known: number; unknown: number; verify: number } {
  if (relevant.length === 0 && extraActivity === 0) {
    return { known: 15, unknown: 70, verify: 15 };
  }

  const known = relevant.filter((s) => s.severity === "low").length;
  const verify = relevant.filter(
    (s) => s.severity === "medium" || s.severity === "high",
  ).length;
  const unknown = relevant.filter((s) => s.severity === "unknown").length;
  const total = Math.max(known + verify + unknown + (extraActivity > 0 ? 1 : 0), 1);

  const knownPct = Math.round(((known + (extraActivity > 0 ? 1 : 0)) / (total + 1)) * 100);
  const verifyPct = Math.round((verify / (total + 1)) * 100);
  const unknownPct = Math.max(0, 100 - knownPct - verifyPct);

  return {
    known: Math.min(knownPct, 100),
    unknown: Math.min(unknownPct, 100),
    verify: Math.min(verifyPct, 100),
  };
}
