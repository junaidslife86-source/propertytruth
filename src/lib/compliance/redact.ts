import type { StrataReviewSummary } from "@/lib/strata/summary";

const EMAIL =
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const PHONE =
  /(?:\+?61[\s-]?|0)(?:\d[\s-]?){8,10}\d/g;
const BSB = /\b\d{3}[-\s]?\d{3}\b/g;
const ACCOUNT = /\b(?:BSB|Account|A\/C)[:\s#]*[\d\s-]{6,}\b/gi;
const LOT_OWNER_LINE =
  /(?:owner|lot\s+\d+[A-Za-z]?)[:\s]+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/gi;

export function redactPii(text: string): string {
  if (!text) return text;
  return text
    .replace(EMAIL, "[email redacted]")
    .replace(PHONE, "[phone redacted]")
    .replace(BSB, "[BSB redacted]")
    .replace(ACCOUNT, "[account detail redacted]")
    .replace(LOT_OWNER_LINE, "[owner name redacted]");
}

export function redactOptional(text: string | undefined | null): string | undefined {
  if (!text) return text ?? undefined;
  return redactPii(text);
}

export function redactStrataSummary(summary: StrataReviewSummary): StrataReviewSummary {
  return {
    ...summary,
    headline: redactPii(summary.headline),
    topRisks: summary.topRisks.map(redactPii),
    positives: summary.positives.map(redactPii),
    missingOrUnknown: summary.missingOrUnknown.map(redactPii),
    recommendedActions: summary.recommendedActions.map(redactPii),
    questionsForConveyancer: summary.questionsForConveyancer.map(redactPii),
  };
}
