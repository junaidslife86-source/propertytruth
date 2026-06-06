"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  HelpCircle,
  MessageSquareQuote,
} from "lucide-react";
import type { DueDiligenceCoverage } from "@/lib/due-diligence/coverage";
import { MASTER_DISCLAIMER } from "@/lib/compliance/copy";
import { cn } from "@/lib/utils";

interface DueDiligenceCoverageCardProps {
  address: string;
  coverage: DueDiligenceCoverage;
  className?: string;
}

const labelTone: Record<
  DueDiligenceCoverage["label"],
  { badge: string; ring: string }
> = {
  well_checked: {
    badge: "bg-evidence-positive/10 text-evidence-positive",
    ring: "text-secondary",
  },
  partially_checked: {
    badge: "bg-evidence-verify/10 text-evidence-verify",
    ring: "text-secondary",
  },
  gaps_remain: {
    badge: "bg-evidence-verify/10 text-evidence-verify",
    ring: "text-evidence-verify",
  },
  incomplete: {
    badge: "bg-evidence-missing/10 text-evidence-missing",
    ring: "text-evidence-missing",
  },
};

export function DueDiligenceCoverageCard({
  address,
  coverage,
  className,
}: DueDiligenceCoverageCardProps) {
  const tone = labelTone[coverage.label];
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (coverage.score / 100) * circumference;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="coverage-heading"
      className={className}
    >
      <div className="rounded-xl border border-outline-variant/20 bg-white p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] sm:p-8">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          <div className="relative h-40 w-40 shrink-0">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              <circle
                className="stroke-surface-container-low text-[#e5eeff]"
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                strokeWidth="8"
              />
              <circle
                className={cn("progress-ring-circle stroke-current", tone.ring)}
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                strokeWidth="8"
                strokeLinecap="round"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: offset,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-[family-name:var(--font-manrope)] text-4xl font-extrabold text-foreground">
                {coverage.score}%
              </span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="mb-2 flex flex-col items-center gap-2 md:flex-row md:items-center">
              <h1
                id="coverage-heading"
                className="font-[family-name:var(--font-manrope)] text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                Due Diligence Coverage
              </h1>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 font-label-caps",
                  tone.badge,
                )}
              >
                {coverage.labelDisplay}
              </span>
            </div>
            <p className="text-base leading-relaxed text-on-surface-variant">
              {coverage.summary}
            </p>
            <p className="mt-2 text-sm text-on-surface-variant/70">{address}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <MetricTile
            icon={<AlertTriangle className="h-5 w-5 text-evidence-issue" />}
            label="Known issues"
            value={coverage.knownIssuesCount}
            tone="bg-red-50"
          />
          <MetricTile
            icon={<HelpCircle className="h-5 w-5 text-evidence-missing" />}
            label="Missing checks"
            value={coverage.missingChecksCount}
            tone="bg-slate-100"
          />
          <MetricTile
            icon={
              <MessageSquareQuote className="h-5 w-5 text-secondary" />
            }
            label="Pro questions"
            value={coverage.professionalQuestionsCount}
            tone="bg-teal-50"
          />
        </div>

        <div className="mt-8 grid gap-6 border-t border-outline-variant/30 pt-8 md:grid-cols-2">
          <div>
            <h2 className="mb-3 font-label-caps text-evidence-positive">
              Checked
            </h2>
            <ul className="space-y-2">
              {coverage.checkedItems.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-sm text-on-surface-variant"
                >
                  <span className="text-evidence-positive">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-3 font-label-caps text-evidence-missing">
              Still missing
            </h2>
            <ul className="space-y-2">
              {coverage.missingItems.length ? (
                coverage.missingItems.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm text-on-surface-variant"
                  >
                    <span className="text-evidence-missing">—</span>
                    {item}
                  </li>
                ))
              ) : (
                <li className="text-sm text-on-surface-variant">
                  No outstanding checklist items — verify with professionals
                  anyway.
                </li>
              )}
            </ul>
          </div>
        </div>

        <p className="mt-6 border-t border-outline-variant/30 pt-4 text-xs leading-relaxed text-on-surface-variant">
          Review coverage reflects completed checks, not whether a property is
          suitable to buy. {MASTER_DISCLAIMER}
        </p>
      </div>
    </motion.section>
  );
}

function MetricTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-white p-4">
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full",
          tone,
        )}
      >
        {icon}
      </div>
      <div>
        <p className="font-label-caps text-on-surface-variant">{label}</p>
        <p className="font-[family-name:var(--font-manrope)] text-xl font-semibold">
          {value}
        </p>
      </div>
    </div>
  );
}
