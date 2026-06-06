"use client";

import type { InspectionSeverity } from "@/lib/inspection/schemas";
import { cn } from "@/lib/utils";

const OPTIONS: { value: InspectionSeverity; label: string; className: string }[] = [
  {
    value: "ok",
    label: "OK",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800 data-[active=true]:ring-emerald-400",
  },
  {
    value: "minor",
    label: "Minor",
    className: "border-amber-200 bg-amber-50 text-amber-900 data-[active=true]:ring-amber-400",
  },
  {
    value: "major",
    label: "Major",
    className: "border-orange-200 bg-orange-50 text-orange-900 data-[active=true]:ring-orange-400",
  },
  {
    value: "not_checked",
    label: "Skip",
    className: "border-stone-200 bg-stone-50 text-stone-600 data-[active=true]:ring-stone-400",
  },
];

interface SeverityPillsProps {
  value: InspectionSeverity;
  onChange: (value: InspectionSeverity) => void;
}

export function SeverityPills({ value, onChange }: SeverityPillsProps) {
  return (
    <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Severity">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          data-active={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-xl border px-2 py-2.5 text-xs font-medium transition-all",
            "data-[active=true]:ring-2 data-[active=true]:ring-offset-1",
            "active:scale-[0.97]",
            opt.className,
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
