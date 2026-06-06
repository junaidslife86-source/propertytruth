import type { ClassifiedPage } from "@/lib/strata/page-types";
import type { RawFinding } from "@/lib/strata/evidence";
import { extractFindingsWithGemini } from "@/lib/strata/extractors/gemini-section";

const CATEGORIES = [
  "special_levies",
  "major_upcoming_works",
  "legal_disputes",
  "repeated_complaints",
  "committee_turnover",
];

export async function extractMinutesFindings(
  pages: ClassifiedPage[],
): Promise<RawFinding[]> {
  return extractFindingsWithGemini("AGM / committee minutes", CATEGORIES, pages);
}
