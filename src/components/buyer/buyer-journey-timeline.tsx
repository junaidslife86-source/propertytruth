"use client";

import { cn } from "@/lib/utils";
import type { JourneyStageState } from "@/lib/journey/types";
import { CheckCircle2, Circle, AlertCircle, Lock } from "lucide-react";

const statusIcon = {
  not_started: Circle,
  in_progress: AlertCircle,
  blocked: Lock,
  ready: CheckCircle2,
  complete: CheckCircle2,
};

const statusColor = {
  not_started: "text-stone-300 bg-stone-50",
  in_progress: "text-amber-600 bg-amber-50",
  blocked: "text-orange-700 bg-orange-50",
  ready: "text-emerald-600 bg-emerald-50",
  complete: "text-emerald-700 bg-emerald-50",
};

interface BuyerJourneyTimelineProps {
  stages: JourneyStageState[];
}

export function BuyerJourneyTimeline({ stages }: BuyerJourneyTimelineProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-[640px] gap-2">
        {stages.map((stage, i) => {
          const Icon = statusIcon[stage.status];
          return (
            <div
              key={stage.stage}
              className={cn(
                "flex-1 rounded-2xl border border-stone-200/80 p-4",
                statusColor[stage.status],
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {stage.label}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-80">{stage.summary}</p>
              {stage.missingItems.length > 0 && (
                <p className="mt-2 text-[11px] opacity-70">
                  Missing: {stage.missingItems[0]}
                </p>
              )}
              {i < stages.length - 1 && (
                <div className="absolute hidden" aria-hidden />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
