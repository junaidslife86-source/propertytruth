import type { ClassifiedPage } from "@/lib/strata/page-types";
import type { RawFinding } from "@/lib/strata/evidence";
import { extractFindingsWithGemini } from "@/lib/strata/extractors/gemini-section";

const CATEGORIES = [
  "admin_fund_deficit",
  "capital_works_fund_adequacy",
  "special_levies",
  "levy_arrears",
  "expense_over_budget",
  "insurance_increases",
];

export async function extractFinancialFindings(
  pages: ClassifiedPage[],
): Promise<RawFinding[]> {
  return extractFindingsWithGemini("Financial statements", CATEGORIES, pages);
}
