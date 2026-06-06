"use client";

import { cn } from "@/lib/utils";

interface ContextualDisclaimerProps {
  children: string;
  className?: string;
}

export function ContextualDisclaimer({
  children,
  className,
}: ContextualDisclaimerProps) {
  return (
    <p
      className={cn(
        "text-xs leading-relaxed text-on-surface-variant",
        className,
      )}
    >
      {children}
    </p>
  );
}
