import type { ValidatedFinding } from "@/lib/strata/evidence";
import type { DocumentSection } from "@/lib/strata/page-types";

export type StrataConfidenceLabel =
  | "strong"
  | "mostly_clear"
  | "proceed_with_caution"
  | "high_concern"
  | "incomplete_review";

export interface StrataReviewSummary {
  confidenceScore: number;
  confidenceLabel: StrataConfidenceLabel;
  headline: string;
  topRisks: string[];
  positives: string[];
  missingOrUnknown: string[];
  recommendedActions: string[];
  questionsForConveyancer: string[];
  detectedSections: { label: string; pageRange: string }[];
  sectionCoverage: { type: string; detected: boolean }[];
}

const EXPECTED_SECTIONS = [
  { type: "financials", label: "Financial statements" },
  { type: "bylaws", label: "By-laws" },
  { type: "minutes", label: "Meeting minutes" },
  { type: "defects", label: "Defect / engineering report" },
  { type: "capital_works", label: "Capital works plan" },
  { type: "insurance", label: "Insurance" },
  { type: "cladding", label: "Cladding assessment" },
];

export function generateStrataSummary(
  findings: ValidatedFinding[],
  sections: DocumentSection[],
  pageCount: number,
): StrataReviewSummary {
  const high = findings.filter((f) => f.severity === "high");
  const medium = findings.filter((f) => f.severity === "medium");
  const needsReview = findings.filter((f) => f.evidenceStrength === "needs_review");

  let score = 78;
  score -= high.length * 12;
  score -= medium.length * 5;
  score -= needsReview.length * 3;
  if (pageCount > 200) score -= 5;
  score = Math.max(15, Math.min(92, score));

  let confidenceLabel: StrataConfidenceLabel = "mostly_clear";
  if (high.length >= 3) confidenceLabel = "high_concern";
  else if (high.length >= 1 || medium.length >= 4)
    confidenceLabel = "proceed_with_caution";
  else if (sections.length < 2 || pageCount < 5)
    confidenceLabel = "incomplete_review";
  else if (high.length === 0 && medium.length <= 1) confidenceLabel = "strong";

  const detectedTypes = new Set(sections.map((s) => s.sectionType));

  const sectionCoverage = EXPECTED_SECTIONS.map((e) => ({
    type: e.label,
    detected: detectedTypes.has(e.type as DocumentSection["sectionType"]),
  }));

  const missingOrUnknown: string[] = sectionCoverage
    .filter((s) => !s.detected)
    .map((s) => `No ${s.type.toLowerCase()} clearly detected in processed pages`);

  if (needsReview.length) {
    missingOrUnknown.push(
      `${needsReview.length} finding(s) could not be fully verified against source text — professional review recommended`,
    );
  }

  missingOrUnknown.push(
    "Whether all defects are remediated and formally closed",
    "Whether any special levies were approved after this report date",
  );

  const topRisks = [...high, ...medium]
    .slice(0, 5)
    .map((f) => f.title);

  const positives =
    high.length === 0
      ? ["No high-severity flags identified in analysed sections"]
      : [];

  const questionsForConveyancer = findings
    .slice(0, 6)
    .map((f) => f.recommendedQuestion)
    .filter(Boolean);

  return {
    confidenceScore: score,
    confidenceLabel,
    headline:
      confidenceLabel === "high_concern"
        ? "Multiple material items to verify in analysed sections"
        : confidenceLabel === "proceed_with_caution"
          ? "Some items warrant professional verification in analysed sections"
          : confidenceLabel === "incomplete_review"
            ? "Limited sections detected — scan may be incomplete"
            : "No major red flags in analysed sections based on available text",
    topRisks,
    positives,
    missingOrUnknown: missingOrUnknown.slice(0, 8),
    recommendedActions: [
      "Have a strata report reviewed by your conveyancer or strata inspector",
      "Confirm financial balances and any special levies with the strata manager",
      "Verify defect and cladding items against current status",
    ],
    questionsForConveyancer,
    detectedSections: sections.map((s) => ({
      label: s.sectionType.replace(/_/g, " "),
      pageRange: `pp. ${s.startPage}–${s.endPage}`,
    })),
    sectionCoverage,
  };
}
