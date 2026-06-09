"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, ClipboardCheck } from "lucide-react";
import type { PropertyScanResult } from "@/lib/schemas";
import { propertyScanResultSchema } from "@/lib/schemas";
import { DueDiligenceCoverageCard } from "@/components/due-diligence/due-diligence-coverage-card";
import { MissingChecksPanel } from "@/components/compliance/missing-checks-panel";
import { ProfessionalReviewGate } from "@/components/compliance/professional-review-gate";
import { PreOfferChecklistCard } from "@/components/buyer/offer-readiness-card";
import { OwnershipCostSimulator } from "@/components/buyer/ownership-cost-simulator";
import { PropertyDna } from "@/components/buyer/property-dna";
import { RiskSignalGrid } from "@/components/buyer/risk-signal-grid";
import { PaidReportPreview } from "@/components/buyer/paid-report-preview";
import { DevelopmentFeed } from "@/components/development-feed";
import { NearbyChangesPanel } from "@/components/nearby-changes-panel";
import { AIInsightCard } from "@/components/ai-insight-card";
import { AddToCompareButton } from "@/components/add-to-compare-button";
import { ShortlistButton } from "@/components/buyer/shortlist-button";
import { BuyerJourneyTimeline } from "@/components/buyer/buyer-journey-timeline";
import { DueDiligenceTracker } from "@/components/buyer/due-diligence-tracker";
import {
  PropertyReportTabPanel,
  PropertyReportTabs,
  type PropertyReportTab,
} from "@/components/property/property-report-tabs";
import { calculateDueDiligenceCoverage } from "@/lib/due-diligence/coverage";
import { ReportPageSkeleton } from "@/components/skeleton-loaders";
import dynamic from "next/dynamic";
import { MapSkeleton } from "@/components/skeleton-loaders";
import { authHeaders } from "@/lib/auth/api-headers";
import { DataSourceBanner } from "@/components/compliance/data-source-banner";
import { ProfessionalQuestionsCard } from "@/components/property/professional-questions-card";
import { synthesizeProfessionalQuestions } from "@/lib/synthesis/questions";
import { parseJsonResponse } from "@/lib/api/parse-response";
import { isDemoDataAllowedClient } from "@/lib/config/app-mode";
import { buildDemoScanResult } from "@/lib/data/demo-data";
import { calculateJourneyProgress } from "@/lib/journey/progress";
import { calculateOfferReadiness } from "@/lib/offer/readiness";
import { buildPropertyDna } from "@/lib/property-dna/build";
import { useDueDiligenceStore } from "@/stores/due-diligence-store";
import { useInspectionStore } from "@/stores/inspection-store";
import type { DueDiligenceItem } from "@/lib/due-diligence/types";

const EMPTY_DD_ITEMS: DueDiligenceItem[] = [];

const InteractiveMap = dynamic(
  () => import("@/components/interactive-map").then((m) => m.InteractiveMap),
  { ssr: false, loading: () => <MapSkeleton /> },
);

export default function PropertyReportPage() {
  const params = useParams();
  const id = decodeURIComponent(params.id as string);
  const [scan, setScan] = useState<PropertyScanResult | null>(null);
  const [propertyCaseId, setPropertyCaseId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<PropertyReportTab>("overview");

  const initDD = useDueDiligenceStore((s) => s.initProperty);
  const byProperty = useDueDiligenceStore((s) => s.byProperty);
  const updateDD = useDueDiligenceStore((s) => s.updateItem);
  const inspections = useInspectionStore((s) => s.inspections);

  const ddItems = useMemo(
    () =>
      scan ? (byProperty[scan.propertyId] ?? EMPTY_DD_ITEMS) : EMPTY_DD_ITEMS,
    [byProperty, scan],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);

      const cached = sessionStorage.getItem(`scan:${id}`);
      if (cached) {
        try {
          const parsed = propertyScanResultSchema.parse(JSON.parse(cached));
          if (!cancelled) {
            setScan(parsed);
            setPropertyCaseId(sessionStorage.getItem(`case:${id}`));
            initDD(parsed.propertyId);
          }
          setLoading(false);
          return;
        } catch {
          sessionStorage.removeItem(`scan:${id}`);
        }
      }

      try {
        const res = await fetch(`/api/property-cases/${encodeURIComponent(id)}`, {
          headers: await authHeaders(),
        });
        if (res.ok) {
          const data = await parseJsonResponse<{
            scan: PropertyScanResult | null;
            case: { id: string };
          }>(res);
          if (data.scan && !cancelled) {
            setScan(data.scan);
            setPropertyCaseId(data.case.id);
            initDD(data.scan.propertyId);
            sessionStorage.setItem(`scan:${id}`, JSON.stringify(data.scan));
            sessionStorage.setItem(`case:${id}`, data.case.id);
            setLoading(false);
            return;
          }
        }
      } catch {
        /* fall through */
      }

      if (isDemoDataAllowedClient()) {
        const demo = buildDemoScanResult(
          "Sample address — reload after signing in",
          -33.8688,
          151.2093,
        );
        if (!cancelled) {
          setScan({ ...demo, propertyId: id, dataSource: "demo" });
          initDD(id);
        }
      } else if (!cancelled) {
        setLoadError("Property report not found. Run a new scan from the home page.");
      }
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id, initDD]);

  const hasInspection = useMemo(
    () =>
      scan
        ? inspections.some(
            (i) =>
              (i.status === "completed" || i.status === "in_progress") &&
              i.propertyAddress === scan.formattedAddress,
          )
        : false,
    [inspections, scan],
  );

  const journey = useMemo(
    () => (scan ? calculateJourneyProgress(scan, ddItems, hasInspection) : []),
    [scan, ddItems, hasInspection],
  );

  const coverage = useMemo(
    () =>
      scan
        ? calculateDueDiligenceCoverage(scan, ddItems, { hasInspection })
        : null,
    [scan, ddItems, hasInspection],
  );

  const offerReadiness = useMemo(
    () => (scan ? calculateOfferReadiness(scan, ddItems, hasInspection) : null),
    [scan, ddItems, hasInspection],
  );

  const dna = useMemo(
    () => (scan ? buildPropertyDna(scan) : []),
    [scan],
  );

  const professionalQuestions = useMemo(
    () => (scan ? synthesizeProfessionalQuestions(scan, ddItems) : []),
    [scan, ddItems],
  );

  if (loading) {
    return <ReportPageSkeleton />;
  }

  if (!scan || !offerReadiness || !coverage) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center">
        <p className="text-on-surface-variant">
          {loadError ?? "Unable to load this property report."}
        </p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-primary">
          New search
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl pb-24">
      <div className="px-5 pt-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            New search
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <ShortlistButton scan={scan} />
            <AddToCompareButton scan={scan} />
            <Link
              href="/inspection/new"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-outline-variant/40 bg-white px-3 text-sm"
            >
              <ClipboardCheck className="h-4 w-4" />
              Inspect
            </Link>
            <Link
              href={`/property/${encodeURIComponent(scan.propertyId)}/documents`}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-outline-variant/40 bg-white px-3 text-sm"
            >
              <FileText className="h-4 w-4" />
              Documents
            </Link>
            <Link
              href="/strata/upload"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-outline-variant/40 bg-white px-3 text-sm"
            >
              Strata scan
            </Link>
          </div>
        </div>

        <p className="font-label-caps text-on-surface-variant">
          Due diligence workspace
        </p>
        <h1 className="font-[family-name:var(--font-manrope)] text-2xl font-bold tracking-tight md:text-3xl">
          {scan.formattedAddress}
        </h1>
      </div>

      <div className="mt-6 space-y-4 px-5">
        <DataSourceBanner scan={scan} />
        <PropertyReportTabs active={tab} onChange={setTab} />
      </div>

      <div className="px-5">
        <PropertyReportTabPanel tab="overview" active={tab}>
          <DueDiligenceCoverageCard address={scan.formattedAddress} coverage={coverage} />
          <MissingChecksPanel items={coverage.missingItems} />
          <BuyerJourneyTimeline stages={journey} />
          <PropertyDna categories={dna} />
          <NearbyChangesPanel scan={scan} />
        </PropertyReportTabPanel>

        <PropertyReportTabPanel tab="issues" active={tab}>
          <RiskSignalGrid signals={scan.buyerRiskSignals} />
          <MissingChecksPanel items={coverage.missingItems} />
        </PropertyReportTabPanel>

        <PropertyReportTabPanel tab="map" active={tab}>
          <div className="overflow-hidden rounded-xl border border-outline-variant/30 shadow-sm">
            <InteractiveMap scan={scan} />
          </div>
          <DevelopmentFeed developments={scan.developments} />
        </PropertyReportTabPanel>

        <PropertyReportTabPanel tab="diligence" active={tab}>
          <DueDiligenceTracker
            items={ddItems}
            onUpdate={(itemId, status) =>
              updateDD(scan.propertyId, itemId, { status })
            }
          />
          <PreOfferChecklistCard readiness={offerReadiness} />
          <ProfessionalQuestionsCard questions={professionalQuestions} />
          <ProfessionalReviewGate />
          <OwnershipCostSimulator defaultPrice={950_000} />
        </PropertyReportTabPanel>

        <PropertyReportTabPanel tab="report" active={tab}>
          <PaidReportPreview scan={scan} propertyCaseId={propertyCaseId} />
          <AIInsightCard scan={scan} />
        </PropertyReportTabPanel>
      </div>
    </div>
  );
}
