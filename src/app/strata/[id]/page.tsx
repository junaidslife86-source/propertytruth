"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { StrataFindingsList } from "@/components/strata/findings-list";
import { StrataAskPanel } from "@/components/strata/ask-panel";
import { StrataSummaryCard } from "@/components/strata/strata-summary-card";
import { StrataProcessingTimeline } from "@/components/strata/strata-processing-timeline";
import { StrataSectionCoverage } from "@/components/strata/strata-section-coverage";
import { Badge } from "@/components/ui/badge";
import type { StrataDocument } from "@/lib/strata/schemas";
import type { ProcessingStatus } from "@/lib/strata/processing-status";
import { STRATA_DISCLAIMER } from "@/lib/strata/schemas";

export default function StrataReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [document, setDocument] = useState<StrataDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] =
    useState<ProcessingStatus>("queued");

  const loadDocument = useCallback(async () => {
    const res = await fetch(`/api/strata/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to load");
    setDocument(data);
    if (data.processingStatus) setProcessingStatus(data.processingStatus);
    return data as StrataDocument & { processingStatus?: ProcessingStatus };
  }, [id]);

  useEffect(() => {
    async function init() {
      try {
        const data = await loadDocument();
        if (
          data.processingStatus &&
          data.processingStatus !== "complete" &&
          data.processingStatus !== "failed"
        ) {
          const poll = setInterval(async () => {
            const statusRes = await fetch(`/api/strata/${id}/status`);
            const statusData = await statusRes.json();
            if (statusRes.ok) {
              setProcessingStatus(statusData.processingStatus);
              if (statusData.ready) {
                clearInterval(poll);
                await loadDocument();
                setLoading(false);
              } else if (statusData.processingStatus === "failed") {
                clearInterval(poll);
                setError(statusData.errorMessage ?? "Processing failed");
                setLoading(false);
              }
            }
          }, 3000);
          return () => clearInterval(poll);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, [id, loadDocument]);

  if (loading && !document) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-stone-400" />
        <p className="mt-4 text-sm text-stone-500">Analysing strata report…</p>
        <div className="mx-auto mt-6 max-w-md">
          <StrataProcessingTimeline status={processingStatus} />
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-lg font-medium text-stone-900">Report not available</p>
        <p className="mt-2 text-sm text-stone-500">{error}</p>
        <Link
          href="/strata/upload"
          className="mt-6 inline-block text-sm text-stone-600 underline"
        >
          Upload a report
        </Link>
      </div>
    );
  }

  const isProcessing =
    document.processingStatus &&
    document.processingStatus !== "complete" &&
    document.processingStatus !== "failed";

  const highCount = document.findings.filter((f) => f.severity === "high").length;

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-6 pb-24">
      <Link
        href="/strata/upload"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Upload another
      </Link>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <FileText className="mt-1 h-5 w-5 shrink-0 text-stone-500" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl">
              {document.filename}
            </h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="default">{document.status}</Badge>
              {document.pageCount != null && (
                <Badge variant="default">{document.pageCount} pages</Badge>
              )}
              {document.extractionMethod && (
                <Badge variant="default">{document.extractionMethod}</Badge>
              )}
              {highCount > 0 && (
                <Badge variant="high">{highCount} notable finding(s)</Badge>
              )}
            </div>
          </div>
        </div>

        <p className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3 text-sm leading-relaxed text-stone-700">
          {STRATA_DISCLAIMER}
        </p>
      </div>

      {isProcessing && (
        <StrataProcessingTimeline status={processingStatus} />
      )}

      {document.summary && (
        <>
          <StrataSummaryCard summary={document.summary} />
          <StrataSectionCoverage
            coverage={document.summary.sectionCoverage}
            detectedSections={document.summary.detectedSections}
          />
        </>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-stone-900">
          Evidence-backed findings
        </h2>
        <StrataFindingsList findings={document.findings} />
      </section>

      {document.status === "ready" && document.processingStatus === "complete" && (
        <StrataAskPanel documentId={document.id} />
      )}
    </div>
  );
}
