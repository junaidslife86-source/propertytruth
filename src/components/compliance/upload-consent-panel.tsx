"use client";

import { useState } from "react";
import { PRIVACY_UPLOAD_BULLETS, NO_TRAINING_STATEMENT, UPLOAD_DISCLAIMER } from "@/lib/compliance/copy";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadConsentPanelProps {
  onConfirm: () => void;
  disabled?: boolean;
  className?: string;
}

export function UploadConsentPanel({
  onConfirm,
  disabled,
  className,
}: UploadConsentPanelProps) {
  const [checks, setChecks] = useState<boolean[]>(
    () => PRIVACY_UPLOAD_BULLETS.map(() => false),
  );

  const allChecked = checks.every(Boolean);

  return (
    <div
      className={cn(
        "rounded-xl border border-outline-variant/30 bg-surface-container-low/50 p-5",
        className,
      )}
    >
      <h2 className="font-[family-name:var(--font-manrope)] text-lg font-semibold">
        Before you upload
      </h2>
      <p className="mt-2 text-sm text-on-surface-variant">{UPLOAD_DISCLAIMER}</p>
      <ul className="mt-4 space-y-3">
        {PRIVACY_UPLOAD_BULLETS.map((text, i) => (
          <li key={text} className="flex gap-3 text-sm text-on-surface-variant">
            <input
              type="checkbox"
              checked={checks[i]}
              onChange={(e) => {
                const next = [...checks];
                next[i] = e.target.checked;
                setChecks(next);
              }}
              className="mt-1 h-4 w-4 rounded border-outline-variant"
            />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-on-surface-variant">{NO_TRAINING_STATEMENT}</p>
      <Button
        className="mt-4 w-full bg-secondary text-white hover:bg-secondary/90"
        disabled={!allChecked || disabled}
        onClick={onConfirm}
      >
        I understand — choose file
      </Button>
    </div>
  );
}
