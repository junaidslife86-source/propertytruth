"use client";

import Link from "next/link";
import { AlertCircle, X } from "lucide-react";
import type { PostScanPriority } from "@/lib/passport/post-scan-priorities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PostScanPrioritiesCardProps {
  priorities: PostScanPriority[];
  onDismiss: () => void;
  onNavigateTab?: (tab: string) => void;
}

export function PostScanPrioritiesCard({
  priorities,
  onDismiss,
  onNavigateTab,
}: PostScanPrioritiesCardProps) {
  if (priorities.length === 0) return null;

  return (
    <Card className="border-secondary/30 bg-secondary-container/20">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-secondary" />
            Worth checking before you offer
          </CardTitle>
          <p className="mt-1 text-sm text-on-surface-variant">
            We found {priorities.length} starting points from your property file — not
            a complete due diligence review.
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onDismiss} aria-label="Dismiss">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <ol className="space-y-3">
          {priorities.map((item, i) => (
            <li
              key={item.id}
              className="flex gap-3 rounded-lg border border-outline-variant/25 bg-white/80 px-4 py-3"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-on-secondary">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-on-surface-variant">{item.reason}</p>
                {item.actionHref.startsWith("#") ? (
                  <button
                    type="button"
                    className="mt-2 text-sm font-medium text-secondary hover:underline"
                    onClick={() =>
                      onNavigateTab?.(
                        item.actionHref.replace("#", "").replace("-tab", ""),
                      )
                    }
                  >
                    {item.actionLabel} →
                  </button>
                ) : (
                  <Link
                    href={item.actionHref}
                    className="mt-2 inline-block text-sm font-medium text-secondary hover:underline"
                  >
                    {item.actionLabel} →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
