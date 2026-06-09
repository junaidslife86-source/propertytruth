"use client";

import type { PropertyScanResult } from "@/lib/schemas";
import { SourceBadge } from "@/components/compliance/source-badge";
import { dataSourceToLabel } from "@/lib/sources/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NOT_CHECKED_DEFAULT = [
  "Contract of sale",
  "Building and pest report",
  "Strata records (if apartment)",
  "Flood / bushfire insurance quote",
  "Conveyancer review",
];

interface WhatWeCheckedReceiptProps {
  scan: PropertyScanResult;
  extraNotChecked?: string[];
}

export function WhatWeCheckedReceipt({
  scan,
  extraNotChecked = [],
}: WhatWeCheckedReceiptProps) {
  const checked = [
    "Nearby development applications (area scan)",
    "Infrastructure signals in scan radius",
    "Zoning context from available records",
  ];

  const notChecked = [...NOT_CHECKED_DEFAULT, ...extraNotChecked];

  const source = dataSourceToLabel(scan.dataSource, scan.dataSource === "database");

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-lg">What we checked</CardTitle>
          <SourceBadge source={source} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="font-label-caps text-evidence-known">Checked</p>
          <ul className="mt-2 space-y-1.5 text-sm text-on-surface-variant">
            {checked.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-evidence-known">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-label-caps text-evidence-missing">Not checked yet</p>
          <ul className="mt-2 space-y-1.5 text-sm text-on-surface-variant">
            {notChecked.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-on-surface-variant">—</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-on-surface-variant">
            Missing data is not the same as no issue. Grey is not green.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
