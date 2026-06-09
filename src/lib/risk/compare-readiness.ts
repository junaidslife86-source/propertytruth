import type { PropertyScanResult } from "@/lib/schemas";
import type { DueDiligenceItem } from "@/lib/due-diligence/types";
import { calculateDueDiligenceCoverage } from "@/lib/due-diligence/coverage";
import { calculateOfferReadiness } from "@/lib/offer/readiness";
import { getUnknownDataCount, getHighSeverityCount } from "@/lib/risk/compare";

export type ReadinessRow =
  | "offer_readiness"
  | "contract"
  | "strata"
  | "building_pest"
  | "known_issues"
  | "unknowns"
  | "missing_checks"
  | "planning_change"
  | "insurance_checks"
  | "questions"
  | "next_action";

export const READINESS_ROWS: { id: ReadinessRow; label: string }[] = [
  { id: "offer_readiness", label: "Offer readiness" },
  { id: "contract", label: "Contract reviewed" },
  { id: "strata", label: "Strata uploaded" },
  { id: "building_pest", label: "Building / pest" },
  { id: "known_issues", label: "Known issues" },
  { id: "unknowns", label: "Unknowns" },
  { id: "missing_checks", label: "Missing checks" },
  { id: "planning_change", label: "Nearby planning change" },
  { id: "insurance_checks", label: "Insurance checks" },
  { id: "questions", label: "Questions generated" },
  { id: "next_action", label: "Next action" },
];

export function getReadinessCellValue(
  scan: PropertyScanResult,
  row: ReadinessRow,
  context: {
    ddItems: DueDiligenceItem[];
    hasInspection: boolean;
    hasStrataUpload?: boolean;
  },
): string | number {
  const coverage = calculateDueDiligenceCoverage(scan, context.ddItems, {
    hasInspection: context.hasInspection,
    hasStrataScan: context.hasStrataUpload,
  });
  const readiness = calculateOfferReadiness(
    scan,
    context.ddItems,
    context.hasInspection,
  );

  const dd = (id: string) => context.ddItems.find((i) => i.id === id)?.status;

  switch (row) {
    case "offer_readiness":
      return readiness.statusLabel;
    case "contract":
      return dd("dd-contract") === "cleared" ? "Reviewed" : "Not cleared";
    case "strata":
      if (context.hasStrataUpload) return "Uploaded";
      return dd("dd-strata") === "cleared"
        ? "Checked"
        : dd("dd-strata") === "not_applicable"
          ? "N/A"
          : "Not uploaded";
    case "building_pest":
      if (context.hasInspection) return "Started";
      return dd("dd-building") === "cleared" ? "Cleared" : "Not started";
    case "known_issues":
      return getHighSeverityCount(scan) + coverage.knownIssuesCount;
    case "unknowns":
      return getUnknownDataCount(scan);
    case "missing_checks":
      return coverage.missingChecksCount;
    case "planning_change":
      return scan.developments.length >= 2
        ? "Multiple DAs"
        : scan.developments.length === 1
          ? "Some activity"
          : "None in scan";
    case "insurance_checks":
      return scan.riskOverlays.some(
        (o) => o.category === "flood" || o.category === "bushfire",
      )
        ? "Get quotes"
        : "Not checked";
    case "questions":
      return coverage.professionalQuestionsCount;
    case "next_action":
      return (
        readiness.recommendedNextActions[0] ??
        readiness.blockers[0] ??
        "Continue checklist"
      );
  }
}

export function findFewestUnknowns(scans: PropertyScanResult[]): PropertyScanResult | null {
  if (!scans.length) return null;
  return [...scans].sort(
    (a, b) => getUnknownDataCount(a) - getUnknownDataCount(b),
  )[0];
}

export function findMostMissingChecks(
  scans: PropertyScanResult[],
  ddByProperty: Record<string, DueDiligenceItem[]>,
): PropertyScanResult | null {
  if (!scans.length) return null;
  return [...scans].sort((a, b) => {
    const aMiss = calculateDueDiligenceCoverage(
      a,
      ddByProperty[a.propertyId] ?? [],
    ).missingChecksCount;
    const bMiss = calculateDueDiligenceCoverage(
      b,
      ddByProperty[b.propertyId] ?? [],
    ).missingChecksCount;
    return bMiss - aMiss;
  })[0];
}

export function findHighestCostRisk(scans: PropertyScanResult[]): PropertyScanResult | null {
  if (!scans.length) return null;
  return [...scans].sort((a, b) => {
    const aCost = a.buyerRiskSignals.filter((s) => s.category === "ownership_cost").length;
    const bCost = b.buyerRiskSignals.filter((s) => s.category === "ownership_cost").length;
    return bCost - aCost;
  })[0];
}
