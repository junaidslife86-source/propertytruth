import type { ClassifiedPage } from "@/lib/strata/page-types";
import type { RawFinding } from "@/lib/strata/evidence";
import { extractFindingsWithGemini } from "@/lib/strata/extractors/gemini-section";

const CATEGORIES = [
  "by_law_issues",
  "pets",
  "short_stays",
  "parking",
  "renovations",
  "ev_charging",
];

export async function extractBylawFindings(
  pages: ClassifiedPage[],
): Promise<RawFinding[]> {
  return extractFindingsWithGemini("By-laws", CATEGORIES, pages);
}
