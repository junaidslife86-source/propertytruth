"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type PropertyReportTab =
  | "overview"
  | "issues"
  | "map"
  | "diligence"
  | "report";

const TABS: { id: PropertyReportTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "issues", label: "Issues" },
  { id: "map", label: "Map" },
  { id: "diligence", label: "Due diligence" },
  { id: "report", label: "Report" },
];

interface PropertyReportTabsProps {
  active: PropertyReportTab;
  onChange: (tab: PropertyReportTab) => void;
}

export function PropertyReportTabs({ active, onChange }: PropertyReportTabsProps) {
  return (
    <div className="overflow-x-auto border-b border-outline-variant/30">
      <nav className="flex min-w-max gap-1 px-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "px-4 py-3 font-label-caps transition-colors",
              active === tab.id
                ? "border-b-2 border-secondary text-secondary"
                : "text-on-surface-variant hover:text-foreground",
            )}
          >
            {tab.label.toUpperCase()}
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
