"use client";

import Link from "next/link";
import { FileText, HelpCircle, GitCompareArrows } from "lucide-react";
import type { PropertyPassport } from "@/lib/passport/build";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const AREA_STATUS_STYLE: Record<string, string> = {
  complete: "bg-evidence-known/15 text-evidence-known",
  uploaded: "bg-secondary-container/80 text-on-secondary-container",
  in_progress: "bg-evidence-verify/15 text-evidence-verify",
  needs_review: "bg-evidence-verify/15 text-evidence-verify",
  not_started: "bg-surface-container-high text-on-surface-variant",
  not_applicable: "bg-surface-container text-on-surface-variant",
};

interface PropertyPassportCardProps {
  address: string;
  passport: PropertyPassport;
  propertyCaseId?: string | null;
  onGoToQuestions?: () => void;
  onGoToVerify?: () => void;
}

export function PropertyPassportCard({
  address,
  passport,
  propertyCaseId,
  onGoToQuestions,
  onGoToVerify,
}: PropertyPassportCardProps) {
  const strataUploadHref = propertyCaseId
    ? `/strata/upload?caseId=${encodeURIComponent(propertyCaseId)}`
    : "/strata/upload";
  return (
    <Card className="overflow-hidden border-secondary/20 shadow-sm">
      <div className="border-b border-outline-variant/20 bg-surface-container-low px-6 py-4">
        <p className="font-label-caps text-on-surface-variant">Property passport</p>
        <h2 className="mt-1 font-[family-name:var(--font-manrope)] text-xl font-bold tracking-tight">
          {address}
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Pre-offer status:{" "}
          <span className="font-medium text-foreground">{passport.preOfferStatus}</span>
        </p>
        <p className="mt-1 text-sm text-on-surface-variant">{passport.preOfferDetail}</p>
      </div>

      <CardContent className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Checks missing" value={passport.stats.missingChecks} />
          <Stat label="Issues to clarify" value={passport.stats.issuesToClarify} />
          <Stat label="Documents" value={passport.stats.documentsUploaded} />
          <Stat label="Questions ready" value={passport.stats.questionsGenerated} />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {passport.areas.map((area) => {
            const inner = (
              <>
                <div className="min-w-0">
                  <span className="text-foreground">{area.label}</span>
                  {area.detail && (
                    <p className="mt-0.5 truncate text-xs text-on-surface-variant">
                      {area.detail}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                    AREA_STATUS_STYLE[area.status],
                  )}
                >
                  {area.statusLabel}
                </span>
              </>
            );
            return area.href ? (
              <Link
                key={area.id}
                href={area.href}
                className="flex items-center justify-between gap-2 rounded-lg border border-outline-variant/25 px-3 py-2.5 text-sm transition-colors hover:border-secondary/40 hover:bg-surface-container-low"
              >
                {inner}
              </Link>
            ) : (
              <div
                key={area.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-outline-variant/25 px-3 py-2.5 text-sm"
              >
                {inner}
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-4">
          <p className="font-label-caps text-on-surface-variant">Next best action</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {passport.nextBestAction}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="default" size="sm" className="gap-2" asChild>
            <Link href={strataUploadHref}>
              <FileText className="h-4 w-4" />
              Add document
            </Link>
          </Button>
          {onGoToQuestions && (
            <Button variant="outline" size="sm" className="gap-2" onClick={onGoToQuestions}>
              <HelpCircle className="h-4 w-4" />
              Create questions
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href="/compare">
              <GitCompareArrows className="h-4 w-4" />
              Compare property
            </Link>
          </Button>
          {onGoToVerify && (
            <Button variant="ghost" size="sm" onClick={onGoToVerify}>
              Open checklist
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-surface-container-low px-3 py-2 text-center">
      <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="text-xs text-on-surface-variant">{label}</p>
    </div>
  );
}
