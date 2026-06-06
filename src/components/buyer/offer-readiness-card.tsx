"use client";

import type { OfferReadiness } from "@/lib/offer/readiness";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle } from "lucide-react";

interface OfferReadinessCardProps {
  readiness: OfferReadiness;
}

const statusLabel: Record<OfferReadiness["status"], string> = {
  not_ready: "Not ready to offer",
  partially_ready: "Partially ready",
  ready_with_caution: "Ready with caution",
  ready: "Ready to discuss offer",
};

const statusVariant: Record<
  OfferReadiness["status"],
  "high" | "medium" | "low" | "default"
> = {
  not_ready: "high",
  partially_ready: "medium",
  ready_with_caution: "medium",
  ready: "low",
};

export function OfferReadinessCard({ readiness }: OfferReadinessCardProps) {
  const angle = (readiness.readinessPercent / 100) * 360;

  return (
    <Card className="overflow-hidden border-stone-200/80 bg-gradient-to-br from-stone-50 to-white">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-stone-500" />
              <h3 className="text-lg font-semibold text-stone-900">
                Offer readiness gate
              </h3>
            </div>
            <Badge variant={statusVariant[readiness.status]}>
              {statusLabel[readiness.status]}
            </Badge>
            {readiness.blockers.length > 0 && (
              <ul className="space-y-1">
                {readiness.blockers.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm text-orange-800"
                  >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
            {readiness.recommendedNextActions.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-stone-400">
                  Next actions
                </p>
                <ul className="space-y-1 text-sm text-stone-600">
                  {readiness.recommendedNextActions.map((a) => (
                    <li key={a}>→ {a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="relative mx-auto flex h-28 w-28 shrink-0 items-center justify-center">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(#57534e ${angle}deg, #e7e5e4 ${angle}deg)`,
              }}
            />
            <div className="absolute inset-2 flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
              <span className="text-2xl font-semibold tabular-nums">
                {readiness.readinessPercent}%
              </span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs text-stone-400">
          Does not replace advice from your conveyancer, broker or inspector.
        </p>
      </CardContent>
    </Card>
  );
}
