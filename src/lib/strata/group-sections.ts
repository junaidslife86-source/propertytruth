import {
  PAGE_TO_SECTION,
  type AnalysisPriority,
  type ClassifiedPage,
  type DocumentSection,
  type SectionType,
} from "@/lib/strata/page-types";

const SECTION_PRIORITY: Record<SectionType, AnalysisPriority> = {
  defects: "very_high",
  cladding: "very_high",
  minutes: "very_high",
  financials: "very_high",
  capital_works: "very_high",
  bylaws: "high",
  insurance: "high",
  title_search: "medium",
  strata_plan: "low",
  other: "medium",
};

export function groupPagesIntoSections(pages: ClassifiedPage[]): DocumentSection[] {
  const sections: DocumentSection[] = [];
  let current: {
    sectionType: SectionType;
    pages: ClassifiedPage[];
  } | null = null;

  function flush() {
    if (!current || !current.pages.length) return;
    const start = current.pages[0].pageNumber;
    const end = current.pages[current.pages.length - 1].pageNumber;
    const avgConf =
      current.pages.reduce((s, p) => s + p.classificationConfidence, 0) /
      current.pages.length;

    sections.push({
      id: `${current.sectionType}-${start}-${end}`,
      sectionType: current.sectionType,
      startPage: start,
      endPage: end,
      confidence: avgConf,
      priority: SECTION_PRIORITY[current.sectionType],
      pageCount: current.pages.length,
    });
    current = null;
  }

  for (const page of pages) {
    if (page.analysisPriority === "private") {
      flush();
      continue;
    }

    const sectionType = PAGE_TO_SECTION[page.pageType] ?? "other";

    if (
      !current ||
      current.sectionType !== sectionType ||
      page.pageNumber - current.pages[current.pages.length - 1].pageNumber > 2
    ) {
      flush();
      current = { sectionType, pages: [page] };
    } else {
      current.pages.push(page);
    }
  }
  flush();

  return sections.filter((s) => s.pageCount > 0);
}

export function pagesForSection(
  pages: ClassifiedPage[],
  section: DocumentSection,
): ClassifiedPage[] {
  return pages.filter(
    (p) =>
      p.pageNumber >= section.startPage &&
      p.pageNumber <= section.endPage &&
      p.analysisPriority !== "private",
  );
}

export const HIGH_PRIORITY_SECTIONS: SectionType[] = [
  "financials",
  "defects",
  "minutes",
  "bylaws",
  "insurance",
  "capital_works",
  "cladding",
];
