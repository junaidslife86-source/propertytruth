import type { PropertyScanResult } from "@/lib/schemas";
import type { DueDiligenceItem } from "@/lib/due-diligence/types";

export type QuestionAudience =
  | "conveyancer"
  | "building_inspector"
  | "strata_manager"
  | "broker"
  | "insurance_provider"
  | "selling_agent";

export interface ProfessionalQuestion {
  id: string;
  audience: QuestionAudience;
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
    questions.push({
      id: "flood-insurance",
      audience: "insurance_provider",
      question:
        "Are there flood, storm, or drainage risks that could affect premiums or cover for this address?",
      reason: "Flood-related signals in the area scan.",
    });
  }

  if (scan.riskOverlays.some((o) => o.category === "bushfire")) {
    questions.push({
      id: "bushfire-insurance",
      audience: "insurance_provider",
      question:
        "Does bushfire prone land or BAL rating affect insurance availability or cost?",
      reason: "Bushfire overlay flagged near this property.",
    });
  }

  const financeOpen = ddItems.find((i) => i.id === "dd-finance");
  if (financeOpen && financeOpen.status !== "cleared") {
    questions.push({
      id: "broker-finance",
      audience: "broker",
      question:
        "Does this property type or postcode affect lender appetite or LVR limits?",
      reason: "Finance check not yet cleared in your workspace.",
    });
  }

  if (scan.developments.length >= 2) {
    questions.push({
      id: "agent-da",
      audience: "selling_agent",
      question:
        "Are there nearby development applications that could affect light, noise, or outlook?",
      reason: "Multiple nearby development signals in the area scan.",
    });
  }

  questions.push({
    id: "agent-disclosure",
    audience: "selling_agent",
    question:
      "Are there any known building defects, water ingress issues, or special levies disclosed to the vendor?",
    reason: "Standard pre-offer disclosure prompt — verify against reports.",
  });

  return questions.slice(0, 18);
}
