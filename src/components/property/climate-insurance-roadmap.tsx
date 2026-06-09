"use client";

import Link from "next/link";
import type { PropertyScanResult } from "@/lib/schemas";
import { SourceBadge } from "@/components/compliance/source-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ResilienceCheck = {
  id: string;
  label: string;
  status: "not_checked" | "signal_found" | "needs_quote";
  summary: string;
};

function buildChecks(scan: PropertyScanResult): ResilienceCheck[] {
  const overlayCats = new Set(scan.riskOverlays.map((o) => o.category));

  return [
    {
      id: "flood",
      label: "Flood & stormwater",
      status: overlayCats.has("flood") ? "signal_found" : "not_checked",
      summary: overlayCats.has("flood")
        ? "Flood-related signal in area scan — confirm insurance and council records."
        : "Not assessed from your uploads yet. Request flood planning info for the lot.",
    },
    {
      id: "bushfire",
      label: "Bushfire exposure",
      status: overlayCats.has("bushfire") ? "signal_found" : "not_checked",
      summary: overlayCats.has("bushfire")
        ? "Bushfire signal nearby — check BAL, maintenance, and insurer appetite."
        : "No bushfire signal in current scan data. Verify with searches before exchange.",
    },
    {
      id: "storm",
      label: "Storm & coastal resilience",
      status: "not_checked",
      summary:
        "Roof, drainage, and strata waterproofing matter in NSW storms — building/strata reports help.",
    },
    {
      id: "heat",
      label: "Heat & comfort",
      status: "not_checked",
      summary:
        "Orientation and insulation affect running costs — note at inspection.",
    },
    {
      id: "insurance",
      label: "Insurance premium risk",
      status:
        overlayCats.has("flood") || overlayCats.has("bushfire")
          ? "needs_quote"
          : "not_checked",
      summary:
        overlayCats.has("flood") || overlayCats.has("bushfire")
          ? "Get written insurance quotes before offering — do not assume standard cover."
          : "Obtain quotes early; some building types or defects affect availability.",
    },
  ];
}

const STATUS_LABEL = {
  not_checked: "Not checked",
  signal_found: "Signal found",
  needs_quote: "Get quotes",
} as const;

const STATUS_STYLE = {
  not_checked: "bg-surface-container-high text-on-surface-variant",
  signal_found: "bg-evidence-verify/15 text-evidence-verify",
  needs_quote: "bg-evidence-verify/20 text-evidence-verify",
} as const;

export function ClimateInsuranceRoadmap({ scan }: { scan: PropertyScanResult }) {
  const checks = buildChecks(scan);

  return (
    <Card id="climate-tab">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-lg">Insurance & resilience checks</CardTitle>
          <SourceBadge source="needs_verification" />
        </div>
        <p className="text-sm text-on-surface-variant">
          Framed as checks to complete — not &ldquo;safe&rdquo; or &ldquo;unsafe&rdquo;. Climate
          and insurance costs are increasingly part of NSW buyer due diligence.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {checks.map((check) => (
          <div
            key={check.id}
            className="rounded-lg border border-outline-variant/25 px-4 py-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-foreground">{check.label}</p>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  STATUS_STYLE[check.status],
                )}
              >
                {STATUS_LABEL[check.status]}
              </span>
            </div>
            <p className="mt-2 text-sm text-on-surface-variant">{check.summary}</p>
          </div>
        ))}
        <p className="text-xs text-on-surface-variant">
          Roadmap item — full climate layers ship in a future release. For now, combine
          area scan signals with{" "}
          <Link href="/strata/upload" className="text-secondary hover:underline">
            uploaded reports
          </Link>{" "}
          and professional searches.
        </p>
      </CardContent>
    </Card>
  );
}
