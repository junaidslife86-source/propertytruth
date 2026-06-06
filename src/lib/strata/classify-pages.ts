import type { ExtractedPage, PdfExtractionMethod } from "@/lib/strata/extract-types";
import {
  PAGE_TYPE_PRIORITY,
  type ClassifiedPage,
  type PageType,
} from "@/lib/strata/page-types";

type Rule = { type: PageType; patterns: RegExp[]; weight: number };

const RULES: Rule[] = [
  {
    type: "defect_report",
    patterns: [
      /engineering report/i,
      /defect/i,
      /rectification/i,
      /waterproofing/i,
      /water ingress/i,
      /structural engineer/i,
    ],
    weight: 3,
  },
  {
    type: "cladding_report",
    patterns: [/cladding/i, /combustible/i, /facade audit/i],
    weight: 3,
  },
  {
    type: "agm_minutes",
    patterns: [/annual general meeting/i, /\bagm\b/i, /motion \d+/i],
    weight: 3,
  },
  {
    type: "committee_minutes",
    patterns: [/committee meeting/i, /executive committee/i],
    weight: 2,
  },
  {
    type: "capital_works_plan",
    patterns: [/capital works plan/i, /10.?year plan/i, /sinking fund plan/i],
    weight: 3,
  },
  {
    type: "balance_sheet",
    patterns: [/balance sheet/i, /statement of financial position/i],
    weight: 3,
  },
  {
    type: "income_expenditure",
    patterns: [/income and expenditure/i, /profit and loss/i, /statement of comprehensive income/i],
    weight: 3,
  },
  {
    type: "detailed_expenses",
    patterns: [/detailed expenses/i, /expense schedule/i, /administration fund/i],
    weight: 2,
  },
  {
    type: "insurance",
    patterns: [/certificate of currency/i, /insurance policy/i, /premium/i],
    weight: 2,
  },
  {
    type: "bylaws",
    patterns: [/by-?law/i, /schedule of by/i, /short.?term rental/i, /pets/i],
    weight: 2,
  },
  {
    type: "title_search",
    patterns: [/title search/i, /registered proprietor/i, /folio identifier/i],
    weight: 2,
  },
  {
    type: "strata_plan",
    patterns: [/strata plan/i, /sp \d+/i, /lot \d+/i],
    weight: 1,
  },
  {
    type: "strata_roll",
    patterns: [/strata roll/i, /lot owner/i, /unit entitlements/i],
    weight: 2,
  },
  {
    type: "owner_ledger",
    patterns: [/owner ledger/i, /levy statement/i, /lot ledger/i],
    weight: 2,
  },
  {
    type: "legal_correspondence",
    patterns: [/ncat/i, /tribunal/i, /solicitor/i, /legal advice/i],
    weight: 2,
  },
];

function scorePage(text: string, rule: Rule): number {
  let score = 0;
  for (const pattern of rule.patterns) {
    if (pattern.test(text)) score += rule.weight;
  }
  return score;
}

function estimateTextCoverage(text: string): number {
  const len = text.trim().length;
  if (len > 800) return 0.95;
  if (len > 200) return 0.7;
  if (len > 50) return 0.4;
  return 0.1;
}

export function classifyPage(
  page: ExtractedPage,
  extractionMethod: PdfExtractionMethod,
): ClassifiedPage {
  const sample = page.text.slice(0, 4000);
  let best: PageType = "unknown";
  let bestScore = 0;

  for (const rule of RULES) {
    const s = scorePage(sample, rule);
    if (s > bestScore) {
      bestScore = s;
      best = rule.type;
    }
  }

  const confidence = bestScore === 0 ? 0.3 : Math.min(0.95, 0.5 + bestScore * 0.1);

  return {
    pageNumber: page.pageNumber,
    text: page.text,
    pageType: best,
    classificationConfidence: confidence,
    analysisPriority: PAGE_TYPE_PRIORITY[best],
    textCoverageScore: estimateTextCoverage(page.text),
    extractionMethod,
  };
}

export function classifyPages(
  pages: ExtractedPage[],
  extractionMethod: PdfExtractionMethod,
): ClassifiedPage[] {
  return pages.map((p) => classifyPage(p, extractionMethod));
}
