"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const AUCTION_ITEMS = [
  {
    id: "contract",
    label: "Contract reviewed before auction day",
    why: "Auction contracts are often unconditional — verify terms with a conveyancer early.",
  },
  {
    id: "pest",
    label: "Building / pest / strata reports reviewed",
    why: "You may not be able to negotiate repairs after an unconditional bid.",
  },
  {
    id: "finance",
    label: "Finance approval confirmed for your max bid",
    why: "Lenders may not complete valuation before auction in all cases.",
  },
  {
    id: "deposit",
    label: "Deposit funds ready (typically 10% on the day)",
    why: "Confirm payment method and timing with your conveyancer.",
  },
  {
    id: "max",
    label: "Maximum bid set in writing",
    why: "Emotional bidding is common — decide your limit before you walk in.",
  },
  {
    id: "insurance",
    label: "Insurance availability checked",
    why: "Some properties may have flood, bushfire, or building risks affecting cover.",
  },
  {
    id: "questions",
    label: "Outstanding questions sent to agent / conveyancer",
    why: "Clarify easements, defects, and special conditions before bidding.",
  },
];

export function AuctionReadinessChecklist() {
  const [done, setDone] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">NSW auction readiness</CardTitle>
        <p className="text-sm text-on-surface-variant">
          For properties sold at auction in NSW. Cooling-off rules differ from private
          treaty — confirm timing and conditions with your conveyancer.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {AUCTION_ITEMS.map((item) => {
          const checked = done.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className={cn(
                "w-full rounded-lg border px-4 py-3 text-left transition-colors",
                checked
                  ? "border-evidence-known/40 bg-evidence-known/5"
                  : "border-outline-variant/30 hover:bg-surface-container-low",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs",
                    checked
                      ? "border-evidence-known bg-evidence-known text-white"
                      : "border-outline-variant",
                  )}
                >
                  {checked ? "✓" : ""}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{item.why}</p>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
