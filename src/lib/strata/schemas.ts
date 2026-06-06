import { z } from "zod";
import { PROCESSING_STATUSES } from "@/lib/strata/processing-status";

export const STRATA_DISCLAIMER =
  "AI-assisted review. Not a substitute for solicitor, conveyancer, building inspector or strata inspector review.";

export const strataFindingCategorySchema = z.enum([
  "special_levies",
  "capital_works_fund",
  "water_ingress",
  "defects",
  "legal_disputes",
  "insurance_increases",
  "major_upcoming_works",
  "repeated_complaints",
  "by_law_issues",
]);

export const findingSeveritySchema = z.enum(["low", "medium", "high"]);
export const findingConfidenceSchema = z.enum(["low", "medium", "high"]);

export const documentStatusSchema = z.enum([
  "uploaded",
  "processing",
  "ready",
  "failed",
]);

export const processingStatusSchema = z.enum(PROCESSING_STATUSES);

export const documentFindingSchema = z.object({
  id: z.string(),
  category: strataFindingCategorySchema,
  title: z.string(),
  severity: findingSeveritySchema,
  plainEnglishExplanation: z.string(),
  supportingQuote: z.string(),
  pageNumber: z.number().int().positive(),
  confidence: findingConfidenceSchema,
  buyerImpact: z.string().optional(),
  recommendedQuestion: z.string().optional(),
  evidenceStrength: z.enum(["verified", "fuzzy", "needs_review"]).optional(),
});

export const strataSummarySchema = z.object({
  confidenceScore: z.number(),
  confidenceLabel: z.enum([
    "strong",
    "mostly_clear",
    "proceed_with_caution",
    "high_concern",
    "incomplete_review",
  ]),
  headline: z.string(),
  topRisks: z.array(z.string()),
  positives: z.array(z.string()),
  missingOrUnknown: z.array(z.string()),
  recommendedActions: z.array(z.string()),
  questionsForConveyancer: z.array(z.string()),
  detectedSections: z.array(
    z.object({ label: z.string(), pageRange: z.string() }),
  ),
  sectionCoverage: z.array(
    z.object({ type: z.string(), detected: z.boolean() }),
  ),
});

export const documentChunkSchema = z.object({
  id: z.string(),
  pageNumber: z.number().int().positive(),
  chunkIndex: z.number().int().nonnegative(),
  content: z.string(),
});

export const strataDocumentSchema = z.object({
  id: z.string(),
  filename: z.string(),
  pageCount: z.number().int().nonnegative().nullable(),
  status: documentStatusSchema,
  processingStatus: processingStatusSchema.optional(),
  errorMessage: z.string().nullable().optional(),
  findings: z.array(documentFindingSchema),
  summary: strataSummarySchema.nullable().optional(),
  sections: z.array(z.record(z.string(), z.unknown())).optional(),
  extractionMethod: z.string().optional(),
  extractionCoverage: z.number().optional(),
  createdAt: z.string(),
});

export const geminiFindingSchema = z.object({
  category: z.string(),
  title: z.string(),
  severity: findingSeveritySchema,
  plainEnglishExplanation: z.string(),
  supportingQuote: z.string(),
  pageNumber: z.number().int().positive(),
  confidence: findingConfidenceSchema,
  buyerImpact: z.string().optional(),
  recommendedQuestion: z.string().optional(),
});

export const geminiFindingsResponseSchema = z.object({
  findings: z.array(geminiFindingSchema),
});

export const strataAskRequestSchema = z.object({
  question: z.string().min(3).max(500),
});

export const strataAskResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(
    z.object({
      pageNumber: z.number(),
      excerpt: z.string(),
    }),
  ),
  disclaimer: z.string(),
});

export type StrataFindingCategory = z.infer<typeof strataFindingCategorySchema>;
export type DocumentFinding = z.infer<typeof documentFindingSchema>;
export type StrataDocument = z.infer<typeof strataDocumentSchema>;
export type DocumentChunk = z.infer<typeof documentChunkSchema>;
export type StrataSummary = z.infer<typeof strataSummarySchema>;

export const CATEGORY_LABELS: Record<StrataFindingCategory, string> = {
  special_levies: "Special levies",
  capital_works_fund: "Capital works / financial",
  water_ingress: "Water ingress",
  defects: "Defects / building",
  legal_disputes: "Legal disputes",
  insurance_increases: "Insurance",
  major_upcoming_works: "Major upcoming works",
  repeated_complaints: "Repeated complaints",
  by_law_issues: "By-law restrictions",
};

export const CONFIDENCE_LABELS: Record<StrataSummary["confidenceLabel"], string> = {
  strong: "Mostly clear",
  mostly_clear: "Mostly clear",
  proceed_with_caution: "Proceed with caution",
  high_concern: "High concern",
  incomplete_review: "Incomplete review",
};

const FINDING_CATEGORY_ALIASES: Record<string, StrataFindingCategory> = {
  special_levies: "special_levies",
  capital_works_fund: "capital_works_fund",
  capital_works_fund_adequacy: "capital_works_fund",
  admin_fund_deficit: "capital_works_fund",
  water_ingress: "water_ingress",
  defects: "defects",
  cladding: "defects",
  legal_disputes: "legal_disputes",
  insurance_increases: "insurance_increases",
  major_upcoming_works: "major_upcoming_works",
  repeated_complaints: "repeated_complaints",
  by_law_issues: "by_law_issues",
};

export function mapFindingCategory(cat: string): StrataFindingCategory {
  return FINDING_CATEGORY_ALIASES[cat] ?? "by_law_issues";
}
