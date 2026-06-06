import type { PropertyScanResult } from "@/lib/schemas";
import type { DueDiligenceItem } from "@/lib/due-diligence/types";

export type OfferReadinessStatus =
  | "not_ready"
  | "partially_ready"
  | "ready_with_caution"
  | "ready";

export interface OfferReadiness {
  readinessPercent: number;
  status: OfferReadinessStatus;
  statusLabel: string;
  blockers: string[];
  warnings: string[];
  completedItems: string[];
  recommendedNextActions: string[];
}

const STATUS_LABEL: Record<OfferReadinessStatus, string> = {
  not_ready: "Checks incomplete",
  partially_ready: "Partially complete",
  ready_with_caution: "Verify before offering",
  ready: "Checklist mostly complete",
};

export function calculateOfferReadiness(
  scan: PropertyScanResult,
  ddItems: DueDiligenceItem[],
  hasInspection: boolean,
): OfferReadiness {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const completedItems: string[] = [];
  const actions: string[] = [];

  const highSignals = scan.buyerRiskSignals.filter((s) => s.severity === "high");
  const unknownSignals = scan.buyerRiskSignals.filter(
    (s) => s.severity === "unknown",
  );

  for (const s of highSignals) {
    warnings.push(`${s.title} — verify with a professional before offering`);
  }

  if (highSignals.length >= 2) {
    blockers.push("Multiple high-severity signals to verify with professionals");
  }

  const contract = ddItems.find((i) => i.id === "dd-contract");
  if (contract?.status !== "cleared") {
    blockers.push("Contract not reviewed by conveyancer");
    actions.push("Send contract to your conveyancer");
  } else {
    completedItems.push("Contract reviewed");
  }

  const finance = ddItems.find((i) => i.id === "dd-finance");
  if (finance?.status !== "cleared") {
    blockers.push("Finance not confirmed");
    actions.push("Confirm pre-approval with your broker");
  } else {
    completedItems.push("Finance confirmed");
  }

  const strata = ddItems.find((i) => i.id === "dd-strata");
  if (strata && strata.status !== "cleared" && strata.status !== "not_applicable") {
    warnings.push("Strata report not yet reviewed");
    actions.push("Upload strata report to Strata AI");
  }

  if (!hasInspection) {
    warnings.push("Open inspection checklist not completed");
    actions.push("Complete Inspection Copilot on open home day");
  } else {
    completedItems.push("Inspection completed");
  }

  if (unknownSignals.length >= 4) {
    warnings.push(`${unknownSignals.length} data gaps — confirm with professionals`);
  }

  const required = ddItems.filter((i) => i.required);
  const clearedRequired = required.filter((i) => i.status === "cleared").length;
  const readinessPercent = Math.round(
    ((clearedRequired / Math.max(required.length, 1)) * 0.6 +
      (hasInspection ? 0.2 : 0) +
      (highSignals.length === 0 ? 0.2 : highSignals.length === 1 ? 0.1 : 0)) *
      100,
  );

  let status: OfferReadinessStatus = "not_ready";
  if (blockers.length === 0 && readinessPercent >= 75) status = "ready";
  else if (blockers.length === 0 && warnings.length > 0)
    status = "ready_with_caution";
  else if (readinessPercent >= 40) status = "partially_ready";

  if (!actions.length) {
    actions.push("Review full report with your conveyancer before bidding");
  }

  return {
    readinessPercent: Math.min(100, readinessPercent),
    status,
    statusLabel: STATUS_LABEL[status],
    blockers,
    warnings,
    completedItems,
    recommendedNextActions: actions.slice(0, 4),
  };
}
