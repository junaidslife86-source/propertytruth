import type { ClassifiedPage } from "@/lib/strata/page-types";
import type { RawFinding } from "@/lib/strata/evidence";
import { extractFindingsWithGemini } from "@/lib/strata/extractors/gemini-section";

const CATEGORIES = [
  "defects",
  "water_ingress",
  "facade_or_balcony",
  "basement_carpark_leaks",
  "concrete_spalling",
  "fire_safety",
];

export async function extractDefectFindings(
  pages: ClassifiedPage[],
): Promise<RawFinding[]> {
  return extractFindingsWithGemini("Building defect / engineering report", CATEGORIES, pages);
}
