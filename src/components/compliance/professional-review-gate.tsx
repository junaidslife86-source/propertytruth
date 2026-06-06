"use client";

import { useState } from "react";
import { PROFESSIONAL_REVIEW_ITEMS } from "@/lib/compliance/copy";
import { cn } from "@/lib/utils";

interface ProfessionalReviewGateProps {
  className?: string;
}

export function ProfessionalReviewGate({ className }: ProfessionalReviewGateProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  return (
    <section
      className={cn(
        "rounded-xl border border-outline-variant/30 bg-white p-6",
        className,
      )}
    >
      <h3 className="font-[family-name:var(--font-manrope)] text-lg font-semibold">
        Before relying on this workspace
      </h3>
      <p className="mt-2 text-sm text-on-surface-variant">
        Confirm key items with the professionals who can verify them — PropertyTruth
        is not the final authority.
      </p>
      <ul className="mt-4 space-y-2">
        {PROFESSIONAL_REVIEW_ITEMS.map((item) => (
          <li key={item.id} className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={Boolean(checked[item.id])}
              onChange={(e) =>
                setChecked((prev) => ({ ...prev, [item.id]: e.target.checked }))
              }
              className="h-4 w-4 rounded border-outline-variant"
            />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
