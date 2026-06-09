"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Download, Loader2, Sparkles } from "lucide-react";
import type { PropertyScanResult } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authHeaders } from "@/lib/auth/api-headers";
import { parseJsonResponse } from "@/lib/api/parse-response";
import { toast } from "sonner";

interface PaidReportPreviewProps {
  scan: PropertyScanResult;
  propertyCaseId?: string | null;
}

const LOCKED_SECTIONS = [
  "Full environmental overlay analysis",
  "Strata red-flag deep dive",
  "Pre-offer checklist (PDF)",
  "Evidence appendix with source links",
  "Shareable link for conveyancer",
];

export function PaidReportPreview({ scan, propertyCaseId }: PaidReportPreviewProps) {
  const [loading, setLoading] = useState(false);

  async function handleUnlock() {
    if (!propertyCaseId) {
      toast.error("Sign in and save this property to unlock the report preview.");
      return;
    }

    setLoading(true);
    try {
      const checkoutRes = await fetch("/api/reports/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeaders()),
        },
        body: JSON.stringify({ propertyCaseId }),
      });
      const checkout = await parseJsonResponse<{ reportUrl?: string; message?: string }>(
        checkoutRes,
      );
      if (!checkoutRes.ok) {
        throw new Error((checkout as { error?: string }).error ?? "Checkout failed");
      }

      if (checkout.reportUrl) {
        const reportRes = await fetch(checkout.reportUrl, {
          headers: await authHeaders(),
        });
        const report = await parseJsonResponse(reportRes);
        if (!reportRes.ok) throw new Error("Report generation failed");

        const blob = new Blob([JSON.stringify(report, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `property-truth-report-${propertyCaseId}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(checkout.message ?? "Testing report downloaded (JSON preview).");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate report");
    } finally {
      setLoading(false);
    }
  }

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
              One-off PDF with due diligence coverage, known issues, checklist
              progress and suggested questions for professionals.
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
          — coverage snapshot ({scan.confidenceScore.label}).
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
          <Button
            className="gap-2"
            disabled={loading || !propertyCaseId}
            onClick={() => void handleUnlock()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {propertyCaseId ? "Download testing report" : "Sign in to unlock"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/strata/upload">Upload strata report</Link>
          </Button>
        </div>

        <p className="text-xs text-stone-400">
          Testing build: JSON preview only — Stripe checkout ships before public
          launch. Not legal, financial or building advice.
        </p>
      </CardContent>
    </Card>
  );
}
