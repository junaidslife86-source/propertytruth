"use client";

import { AlertTriangle, Quote } from "lucide-react";
import type { DocumentFinding } from "@/lib/strata/schemas";
import { CATEGORY_LABELS } from "@/lib/strata/schemas";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StrataFindingsListProps {
  findings: DocumentFinding[];
}

const severityBadge: Record<
  DocumentFinding["severity"],
  "low" | "medium" | "high"
> = {
  low: "low",
  medium: "medium",
  high: "high",
};

const confidenceLabel: Record<DocumentFinding["confidence"], string> = {
  low: "Low confidence",
  medium: "Medium confidence",
  high: "High confidence",
};

export function StrataFindingsList({ findings }: StrataFindingsListProps) {
  if (!findings.length) {
    return (
      <p className="text-sm text-on-surface-variant">
        No evidence of the categories we scan for was found in processed pages.
        This does not mean no issues exist.
      </p>
    );
  }

  const sorted = [...findings].sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 };
    return rank[a.severity] - rank[b.severity];
  });

  return (
    <div className="space-y-4">
      {sorted.map((finding) => (
        <Card key={finding.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                  {CATEGORY_LABELS[finding.category]}
                </p>
                <CardTitle className="text-base leading-snug">
                  {finding.title}
                </CardTitle>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant={severityBadge[finding.severity]}>
                  {finding.severity}
                </Badge>
                <Badge variant="default">
                  p.{finding.pageNumber}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed text-stone-600">
              {finding.plainEnglishExplanation}
            </p>
            {finding.buyerImpact && (
              <p className="text-sm text-stone-700">
                <span className="font-medium">Why it matters: </span>
                {finding.buyerImpact}
              </p>
            )}
            <blockquote className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm italic leading-relaxed text-stone-700">
              <Quote className="mb-1 inline h-3.5 w-3.5 text-stone-400" />{" "}
              {finding.supportingQuote}
            </blockquote>
            {finding.recommendedQuestion && (
              <p className="rounded-lg bg-secondary-container/40 px-3 py-2 text-sm">
                <span className="font-medium">Ask your conveyancer or strata inspector: </span>
                {finding.recommendedQuestion}
              </p>
            )}
            <p className="text-xs text-evidence-missing">
              What remains unknown: whether this has since been resolved or formally closed.
            </p>
            <p className="flex items-center gap-1 text-xs text-stone-400">
              <AlertTriangle className="h-3 w-3" />
              {confidenceLabel[finding.confidence]}
              {finding.evidenceStrength === "needs_review" &&
                " · evidence needs professional review"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
