import type { StrataDocument } from "@/lib/strata/schemas";

export const DEMO_STRATA_ID = "demo-strata";

export const DEMO_STRATA_TEXT = `
MINUTES OF ANNUAL GENERAL MEETING — Harbour View Apartments SP 12345
Page 1

The treasurer reported the capital works fund balance of $142,000 against a projected
10-year plan requirement of $890,000, noting the fund remains significantly underfunded
for upcoming facade remediation.

Page 2

Motion 12 resolved to raise a special levy of $18,500 per lot payable in two instalments
to fund urgent waterproofing and water ingress repairs to levels 4–6.

Page 3

The building manager reported recurring complaints regarding lift outages and noise
transfers between lots. Three breach notices were issued for by-law violations relating
to short-term letting.

Page 4

Insurance renewal noted a 22% premium increase following cladding rectification works.
Legal advice was sought regarding an NCAT dispute with the former builder over defect
rectification on the eastern facade.
`.trim();

export function getDemoStrataDocument(): StrataDocument {
  return {
    id: DEMO_STRATA_ID,
    filename: "harbour-view-strata-minutes-demo.pdf",
    pageCount: 4,
    status: "ready",
    findings: [
      {
        id: "demo-f1",
        category: "special_levies",
        title: "Special levy of $18,500 per lot",
        severity: "high",
        plainEnglishExplanation:
          "Owners resolved a special levy to fund urgent waterproofing works. Confirm whether this applies to the lot you are buying and if any instalments remain outstanding.",
        supportingQuote:
          "Motion 12 resolved to raise a special levy of $18,500 per lot payable in two instalments to fund urgent waterproofing and water ingress repairs to levels 4–6.",
        pageNumber: 2,
        confidence: "high",
      },
      {
        id: "demo-f2",
        category: "capital_works_fund",
        title: "Capital works fund underfunded",
        severity: "high",
        plainEnglishExplanation:
          "The capital works fund balance appears well short of the 10-year plan. This may mean further levies or borrowing for major works.",
        supportingQuote:
          "the capital works fund balance of $142,000 against a projected 10-year plan requirement of $890,000, noting the fund remains significantly underfunded",
        pageNumber: 1,
        confidence: "high",
      },
      {
        id: "demo-f3",
        category: "water_ingress",
        title: "Water ingress repairs planned",
        severity: "high",
        plainEnglishExplanation:
          "Water ingress repairs are explicitly referenced alongside the special levy. Ask for engineering reports and completion dates.",
        supportingQuote:
          "fund urgent waterproofing and water ingress repairs to levels 4–6",
        pageNumber: 2,
        confidence: "high",
      },
      {
        id: "demo-f4",
        category: "insurance_increases",
        title: "22% insurance premium increase",
        severity: "medium",
        plainEnglishExplanation:
          "Insurance costs rose sharply, likely flowing through to admin fund levies.",
        supportingQuote:
          "Insurance renewal noted a 22% premium increase following cladding rectification works",
        pageNumber: 4,
        confidence: "high",
      },
      {
        id: "demo-f5",
        category: "legal_disputes",
        title: "NCAT dispute with former builder",
        severity: "medium",
        plainEnglishExplanation:
          "A tribunal dispute over defect rectification is active. Clarify legal costs and potential outcomes.",
        supportingQuote:
          "Legal advice was sought regarding an NCAT dispute with the former builder over defect rectification",
        pageNumber: 4,
        confidence: "high",
      },
      {
        id: "demo-f6",
        category: "repeated_complaints",
        title: "Recurring lift and noise complaints",
        severity: "medium",
        plainEnglishExplanation:
          "Repeated complaints suggest unresolved building management issues.",
        supportingQuote:
          "recurring complaints regarding lift outages and noise transfers between lots",
        pageNumber: 3,
        confidence: "medium",
      },
      {
        id: "demo-f7",
        category: "by_law_issues",
        title: "By-law breach notices issued",
        severity: "low",
        plainEnglishExplanation:
          "Multiple by-law breach notices were issued for short-term letting. Check by-laws affecting your intended use.",
        supportingQuote:
          "Three breach notices were issued for by-law violations relating to short-term letting",
        pageNumber: 3,
        confidence: "high",
      },
      {
        id: "demo-f8",
        category: "defects",
        title: "Facade defect rectification",
        severity: "high",
        plainEnglishExplanation:
          "Facade remediation and defect rectification are referenced alongside legal and insurance issues.",
        supportingQuote:
          "NCAT dispute with the former builder over defect rectification on the eastern facade",
        pageNumber: 4,
        confidence: "medium",
      },
      {
        id: "demo-f9",
        category: "major_upcoming_works",
        title: "Facade remediation upcoming",
        severity: "medium",
        plainEnglishExplanation:
          "Major facade works are implied by the underfunded capital works plan and remediation references.",
        supportingQuote:
          "underfunded for upcoming facade remediation",
        pageNumber: 1,
        confidence: "medium",
      },
    ],
    createdAt: new Date().toISOString(),
  };
}
