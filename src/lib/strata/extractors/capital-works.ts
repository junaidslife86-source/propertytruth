import type { ClassifiedPage } from "@/lib/strata/page-types";
import type { RawFinding } from "@/lib/strata/evidence";
import { extractFindingsWithGemini } from "@/lib/strata/extractors/gemini-section";

const CATEGORIES = ["capital_works_fund_adequacy", "major_upcoming_works", "special_levies"];

export async function extractCapitalWorksFindings(
  pages: ClassifiedPage[],
): Promise<RawFinding[]> {
  return extractFindingsWithGemini("Capital works plan", CATEGORIES, pages);
}
