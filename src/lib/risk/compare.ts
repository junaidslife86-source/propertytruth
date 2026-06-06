import type { PropertyScanResult, RiskCategory, RiskSeverity } from "@/lib/schemas";

const SEVERITY_RANK: Record<RiskSeverity, number> = {
  high: 3,
  medium: 2,
  low: 1,
  unknown: 0,
};

export function getCategorySeverity(
  scan: PropertyScanResult,
  category: RiskCategory,
): RiskSeverity {
  const signals = scan.buyerRiskSignals.filter((s) => s.category === category);
  if (!signals.length) return "unknown";

  return signals.reduce<RiskSeverity>((worst, signal) => {
    return SEVERITY_RANK[signal.severity] > SEVERITY_RANK[worst]
      ? signal.severity
      : worst;
  }, "unknown");
}

export function getDaImpactSeverity(scan: PropertyScanResult): RiskSeverity {
  const tallDa = scan.developments.find((d) => (d.storeys ?? 0) >= 10);
  if (tallDa) return "high";

  const active = scan.developments.filter(
    (d) =>
      d.status?.toLowerCase().includes("assessment") ||
      d.status?.toLowerCase().includes("lodged"),
  );

  if (active.length >= 2 || scan.developments.length >= 3) return "medium";
  if (scan.developments.length >= 1) return "low";
  return "unknown";
}

export function getInfrastructureImpactSeverity(
  scan: PropertyScanResult,
): RiskSeverity {
  const transport = scan.infrastructure.filter((i) =>
    /transport|metro|rail|road/i.test(i.type),
  );

  if (transport.length >= 2) return "high";
  if (transport.length === 1) return "medium";
  if (scan.infrastructure.length > 0) return "low";
  return "unknown";
}

export function getUnknownDataCount(scan: PropertyScanResult): number {
  return scan.buyerRiskSignals.filter((s) => s.severity === "unknown").length;
}

export function getHighSeverityCount(scan: PropertyScanResult): number {
  return scan.buyerRiskSignals.filter((s) => s.severity === "high").length;
}

export function getFutureChangeRiskRank(scan: PropertyScanResult): number {
  const planning = SEVERITY_RANK[getCategorySeverity(scan, "planning")];
  const da = SEVERITY_RANK[getDaImpactSeverity(scan)];
  const infra = SEVERITY_RANK[getInfrastructureImpactSeverity(scan)];
  return planning * 3 + da * 2 + infra;
}

export function findBestForCautiousBuyer(
  scans: PropertyScanResult[],
): PropertyScanResult | null {
  if (!scans.length) return null;

  return [...scans].sort((a, b) => {
    const scoreDiff = b.confidenceScore.score - a.confidenceScore.score;
    if (scoreDiff !== 0) return scoreDiff;
    return getHighSeverityCount(a) - getHighSeverityCount(b);
  })[0];
}

export function findMostIncompleteData(
  scans: PropertyScanResult[],
): PropertyScanResult | null {
  if (!scans.length) return null;

  return [...scans].sort(
    (a, b) => getUnknownDataCount(b) - getUnknownDataCount(a),
  )[0];
}

export function findHighestFutureChangeRisk(
  scans: PropertyScanResult[],
): PropertyScanResult | null {
  if (!scans.length) return null;

  return [...scans].sort(
    (a, b) => getFutureChangeRiskRank(b) - getFutureChangeRiskRank(a),
  )[0];
}

export function findBestToInspectNext(
  scans: PropertyScanResult[],
  inspectedAddresses: Set<string>,
): PropertyScanResult | null {
  const candidates = scans.filter(
    (s) => !inspectedAddresses.has(s.formattedAddress),
  );
  if (!candidates.length) return findBestForCautiousBuyer(scans);

  return [...candidates].sort((a, b) => {
    const scoreDiff = b.confidenceScore.score - a.confidenceScore.score;
    if (scoreDiff !== 0) return scoreDiff;
    return getUnknownDataCount(a) - getUnknownDataCount(b);
  })[0];
}

export type ComparisonRow =
  | "confidence"
  | "planning"
  | "flood"
  | "bushfire"
  | "noise"
  | "strata"
  | "da"
  | "infrastructure"
  | "inspection"
  | "ownership_cost"
  | "unknown"
  | "next_action";

export const COMPARISON_ROWS: { id: ComparisonRow; label: string }[] = [
  { id: "confidence", label: "Review coverage" },
  { id: "planning", label: "Planning risk" },
  { id: "flood", label: "Flood risk" },
  { id: "bushfire", label: "Bushfire risk" },
  { id: "noise", label: "Noise risk" },
  { id: "strata", label: "Strata risk" },
  { id: "da", label: "DA impact" },
  { id: "infrastructure", label: "Infrastructure impact" },
  { id: "inspection", label: "Inspection status" },
  { id: "ownership_cost", label: "Ownership cost" },
  { id: "unknown", label: "Unknown data count" },
  { id: "next_action", label: "Next recommended action" },
];

export function getComparisonCellValue(
  scan: PropertyScanResult,
  row: ComparisonRow,
  context?: {
    hasInspection?: boolean;
    ddCompletePercent?: number;
  },
): string | RiskSeverity | number {
  switch (row) {
    case "confidence":
      return scan.confidenceScore.score;
    case "planning":
      return getCategorySeverity(scan, "planning");
    case "flood":
      return getCategorySeverity(scan, "flood");
    case "bushfire":
      return getCategorySeverity(scan, "bushfire");
    case "noise":
      return getCategorySeverity(scan, "noise");
    case "strata":
      return getCategorySeverity(scan, "strata");
    case "da":
      return getDaImpactSeverity(scan);
    case "infrastructure":
      return getInfrastructureImpactSeverity(scan);
    case "inspection":
      return context?.hasInspection ? "low" : "unknown";
    case "ownership_cost":
      return getCategorySeverity(scan, "ownership_cost");
    case "unknown":
      return getUnknownDataCount(scan);
    case "next_action":
      if (scan.confidenceScore.blockers.length)
        return scan.confidenceScore.blockers[0];
      if (scan.confidenceScore.cautionItems.length)
        return scan.confidenceScore.cautionItems[0];
      return context?.hasInspection
        ? "Review due diligence checklist"
        : "Book an open-home inspection";
  }
}
