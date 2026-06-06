import type { ClassifiedPage } from "@/lib/strata/page-types";
import type { RawFinding } from "@/lib/strata/evidence";
import { extractFindingsWithGemini } from "@/lib/strata/extractors/gemini-section";

const CATEGORIES = ["insurance_increases", "insurance_claims"];

export async function extractInsuranceFindings(
  pages: ClassifiedPage[],
): Promise<RawFinding[]> {
  return extractFindingsWithGemini("Insurance", CATEGORIES, pages);
}
