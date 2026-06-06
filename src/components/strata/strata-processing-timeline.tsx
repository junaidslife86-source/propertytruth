"use client";

import { PROCESSING_STATUS_LABELS } from "@/lib/strata/processing-status";
import type { ProcessingStatus } from "@/lib/strata/processing-status";
import { cn } from "@/lib/utils";

const PIPELINE: ProcessingStatus[] = [
  "queued",
  "extracting_text",
  "ocr_processing",
  "classifying_pages",
  "grouping_sections",
  "extracting_findings",
  "generating_summary",
  "complete",
];

interface StrataProcessingTimelineProps {
  status: ProcessingStatus;
}

export function StrataProcessingTimeline({
  status,
}: StrataProcessingTimelineProps) {
  const currentIdx = PIPELINE.indexOf(status);
  const failed = status === "failed";

  return (
    <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50/50 p-4">
      <p className="text-sm font-medium text-stone-800">
        {failed
          ? "Processing failed"
          : status === "complete"
            ? "Analysis complete"
            : PROCESSING_STATUS_LABELS[status]}
      </p>
      <ol className="space-y-2">
        {PIPELINE.filter((s) => s !== "ocr_processing" || status === "ocr_processing" || currentIdx > PIPELINE.indexOf("ocr_processing")).map((step) => {
          const idx = PIPELINE.indexOf(step);
          const done = currentIdx > idx || status === "complete";
          const active = status === step;
          return (
            <li
              key={step}
              className={cn(
                "flex items-center gap-2 text-sm",
                done ? "text-emerald-700" : active ? "text-stone-900 font-medium" : "text-stone-400",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  done ? "bg-emerald-500" : active ? "bg-stone-900 animate-pulse" : "bg-stone-300",
                )}
              />
              {PROCESSING_STATUS_LABELS[step]}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
