import type { PropertyScanResult } from "@/lib/schemas";
import type { DueDiligenceItem } from "@/lib/due-diligence/types";

export interface ProfessionalQuestion {
  id: string;
  audience: "conveyancer" | "building_inspector" | "strata_manager" | "broker";
  question: string;
  reason: string;
}

export function synthesizeProfessionalQuestions(
  scan: PropertyScanResult,
  ddItems: DueDiligenceItem[],
): ProfessionalQuestion[] {
  const questions: ProfessionalQuestion[] = [];

  for (const signal of scan.buyerRiskSignals.filter((s) => s.severity !== "low")) {
    questions.push({
      id: `signal-${signal.id}`,
      audience:
        signal.category === "strata"
          ? "strata_manager"
          : signal.category === "inspection"
            ? "building_inspector"
            : "conveyancer",
      question: signal.buyerQuestion,
      reason: signal.plainEnglishSummary,
    });
  }

  const openItems = ddItems.filter((i) => i.status === "not_started" || i.status === "in_progress");
  for (const item of openItems.slice(0, 5)) {
    questions.push({
      id: `dd-${item.id}`,
      audience: "conveyancer",
      question: `Can you confirm status of: ${item.label}?`,
      reason: "Due diligence item not yet cleared in workspace.",
    });
  }

  if (scan.riskOverlays.some((o) => o.category === "flood")) {
    questions.push({
      id: "flood-overlay",
      audience: "conveyancer",
      question:
        "Does the contract disclose flood planning / SES overlay obligations for this lot?",
      reason: "Flood-related overlay flagged in area scan.",
    });
  }

  return questions.slice(0, 12);
}
