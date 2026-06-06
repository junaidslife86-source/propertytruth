"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, ClipboardCheck } from "lucide-react";
import type { PropertyScanResult } from "@/lib/schemas";
import { propertyScanResultSchema } from "@/lib/schemas";
import { PropertyConfidenceCard } from "@/components/property-confidence-card";
import { DevelopmentFeed } from "@/components/development-feed";
import { NearbyChangesPanel } from "@/components/nearby-changes-panel";
import { AIInsightCard } from "@/components/ai-insight-card";
import { AddToCompareButton } from "@/components/add-to-compare-button";
import { ShortlistButton } from "@/components/buyer/shortlist-button";
import { BuyerJourneyTimeline } from "@/components/buyer/buyer-journey-timeline";
import { DueDiligenceTracker } from "@/components/buyer/due-diligence-tracker";
import { OfferReadinessCard } from "@/components/buyer/offer-readiness-card";
import { OwnershipCostSimulator } from "@/components/buyer/ownership-cost-simulator";
import { PropertyDna } from "@/components/buyer/property-dna";
import { RiskSignalGrid } from "@/components/buyer/risk-signal-grid";
import { PaidReportPreview } from "@/components/buyer/paid-report-preview";
import { ReportPageSkeleton } from "@/components/skeleton-loaders";
import dynamic from "next/dynamic";
import { MapSkeleton } from "@/components/skeleton-loaders";
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
  const [loading, setLoading] = useState(true);

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
    const cached = sessionStorage.getItem(`scan:${id}`);
    if (cached) {
      try {
        const parsed = propertyScanResultSchema.parse(JSON.parse(cached));
        setScan(parsed);
        initDD(parsed.propertyId);
        setLoading(false);
        return;
      } catch {
        sessionStorage.removeItem(`scan:${id}`);
      }
    }

    const demo = buildDemoScanResult(
      "123 George Street, Sydney NSW 2000, Australia",
      -33.8688,
      151.2093,
    );
    setScan({ ...demo, propertyId: id });
    initDD(id);
    setLoading(false);
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

  const offerReadiness = useMemo(
    () => (scan ? calculateOfferReadiness(scan, ddItems, hasInspection) : null),
    [scan, ddItems, hasInspection],
  );

  const dna = useMemo(
    () => (scan ? buildPropertyDna(scan) : []),
    [scan],
  );

  if (loading || !scan || !offerReadiness) {
    return <ReportPageSkeleton />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"
        >
          <ArrowLeft className="h-4 w-4" />
          New search
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <ShortlistButton scan={scan} />
          <AddToCompareButton scan={scan} />
          <Link
            href="/inspection/new"
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            <ClipboardCheck className="h-4 w-4" />
            Inspect
          </Link>
          <Link
            href={`/property/${encodeURIComponent(scan.propertyId)}/documents`}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            <FileText className="h-4 w-4" />
            Documents
          </Link>
          <Link
            href="/strata/upload"
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            <FileText className="h-4 w-4" />
            Strata AI
          </Link>
        </div>
      </div>

      <PropertyConfidenceCard
        address={scan.formattedAddress}
        confidence={scan.confidenceScore}
      />

      <section>
        <h2 className="mb-4 text-lg font-semibold text-stone-900">
          Buyer journey
        </h2>
        <BuyerJourneyTimeline stages={journey} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-stone-900">
          Property DNA
        </h2>
        <PropertyDna categories={dna} />
      </section>

      <OfferReadinessCard readiness={offerReadiness} />

      <RiskSignalGrid signals={scan.buyerRiskSignals} />

      <PaidReportPreview scan={scan} />

      <NearbyChangesPanel scan={scan} />

      <section>
        <h2 className="mb-4 text-lg font-semibold text-stone-900">
          Risk map
        </h2>
        <div className="overflow-hidden rounded-2xl border border-stone-200/80 shadow-sm">
          <InteractiveMap scan={scan} />
        </div>
      </section>

      <DueDiligenceTracker
        items={ddItems}
        onUpdate={(itemId, status) =>
          updateDD(scan.propertyId, itemId, { status })
        }
      />

      <OwnershipCostSimulator defaultPrice={950_000} />

      <section>
        <h2 className="mb-4 text-lg font-semibold text-stone-900">
          Nearby developments
        </h2>
        <DevelopmentFeed developments={scan.developments} />
      </section>

      <AIInsightCard scan={scan} />
    </div>
  );
}
