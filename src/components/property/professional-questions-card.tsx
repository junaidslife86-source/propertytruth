"use client";

import type { ProfessionalQuestion } from "@/lib/synthesis/questions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceBadge } from "@/components/compliance/source-badge";

const AUDIENCE_LABEL: Record<ProfessionalQuestion["audience"], string> = {
  conveyancer: "Conveyancer",
  building_inspector: "Building inspector",
  strata_manager: "Strata manager",
  broker: "Broker",
};

export function ProfessionalQuestionsCard({
  questions,
}: {
  questions: ProfessionalQuestion[];
}) {
  if (questions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-lg">Questions for professionals</CardTitle>
          <SourceBadge source="ai_assisted" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="rounded-lg border border-outline-variant/30 p-4">
            <p className="font-label-caps text-on-surface-variant">
              {AUDIENCE_LABEL[q.audience]}
            </p>
            <p className="mt-1 font-medium text-foreground">{q.question}</p>
            <p className="mt-2 text-sm text-on-surface-variant">{q.reason}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
