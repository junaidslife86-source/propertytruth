import type { PropertyScanResult } from "@/lib/schemas";
import type { DueDiligenceItem } from "@/lib/due-diligence/types";
import {
  JOURNEY_STAGES,
  type JourneyStageState,
  type StageStatus,
} from "@/lib/journey/types";

export function calculateJourneyProgress(
  scan: PropertyScanResult,
  ddItems: DueDiligenceItem[],
  hasInspection: boolean,
): JourneyStageState[] {
  const highRisks = scan.buyerRiskSignals.filter(
    (s) => s.severity === "high",
  ).length;
  const unknowns = scan.buyerRiskSignals.filter(
    (s) => s.severity === "unknown",
  ).length;
  const score = scan.confidenceScore.score;
  const ddComplete = ddItems.filter((i) => i.status === "cleared").length;
  const ddTotal = ddItems.length;
  const ddProgress = ddTotal ? ddComplete / ddTotal : 0;

  const exploreStatus: StageStatus =
    score >= 50 ? "complete" : unknowns > 3 ? "in_progress" : "ready";

  const inspectStatus: StageStatus = hasInspection
    ? "complete"
    : highRisks > 0
      ? "in_progress"
      : "not_started";

  const verifyStatus: StageStatus =
    ddProgress >= 0.7
      ? "ready"
      : ddProgress > 0
        ? "in_progress"
        : highRisks > 1
          ? "blocked"
          : "not_started";

  const offerStatus: StageStatus =
    highRisks > 0 || ddProgress < 0.5
      ? "blocked"
      : hasInspection && ddProgress >= 0.5
        ? "ready"
        : "not_started";

  return JOURNEY_STAGES.map(({ stage, label }) => {
    switch (stage) {
      case "explore":
        return {
          stage,
          label,
          status: exploreStatus,
          summary: `Due diligence coverage ${score}% based on checks completed so far.`,
          missingItems:
            unknowns > 0
              ? [`${unknowns} data gap(s) to review`]
              : [],
          nextAction: "Review risk signals and map layers.",
        };
      case "inspect":
        return {
          stage,
          label,
          status: inspectStatus,
          summary: hasInspection
            ? "Open inspection notes captured."
            : "Schedule an open home visit.",
          missingItems: hasInspection ? [] : ["Inspection checklist not started"],
          nextAction: hasInspection
            ? "Review inspection summary"
            : "Start Inspection Copilot",
        };
      case "verify":
        return {
          stage,
          label,
          status: verifyStatus,
          summary: `${ddComplete} of ${ddTotal} due diligence checks cleared.`,
          missingItems: ddItems
            .filter((i) => i.status !== "cleared" && i.required)
            .map((i) => i.label)
            .slice(0, 3),
          nextAction: "Complete due diligence tracker items.",
        };
      case "offer":
        return {
          stage,
          label,
          status: offerStatus,
          summary:
            offerStatus === "blocked"
              ? "Critical checks incomplete — review before offering."
              : "Review pre-offer checklist.",
          missingItems:
            offerStatus === "blocked"
              ? ["Resolve high-severity signals", "Complete required DD items"]
              : [],
          nextAction:
            offerStatus === "blocked"
              ? "Complete blockers first"
              : "Review with conveyancer",
        };
      case "settle":
        return {
          stage,
          label,
          status: "not_started" as StageStatus,
          summary: "Settlement checklist unlocks after offer stage.",
          missingItems: [],
          nextAction: "Confirm finance and contract dates.",
        };
      case "own":
        return {
          stage,
          label,
          status: "not_started" as StageStatus,
          summary: "Post-settlement ownership tools coming soon.",
          missingItems: [],
          nextAction: "Save property passport when available.",
        };
    }
  });
}
