export const PAGE_TYPES = [
  "strata_roll",
  "owner_ledger",
  "balance_sheet",
  "income_expenditure",
  "detailed_expenses",
  "capital_works_plan",
  "agm_minutes",
  "committee_minutes",
  "bylaws",
  "title_search",
  "strata_plan",
  "insurance",
  "defect_report",
  "cladding_report",
  "legal_correspondence",
  "unknown",
] as const;

export type PageType = (typeof PAGE_TYPES)[number];

export type AnalysisPriority =
  | "very_high"
  | "high"
  | "medium"
  | "low"
  | "private";

export const PAGE_TYPE_PRIORITY: Record<PageType, AnalysisPriority> = {
  defect_report: "very_high",
  cladding_report: "very_high",
  agm_minutes: "very_high",
  committee_minutes: "very_high",
  balance_sheet: "very_high",
  income_expenditure: "very_high",
  detailed_expenses: "very_high",
  capital_works_plan: "very_high",
  insurance: "high",
  bylaws: "high",
  legal_correspondence: "high",
  title_search: "medium",
  strata_plan: "low",
  strata_roll: "private",
  owner_ledger: "private",
  unknown: "medium",
};

export type SectionType =
  | "financials"
  | "defects"
  | "minutes"
  | "bylaws"
  | "insurance"
  | "capital_works"
  | "cladding"
  | "title_search"
  | "strata_plan"
  | "other";

export const PAGE_TO_SECTION: Partial<Record<PageType, SectionType>> = {
  balance_sheet: "financials",
  income_expenditure: "financials",
  detailed_expenses: "financials",
  defect_report: "defects",
  cladding_report: "cladding",
  agm_minutes: "minutes",
  committee_minutes: "minutes",
  bylaws: "bylaws",
  insurance: "insurance",
  capital_works_plan: "capital_works",
  title_search: "title_search",
  strata_plan: "strata_plan",
  legal_correspondence: "other",
};

export interface ClassifiedPage {
  pageNumber: number;
  text: string;
  pageType: PageType;
  classificationConfidence: number;
  analysisPriority: AnalysisPriority;
  textCoverageScore: number;
  extractionMethod: "native" | "document_ai";
}

export interface DocumentSection {
  id: string;
  sectionType: SectionType;
  startPage: number;
  endPage: number;
  confidence: number;
  priority: AnalysisPriority;
  pageCount: number;
}
