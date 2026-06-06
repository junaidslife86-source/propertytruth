"use client";

import type { DueDiligenceItem, DueDiligenceStatus } from "@/lib/due-diligence/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ClipboardCheck } from "lucide-react";

const STATUS_OPTIONS: { value: DueDiligenceStatus; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "concern_found", label: "Concern" },
  { value: "cleared", label: "Cleared" },
  { value: "not_applicable", label: "N/A" },
];

const statusBadge: Record<
  DueDiligenceStatus,
  "default" | "low" | "medium" | "high"
> = {
  not_started: "default",
  in_progress: "medium",
  concern_found: "high",
  cleared: "low",
  not_applicable: "default",
};

interface DueDiligenceTrackerProps {
  items: DueDiligenceItem[];
  onUpdate: (itemId: string, status: DueDiligenceStatus) => void;
}

export function DueDiligenceTracker({ items, onUpdate }: DueDiligenceTrackerProps) {
  const cleared = items.filter((i) => i.status === "cleared").length;
  const progress = items.length ? Math.round((cleared / items.length) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Due diligence tracker
          </span>
          <span className="text-sm font-normal text-stone-500">{progress}%</span>
        </CardTitle>
        <div className="h-2 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-stone-800 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-100 bg-stone-50/50 px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-stone-800">{item.label}</p>
              {item.required && (
                <p className="text-[11px] text-stone-400">Required</p>
              )}
            </div>
            <select
              value={item.status}
              onChange={(e) =>
                onUpdate(item.id, e.target.value as DueDiligenceStatus)
              }
              className={cn(
                "rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs",
              )}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <Badge variant={statusBadge[item.status]} className="shrink-0">
              {STATUS_OPTIONS.find((o) => o.value === item.status)?.label}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
