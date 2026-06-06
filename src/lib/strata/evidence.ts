import type { ClassifiedPage } from "@/lib/strata/page-types";

export interface RawFinding {
  category: string;
  severity: "low" | "medium" | "high";
  title: string;
  plainEnglishExplanation: string;
  buyerImpact: string;
  supportingQuote: string;
  pageNumber: number;
  confidence: "low" | "medium" | "high";
  recommendedQuestion: string;
  needsProfessionalReview?: boolean;
}

export interface ValidatedFinding extends RawFinding {
  evidenceStrength: "verified" | "fuzzy" | "needs_review";
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function fuzzyContains(haystack: string, needle: string): boolean {
  const h = normalize(haystack);
  const n = normalize(needle);
  if (!n || n.length < 12) return false;
  if (h.includes(n)) return true;

  const words = n.split(" ").filter((w) => w.length > 4);
  if (words.length < 3) return false;
  const hits = words.filter((w) => h.includes(w)).length;
  return hits / words.length >= 0.7;
}

export function validateFinding(
  finding: RawFinding,
  pages: ClassifiedPage[],
): ValidatedFinding | null {
  const page = pages.find((p) => p.pageNumber === finding.pageNumber);
  if (!page) {
    return {
      ...finding,
      evidenceStrength: "needs_review",
      needsProfessionalReview: true,
    };
  }

  if (!finding.supportingQuote?.trim()) {
    return null;
  }

  if (normalize(page.text).includes(normalize(finding.supportingQuote))) {
    return { ...finding, evidenceStrength: "verified" };
  }

  if (fuzzyContains(page.text, finding.supportingQuote)) {
    return { ...finding, evidenceStrength: "fuzzy" };
  }

  return {
    ...finding,
    evidenceStrength: "needs_review",
    needsProfessionalReview: true,
    confidence: "low",
  };
}

export function validateFindings(
  findings: RawFinding[],
  pages: ClassifiedPage[],
): ValidatedFinding[] {
  const results: ValidatedFinding[] = [];
  for (const f of findings) {
    const v = validateFinding(f, pages);
    if (v) results.push(v);
  }
  return results;
}
