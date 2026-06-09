"use client";

import Link from "next/link";
import { X, FileQuestion, TrendingUp, ClipboardList, Shield } from "lucide-react";
import type { PropertyScanResult } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  READINESS_ROWS,
  getReadinessCellValue,
  findFewestUnknowns,
  findMostMissingChecks,
  findHighestCostRisk,
  type ReadinessRow,
} from "@/lib/risk/compare-readiness";
import { useInspectionStore } from "@/stores/inspection-store";
import { useDueDiligenceStore } from "@/stores/due-diligence-store";
import { cn } from "@/lib/utils";

interface PropertyComparisonTableProps {
  properties: PropertyScanResult[];
  onRemove: (propertyId: string) => void;
}

function ReadinessCell({
  scan,
  row,
  ddItems,
  hasInspection,
}: {
  scan: PropertyScanResult;
  row: ReadinessRow;
  ddItems: ReturnType<typeof useDueDiligenceStore.getState>["byProperty"][string];
  hasInspection: boolean;
}) {
  const value = getReadinessCellValue(scan, row, {
    ddItems: ddItems ?? [],
    hasInspection,
  });

  if (row === "next_action" && typeof value === "string") {
    return (
      <span className="text-left text-xs leading-relaxed text-stone-600">{value}</span>
    );
  }

  return (
    <span className="text-sm font-medium tabular-nums text-stone-800">{value}</span>
  );
}

function InsightCard({
  icon: Icon,
  title,
  scan,
  tone,
}: {
  icon: typeof Shield;
  title: string;
  scan: PropertyScanResult | null;
  tone: string;
}) {
  if (!scan) return null;

  return (
    <Card className={cn("border-stone-200/80", tone)}>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="rounded-xl bg-white/80 p-2 shadow-sm">
          <Icon className="h-4 w-4 text-stone-600" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            {title}
          </p>
          <p className="mt-1 text-sm font-medium text-stone-900">
            {scan.formattedAddress}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function PropertyComparisonTable({
  properties,
  onRemove,
}: PropertyComparisonTableProps) {
  const inspections = useInspectionStore((s) => s.inspections);
  const byProperty = useDueDiligenceStore((s) => s.byProperty);

  const inspectedAddresses = new Set(
    inspections
      .filter((i) => i.status === "completed" || i.status === "in_progress")
      .map((i) => i.propertyAddress),
  );

  const fewestUnknowns = findFewestUnknowns(properties);
  const mostMissing = findMostMissingChecks(properties, byProperty);
  const highestCost = findHighestCostRisk(properties);
  const mostComplete = findFewestUnknowns(
    [...properties].sort((a, b) => {
      const aMiss = getReadinessCellValue(a, "missing_checks", {
        ddItems: byProperty[a.propertyId] ?? [],
        hasInspection: inspectedAddresses.has(a.formattedAddress),
      });
      const bMiss = getReadinessCellValue(b, "missing_checks", {
        ddItems: byProperty[b.propertyId] ?? [],
        hasInspection: inspectedAddresses.has(b.formattedAddress),
      });
      return (aMiss as number) - (bMiss as number);
    }),
  );

  const showInsights = properties.length >= 2;

  return (
    <div className="space-y-8">
      {showInsights && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InsightCard
            icon={Shield}
            title="Fewest unknowns"
            scan={fewestUnknowns}
            tone="bg-emerald-50/60"
          />
          <InsightCard
            icon={ClipboardList}
            title="Most complete checklist"
            scan={mostComplete}
            tone="bg-sky-50/60"
          />
          <InsightCard
            icon={FileQuestion}
            title="Most missing checks"
            scan={mostMissing}
            tone="bg-stone-100/80"
          />
          <InsightCard
            icon={TrendingUp}
            title="Highest ongoing cost signals"
            scan={highestCost}
            tone="bg-amber-50/60"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-stone-200/80 bg-white/90 shadow-sm">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-200/80 bg-stone-50/80">
              <th className="sticky left-0 z-10 bg-stone-50/95 px-4 py-4 text-left font-medium text-stone-500 backdrop-blur-sm">
                Readiness factor
              </th>
              {properties.map((scan) => (
                <th
                  key={scan.propertyId}
                  className="min-w-[180px] px-4 py-4 text-center align-top"
                >
                  <div className="space-y-2">
                    <Link
                      href={`/properties/${encodeURIComponent(scan.propertyId)}`}
                      className="block text-left text-sm font-semibold leading-snug text-stone-900 hover:underline"
                    >
                      {scan.formattedAddress}
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-stone-500"
                      onClick={() => onRemove(scan.propertyId)}
                    >
                      <X className="h-3 w-3" />
                      Remove
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {READINESS_ROWS.map((row) => (
              <tr
                key={row.id}
                className="border-b border-stone-100 last:border-0"
              >
                <td className="sticky left-0 z-10 bg-white/95 px-4 py-4 font-medium text-stone-700 backdrop-blur-sm">
                  {row.label}
                </td>
                {properties.map((scan) => (
                  <td
                    key={`${scan.propertyId}-${row.id}`}
                    className="px-4 py-4 text-center"
                  >
                    <ReadinessCell
                      scan={scan}
                      row={row.id}
                      ddItems={byProperty[scan.propertyId]}
                      hasInspection={inspectedAddresses.has(scan.formattedAddress)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs leading-relaxed text-stone-400">
        Compares readiness and gaps — not listing features or &ldquo;best
        property.&rdquo; Not professional advice.
      </p>
    </div>
  );
}
