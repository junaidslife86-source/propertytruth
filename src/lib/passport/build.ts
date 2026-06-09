import type { PropertyScanResult } from "@/lib/schemas";
import type { DueDiligenceItem } from "@/lib/due-diligence/types";
import type { DueDiligenceCoverage } from "@/lib/due-diligence/coverage";
import type { OfferReadiness } from "@/lib/offer/readiness";
import type { LinkedStrataDocument } from "@/lib/firebase/strata-cases";
import { buildStrataPassportArea } from "@/lib/passport/strata-link";

export type PassportAreaStatus =
  | "not_started"
  | "in_progress"
  | "uploaded"
  | "needs_review"
  | "not_applicable"
  | "complete";

export interface PassportArea {
  id: string;
  label: string;
  status: PassportAreaStatus;
  statusLabel: string;
  detail?: string;
  href?: string;
}

export interface PropertyPassport {
  preOfferStatus: string;
  preOfferDetail: string;
  knownChecks: string[];
  unknownChecks: string[];
  needsVerification: string[];
  nextBestAction: string;
  stats: {
    missingChecks: number;
    issuesToClarify: number;
    documentsUploaded: number;
    questionsGenerated: number;
  };
  areas: PassportArea[];
}

function ddStatus(
  items: DueDiligenceItem[],
  id: string,
): DueDiligenceItem["status"] | undefined {
  return items.find((i) => i.id === id)?.status;
}

function areaFromDd(
  id: string,
  label: string,
  itemId: string,
  items: DueDiligenceItem[],
  notApplicableIds: string[] = [],
): PassportArea {
  if (notApplicableIds.includes(itemId)) {
    return { id, label, status: "not_applicable", statusLabel: "Not applicable" };
  }
  const status = ddStatus(items, itemId);
  if (status === "cleared") {
    return { id, label, status: "complete", statusLabel: "Checked" };
  }
  if (status === "in_progress" || status === "concern_found") {
    return {
      id,
      label,
      status: "needs_review",
      statusLabel: status === "concern_found" ? "Concern flagged" : "In progress",
    };
  }
  return { id, label, status: "not_started", statusLabel: "Not started" };
}

export function buildPropertyPassport(input: {
  scan: PropertyScanResult;
  ddItems: DueDiligenceItem[];
  coverage: DueDiligenceCoverage;
  offerReadiness: OfferReadiness;
  hasInspection: boolean;
  hasStrataScan?: boolean;
  linkedStrata?: LinkedStrataDocument[];
  questionCount: number;
  documentCount?: number;
}): PropertyPassport {
  const {
    scan,
    ddItems,
    coverage,
    offerReadiness,
    hasInspection,
    hasStrataScan = false,
    linkedStrata = [],
    questionCount,
    documentCount = 0,
  } = input;

  const isApartment =
    scan.formattedAddress.toLowerCase().includes("unit") ||
    scan.formattedAddress.toLowerCase().includes("apt") ||
    ddItems.some((i) => i.id === "dd-strata");

  const strataArea =
    linkedStrata.length > 0
      ? buildStrataPassportArea(linkedStrata, isApartment)
      : hasStrataScan
        ? {
            id: "strata",
            label: "Strata reviewed",
            status: "uploaded" as const,
            statusLabel: "Uploaded — review findings",
          }
        : buildStrataPassportArea([], isApartment);

  const areas: PassportArea[] = [
    areaFromDd("contract", "Contract reviewed", "dd-contract", ddItems),
    strataArea,
    hasInspection
      ? {
          id: "building",
          label: "Building & pest",
          status: "in_progress",
          statusLabel: "Inspection started",
        }
      : areaFromDd("building", "Building & pest", "dd-building", ddItems),
    {
      id: "planning",
      label: "Planning & nearby change",
      status: scan.dataSource === "demo" ? "needs_review" : "complete",
      statusLabel:
        scan.dataSource === "demo"
          ? "Sample data — verify sources"
          : "Area scan complete",
    },
    {
      id: "climate",
      label: "Flood / bushfire / insurance",
      status:
        scan.riskOverlays.length > 0 ? "needs_review" : "not_started",
      statusLabel:
        scan.riskOverlays.length > 0
          ? "Signals found — get quotes"
          : "Not checked yet",
    },
    areaFromDd("finance", "Finance readiness", "dd-finance", ddItems),
    {
      id: "offer",
      label: "Offer readiness",
      status:
        offerReadiness.status === "ready"
          ? "complete"
          : offerReadiness.status === "not_ready"
            ? "not_started"
            : "needs_review",
      statusLabel: offerReadiness.statusLabel,
    },
  ];

  const knownChecks = [...coverage.checkedItems];
  const unknownChecks = [...coverage.missingItems];
  const needsVerification = [
    ...offerReadiness.warnings,
    ...scan.buyerRiskSignals
      .filter((s) => s.severity === "high" || s.severity === "unknown")
      .map((s) => s.title),
  ].slice(0, 8);

  const issuesToClarify = scan.buyerRiskSignals.filter(
    (s) => s.severity === "high" || s.severity === "medium",
  ).length;

  return {
    preOfferStatus: offerReadiness.statusLabel,
    preOfferDetail:
      offerReadiness.blockers[0] ??
      offerReadiness.recommendedNextActions[0] ??
      "Keep working through your pre-offer checklist.",
    knownChecks,
    unknownChecks,
    needsVerification,
    nextBestAction:
      offerReadiness.recommendedNextActions[0] ??
      (unknownChecks[0]
        ? `Verify: ${unknownChecks[0]}`
        : "Review questions for your conveyancer."),
    stats: {
      missingChecks: coverage.missingChecksCount,
      issuesToClarify,
      documentsUploaded: documentCount + linkedStrata.length,
      questionsGenerated: questionCount,
    },
    areas,
  };
}
