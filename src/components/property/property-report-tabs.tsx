"use client";

import { cn } from "@/lib/utils";

export type PropertyReportTab =
  | "summary"
  | "risks"
  | "map"
  | "verify"
  | "questions"
  | "costs";

const TABS: { id: PropertyReportTab; label: string }[] = [
  { id: "summary", label: "What we know" },
  { id: "risks", label: "Risks" },
  { id: "map", label: "Nearby" },
  { id: "verify", label: "What to verify" },
  { id: "questions", label: "Questions" },
  { id: "costs", label: "Costs" },
];

interface PropertyReportTabsProps {
  active: PropertyReportTab;
  onChange: (tab: PropertyReportTab) => void;
}

export function PropertyReportTabs({ active, onChange }: PropertyReportTabsProps) {
  return (
    <div className="overflow-x-auto border-b border-outline-variant/30">
      <nav className="flex min-w-max gap-1 px-1" aria-label="Property passport sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
              active === tab.id
                ? "border-b-2 border-secondary text-secondary"
                : "text-on-surface-variant hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export function PropertyReportTabPanel({
  tab,
  active,
  children,
}: {
  tab: PropertyReportTab;
  active: PropertyReportTab;
  children: React.ReactNode;
}) {
  if (tab !== active) return null;
  return <div className="space-y-8 pt-8">{children}</div>;
}
