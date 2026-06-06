"use client";

import Link from "next/link";
import { Lock, Download, Sparkles } from "lucide-react";
import type { PropertyScanResult } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PaidReportPreviewProps {
  scan: PropertyScanResult;
}

const LOCKED_SECTIONS = [
  "Full environmental overlay analysis",
  "Strata red-flag deep dive",
  "Pre-offer checklist (PDF)",
  "Evidence appendix with source links",
  "Shareable link for conveyancer",
];

export function PaidReportPreview({ scan }: PaidReportPreviewProps) {
  return (
    <Card className="overflow-hidden border-stone-200/80">
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 px-6 py-8 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge className="mb-3 bg-white/10 text-white hover:bg-white/10">
              Full Buyer Report
            </Badge>
            <h2 className="text-xl font-semibold tracking-tight">
              Property Truth Report
            </h2>
            <p className="mt-2 max-w-md text-sm text-stone-300">
              Download a PDF with due diligence coverage, known issues,
              checklist progress and suggested questions for professionals.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>
        <p className="mt-6 text-3xl font-semibold tabular-nums">
          $29{" "}
          <span className="text-base font-normal text-stone-400">AUD</span>
        </p>
      </div>

      <CardContent className="space-y-4 p-6">
        <p className="text-sm text-stone-500">
          Preview for{" "}
          <span className="font-medium text-stone-800">
            {scan.formattedAddress}
          </span>{" "}
          — coverage snapshot from public data checked (
          {scan.confidenceScore.label}).
        </p>

        <ul className="space-y-2">
          {LOCKED_SECTIONS.map((section) => (
            <li
              key={section}
              className="flex items-center gap-2 text-sm text-stone-600"
            >
              <Lock className="h-4 w-4 shrink-0 text-stone-400" />
              {section}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button disabled className="gap-2">
            <Download className="h-4 w-4" />
            Unlock full report
          </Button>
          <Button variant="outline" asChild>
            <Link href="/strata/upload">Try strata red flag scan (demo)</Link>
          </Button>
        </div>

        <p className="text-xs text-stone-400">
          Stripe checkout coming soon. Free workspace includes coverage tracking
          and public-data signals. Not legal, financial or building advice.
        </p>
      </CardContent>
    </Card>
  );
}
