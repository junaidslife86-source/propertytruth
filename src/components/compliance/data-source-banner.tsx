"use client";

import { AlertTriangle, Info } from "lucide-react";
import type { PropertyScanResult } from "@/lib/schemas";
import { SourceBadge } from "@/components/compliance/source-badge";
import { dataSourceToLabel } from "@/lib/sources/types";
import { isTestingModeClient } from "@/lib/config/app-mode";

export function DataSourceBanner({ scan }: { scan: PropertyScanResult }) {
  const label = dataSourceToLabel(
    scan.dataSource,
    scan.dataSource === "database",
  );
  const isDemo = scan.dataSource === "demo";

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        isDemo
          ? "border-evidence-verify/40 bg-evidence-verify/10"
          : "border-outline-variant/40 bg-surface-container-low"
      }`}
    >
      {isDemo ? (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-evidence-verify" />
      ) : (
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
      )}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <SourceBadge source={label} />
          {isTestingModeClient() && (
            <span className="font-label-caps text-on-surface-variant">
              Testing build
            </span>
          )}
        </div>
        <p className="text-on-surface-variant">
          {isDemo
            ? "This scan uses labelled demo sample data — not verified planning records for this address. Run Firestore NSW seed or connect live feeds before public launch."
            : "Planning signals are from seeded NSW sample records in Firestore (testing). Verify against official council and NSW Planning sources before relying on them."}
        </p>
      </div>
    </div>
  );
}
