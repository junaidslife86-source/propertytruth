"use client";

import type { ProfessionalQuestion } from "@/lib/synthesis/questions";
import { SourceBadge } from "@/components/compliance/source-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GROUP_ORDER: ProfessionalQuestion["audience"][] = [
  "conveyancer",
  "building_inspector",
  "strata_manager",
  "broker",
  "insurance_provider",
  "selling_agent",
];

const GROUP_LABEL: Record<ProfessionalQuestion["audience"], string> = {
  conveyancer: "Conveyancer",
  building_inspector: "Building inspector",
  strata_manager: "Strata manager",
  broker: "Broker",
  insurance_provider: "Insurance provider",
  selling_agent: "Selling agent",
};

interface QuestionsToAskPanelProps {
  questions: ProfessionalQuestion[];
}

export function QuestionsToAskPanel({ questions }: QuestionsToAskPanelProps) {
  if (questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Questions to ask before you offer</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-on-surface-variant">
          Complete your checklist and area scan to generate suggested questions for
          professionals. These are prompts to discuss — not legal or financial advice.
        </CardContent>
      </Card>
    );
  }

  const grouped = GROUP_ORDER.map((audience) => ({
    audience,
    label: GROUP_LABEL[audience],
    items: questions.filter((q) => q.audience === audience),
  })).filter((g) => g.items.length > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-lg">Questions to ask before you offer</CardTitle>
          <SourceBadge source="ai_assisted" />
        </div>
        <p className="text-sm text-on-surface-variant">
          AI-assisted prompts from your scan and checklist. Verify everything with a
          qualified professional before relying on it.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {grouped.map((group) => (
          <section key={group.audience}>
            <h3 className="font-label-caps text-on-surface-variant">{group.label}</h3>
            <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm">
              {group.items.map((q) => (
                <li key={q.id} className="text-foreground">
                  <p className="font-medium">{q.question}</p>
                  <p className="mt-1 text-on-surface-variant">{q.reason}</p>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
