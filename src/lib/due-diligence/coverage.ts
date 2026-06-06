import type { PropertyScanResult } from "@/lib/schemas";
import type { DueDiligenceItem } from "@/lib/due-diligence/types";

export type CoverageLabel =
  | "well_checked"
  | "partially_checked"
  | "gaps_remain"
  | "incomplete";

export interface DueDiligenceCoverage {
  score: number;
  label: CoverageLabel;
  labelDisplay: string;
  summary: string;
  checkedItems: string[];
  missingItems: string[];
  knownIssuesCount: number;
  missingChecksCount: number;
  professionalQuestionsCount: number;
}

const LABEL_DISPLAY: Record<CoverageLabel, string> = {
  well_checked: "MOSTLY CHECKED",
  partially_checked: "PARTIALLY CHECKED",
  gaps_remain: "GAPS REMAIN",
  incomplete: "INCOMPLETE REVIEW",
};

function itemWeight(status: DueDiligenceItem["status"]): number {
  switch (status) {
    case "cleared":
      return 1;
    case "in_progress":
    case "concern_found":
      return 0.5;
    case "not_applicable":
      return 1;
    default:
      return 0;
  }
}

export function calculateDueDiligenceCoverage(
  scan: PropertyScanResult,
  ddItems: DueDiligenceItem[],
  options?: { hasInspection?: boolean; hasStrataScan?: boolean },
): DueDiligenceCoverage {
  const hasInspection = options?.hasInspection ?? false;
  const hasStrataScan = options?.hasStrataScan ?? false;

  const checkedItems: string[] = [
    "Planning / DA scan (public data)",
    "Nearby development activity",
  ];

  const missingItems: string[] = [];

  if (hasStrataScan) {
    checkedItems.push("Strata report uploaded");
  } else {
    missingItems.push("Strata red flag scan");
  }

  if (hasInspection) {
    checkedItems.push("Inspection checklist started");
  } else {
    missingItems.push("Open inspection checklist");
  }

  for (const item of ddItems) {
    if (item.status === "cleared" || item.status === "not_applicable") {
      checkedItems.push(item.label);
    } else if (item.status === "not_started") {
      missingItems.push(item.label);
    }
  }

  const autoChecks = 2 + (hasStrataScan ? 1 : 0) + (hasInspection ? 1 : 0);
  const autoMax = 4;
  const ddWeight =
    ddItems.reduce((sum, i) => sum + itemWeight(i.status), 0) /
    Math.max(ddItems.length, 1);

  const score = Math.round(
    ((autoChecks / autoMax) * 0.35 + ddWeight * 0.65) * 100,
  );

  const knownIssuesCount = scan.buyerRiskSignals.filter(
    (s) => s.severity === "high" || s.severity === "medium",
  ).length;

  const missingChecksCount = missingItems.length;

  const professionalQuestionsCount = scan.buyerRiskSignals.filter(
    (s) => s.buyerQuestion?.length,
  ).length;

  let label: CoverageLabel = "partially_checked";
  if (score >= 80 && missingChecksCount <= 1) label = "well_checked";
  else if (score >= 55) label = "partially_checked";
  else if (score >= 30) label = "gaps_remain";
  else label = "incomplete";

  const summary =
    label === "well_checked"
      ? "Most planned checks are complete. Professional verification is still recommended before offering."
      : label === "partially_checked"
        ? "Some important checks are still missing. Professional review recommended."
        : label === "gaps_remain"
          ? "Several due diligence checks have not been completed. Do not rely on this workspace alone."
          : "Important categories have not been checked yet. Treat this as a starting point, not a full picture.";

  return {
    score: Math.min(100, Math.max(0, score)),
    label,
    labelDisplay: LABEL_DISPLAY[label],
    summary,
    checkedItems: [...new Set(checkedItems)].slice(0, 8),
    missingItems: [...new Set(missingItems)].slice(0, 8),
    knownIssuesCount,
    missingChecksCount,
    professionalQuestionsCount,
  };
}
