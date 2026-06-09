import type { PropertyScanResult } from "@/lib/schemas";
import type { DueDiligenceCoverage } from "@/lib/due-diligence/coverage";

export interface PostScanPriority {
  id: string;
  title: string;
  reason: string;
  actionLabel: string;
  actionHref: string;
}

export function buildPostScanPriorities(
  scan: PropertyScanResult,
  coverage: DueDiligenceCoverage,
  options?: { hasStrataUpload?: boolean },
): PostScanPriority[] {
  const priorities: PostScanPriority[] = [];

  if (scan.developments.length > 0) {
    priorities.push({
      id: "planning",
      title: "Nearby development activity",
      reason: `${scan.developments.length} development signal${scan.developments.length === 1 ? "" : "s"} in your scan radius — worth discussing with your conveyancer.`,
      actionLabel: "View on map",
      actionHref: "#map-tab",
    });
  }

  if (!options?.hasStrataUpload) {
    priorities.push({
      id: "strata",
      title: "Strata report not checked",
      reason:
        "Apartment buyers should review levies, capital works, and defects before offering.",
      actionLabel: "Upload strata PDF",
      actionHref: "/strata/upload",
    });
  }

  priorities.push({
    id: "insurance",
    title: "Insurance quote not checked",
    reason:
      scan.riskOverlays.some((o) => o.category === "flood" || o.category === "bushfire")
        ? "Flood or bushfire signals near this address — confirm cover and premiums."
        : "Confirm building insurance availability and cost before exchange.",
    actionLabel: "See resilience checks",
    actionHref: "#climate-tab",
  });

  priorities.push({
    id: "contract",
    title: "Contract not reviewed",
    reason:
      coverage.missingItems.find((m) => m.toLowerCase().includes("contract")) ??
      "A conveyancer should review the contract before you offer or bid at auction.",
    actionLabel: "Open checklist",
    actionHref: "#verify-tab",
  });

  return priorities.slice(0, 4);
}
