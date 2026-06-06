"use client";

import { AlertTriangle, CheckCircle2, HelpCircle, ClipboardList } from "lucide-react";
import type { InspectionSummary } from "@/lib/inspection/schemas";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InspectionSummaryCardProps {
  summary: InspectionSummary;
  propertyAddress: string;
}

function scoreLabel(score: number): { text: string; variant: "low" | "medium" | "high" | "default" } {
  if (score >= 75) return { text: "Well prepared", variant: "low" };
  if (score >= 50) return { text: "Some gaps", variant: "medium" };
  if (score >= 25) return { text: "Needs follow-up", variant: "high" };
  return { text: "Incomplete", variant: "default" };
}

export function InspectionSummaryCard({
  summary,
  propertyAddress,
}: InspectionSummaryCardProps) {
  const label = scoreLabel(summary.readinessScore);
  const scoreAngle = (summary.readinessScore / 100) * 360;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-stone-200/80 bg-gradient-to-br from-stone-50 to-white">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                Inspection summary
              </p>
              <h2 className="text-xl font-semibold text-stone-900">{propertyAddress || "Property inspection"}</h2>
              <p className="text-sm text-stone-500">
                {summary.checkedCount} of {summary.totalCount} checks completed
              </p>
              <Badge variant={label.variant}>{label.text}</Badge>
            </div>

            <div
              className="relative mx-auto flex h-32 w-32 shrink-0 items-center justify-center sm:mx-0"
              aria-label={`Inspection readiness ${summary.readinessScore} out of 100`}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(#57534e ${scoreAngle}deg, #e7e5e4 ${scoreAngle}deg)`,
                }}
              />
              <div className="absolute inset-2 flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
                <span className="text-3xl font-semibold tabular-nums text-stone-900">
                  {summary.readinessScore}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wide text-stone-400">
                  readiness
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          Top concerns
        </h3>
        {summary.topConcerns.length ? (
          <ul className="space-y-2">
            {summary.topConcerns.map((concern) => (
              <li
                key={concern}
                className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3 text-sm text-stone-700"
              >
                {concern}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-stone-500">
            No major or minor concerns were recorded during this inspection.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
          <ClipboardList className="h-4 w-4 text-stone-500" />
          Missed checks
        </h3>
        {summary.missedChecks.length ? (
          <div className="flex flex-wrap gap-2">
            {summary.missedChecks.map((check) => (
              <span
                key={check}
                className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600"
              >
                {check}
              </span>
            ))}
          </div>
        ) : (
          <p className="flex items-center gap-2 text-sm text-stone-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            All checklist items were reviewed.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
          <HelpCircle className="h-4 w-4 text-stone-500" />
          Follow-up questions for agent or conveyancer
        </h3>
        <ul className="space-y-2">
          {summary.followUpQuestions.map((q) => (
            <li
              key={q}
              className={cn(
                "rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed text-stone-700",
              )}
            >
              {q}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs leading-relaxed text-stone-400">
        This summary is based on your inspection notes only. It is not a
        building report, valuation, or professional advice.
      </p>
    </div>
  );
}
