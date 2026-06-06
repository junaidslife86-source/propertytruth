"use client";

import type { OfferReadiness } from "@/lib/offer/readiness";
import { OFFER_CHECKLIST_DISCLAIMER } from "@/lib/compliance/copy";
import { ContextualDisclaimer } from "@/components/compliance/contextual-disclaimer";
import { ClipboardList } from "lucide-react";

interface PreOfferChecklistCardProps {
  readiness: OfferReadiness;
}

export function PreOfferChecklistCard({ readiness }: PreOfferChecklistCardProps) {
  const circumference = 2 * Math.PI * 42;
  const offset =
    circumference - (readiness.readinessPercent / 100) * circumference;

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant/20 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-secondary" />
            <h3 className="font-[family-name:var(--font-manrope)] text-lg font-semibold">
              Pre-offer checklist
            </h3>
          </div>
          <span className="inline-flex rounded-full bg-evidence-verify/10 px-3 py-1 font-label-caps text-evidence-verify">
            {readiness.statusLabel}
          </span>
          {readiness.blockers.length > 0 && (
            <ul className="space-y-1">
              {readiness.blockers.map((b) => (
                <li key={b} className="text-sm text-evidence-issue">
                  • {b}
                </li>
              ))}
            </ul>
          )}
          {readiness.recommendedNextActions.length > 0 && (
            <div>
              <p className="mb-1 font-label-caps text-on-surface-variant">
                Suggested next steps
              </p>
              <ul className="space-y-1 text-sm text-on-surface-variant">
                {readiness.recommendedNextActions.map((a) => (
                  <li key={a}>→ {a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="relative mx-auto h-28 w-28 shrink-0">
          <svg className="h-full w-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="transparent"
              strokeWidth="8"
              className="stroke-[#e5eeff]"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="transparent"
              strokeWidth="8"
              strokeLinecap="round"
              className="progress-ring-circle stroke-secondary"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: offset,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tabular-nums">
              {readiness.readinessPercent}%
            </span>
          </div>
        </div>
      </div>
      <ContextualDisclaimer className="mt-4">
        {OFFER_CHECKLIST_DISCLAIMER}
      </ContextualDisclaimer>
    </div>
  );
}

/** @deprecated Use PreOfferChecklistCard */
export const OfferReadinessCard = PreOfferChecklistCard;
