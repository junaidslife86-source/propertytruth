import type { DocumentSection, SectionType } from "@/lib/strata/page-types";
import type { ClassifiedPage } from "@/lib/strata/page-types";
import type { RawFinding } from "@/lib/strata/evidence";
import { pagesForSection } from "@/lib/strata/group-sections";
import { extractFinancialFindings } from "@/lib/strata/extractors/financials";
import { extractDefectFindings } from "@/lib/strata/extractors/defects";
import { extractCladdingFindings } from "@/lib/strata/extractors/cladding";
import { extractMinutesFindings } from "@/lib/strata/extractors/minutes";
import { extractBylawFindings } from "@/lib/strata/extractors/bylaws";
import { extractInsuranceFindings } from "@/lib/strata/extractors/insurance";
import { extractCapitalWorksFindings } from "@/lib/strata/extractors/capital-works";

const EXTRACTORS: Partial<
  Record<SectionType, (pages: ClassifiedPage[]) => Promise<RawFinding[]>>
> = {
  financials: extractFinancialFindings,
  defects: extractDefectFindings,
  cladding: extractCladdingFindings,
  minutes: extractMinutesFindings,
  bylaws: extractBylawFindings,
  insurance: extractInsuranceFindings,
  capital_works: extractCapitalWorksFindings,
};

export async function extractSectionFindings(
  section: DocumentSection,
  allPages: ClassifiedPage[],
): Promise<RawFinding[]> {
  const pages = pagesForSection(allPages, section);
  if (!pages.length) return [];

  const extractor = EXTRACTORS[section.sectionType];
  if (!extractor) return [];

  return extractor(pages);
}
