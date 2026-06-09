"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
import { BuyerJourneyTimeline } from "@/components/buyer/buyer-journey-timeline";
import { DueDiligenceTracker } from "@/components/buyer/due-diligence-tracker";
import { AuctionReadinessChecklist } from "@/components/buyer/auction-readiness-checklist";
import { FirstHomeBuyerBanner } from "@/components/buyer/first-home-buyer-banner";
import { PropertyPassportCard } from "@/components/property/property-passport";
import { WhatWeCheckedReceipt } from "@/components/property/what-we-checked-receipt";
import { QuestionsToAskPanel } from "@/components/property/questions-to-ask-panel";
import { PostScanPrioritiesCard } from "@/components/property/post-scan-priorities-card";
import { ClimateInsuranceRoadmap } from "@/components/property/climate-insurance-roadmap";
import { buildPostScanPriorities } from "@/lib/passport/post-scan-priorities";
import type { LinkedStrataDocument } from "@/lib/firebase/strata-cases";
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
import { synthesizeProfessionalQuestions } from "@/lib/synthesis/questions";
import { parseJsonResponse } from "@/lib/api/parse-response";
import { isDemoDataAllowedClient } from "@/lib/config/app-mode";
import { buildDemoScanResult } from "@/lib/data/demo-data";
import { calculateJourneyProgress } from "@/lib/journey/progress";
import { calculateOfferReadiness } from "@/lib/offer/readiness";
import { buildPropertyDna } from "@/lib/property-dna/build";
import { buildPropertyPassport } from "@/lib/passport/build";
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
  const [tab, setTab] = useState<PropertyReportTab>("summary");
  const [linkedStrata, setLinkedStrata] = useState<LinkedStrataDocument[]>([]);
  const [showPostScan, setShowPostScan] = useState(false);

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
        setLoadError("Property file not found. Start a new property file from home.");
      }
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id, initDD]);

  useEffect(() => {
    if (sessionStorage.getItem(`freshScan:${id}`) === "1") {
      setShowPostScan(true);
    }
  }, [id]);

  useEffect(() => {
    if (!propertyCaseId) return;
    let cancelled = false;

    async function loadStrata() {
      try {
        const res = await fetch(
          `/api/property-cases/${encodeURIComponent(propertyCaseId!)}/strata`,
          { headers: await authHeaders() },
        );
        if (!res.ok) return;
        const data = await parseJsonResponse<{ documents: LinkedStrataDocument[] }>(
          res,
        );
        if (!cancelled) setLinkedStrata(data.documents);
      } catch {
        /* optional */
      }
    }

    void loadStrata();
    return () => {
      cancelled = true;
    };
  }, [propertyCaseId]);

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

  const hasStrataScan = linkedStrata.length > 0;

  const coverage = useMemo(
    () =>
      scan
        ? calculateDueDiligenceCoverage(scan, ddItems, {
            hasInspection,
            hasStrataScan,
          })
        : null,
    [scan, ddItems, hasInspection, hasStrataScan],
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

  const passport = useMemo(() => {
    if (!scan || !coverage || !offerReadiness) return null;
    return buildPropertyPassport({
      scan,
      ddItems,
      coverage,
      offerReadiness,
      hasInspection,
      hasStrataScan,
      linkedStrata,
      questionCount: professionalQuestions.length,
    });
  }, [
    scan,
    ddItems,
    coverage,
    offerReadiness,
    hasInspection,
    hasStrataScan,
    linkedStrata,
    professionalQuestions.length,
  ]);

  const postScanPriorities = useMemo(
    () =>
      scan && coverage
        ? buildPostScanPriorities(scan, coverage, { hasStrataUpload: hasStrataScan })
        : [],
    [scan, coverage, hasStrataScan],
  );

  function dismissPostScan() {
    sessionStorage.removeItem(`freshScan:${id}`);
    setShowPostScan(false);
  }

  function navigateFromPriority(href: string) {
    const tabMap: Record<string, PropertyReportTab> = {
      map: "map",
      verify: "verify",
      climate: "summary",
    };
    setTab(tabMap[href] ?? "summary");
    dismissPostScan();
  }

  if (loading) {
    return <ReportPageSkeleton />;
  }

  if (!scan || !offerReadiness || !coverage || !passport) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center">
        <p className="text-on-surface-variant">
          {loadError ?? "Unable to load this property file."}
        </p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-primary">
          Start a property file
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl pb-24">
      <div className="px-5 pt-8">
        <Link
          href="/properties"
          className="mb-6 inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          My properties
        </Link>
      </div>

      <div className="space-y-4 px-5">
        <FirstHomeBuyerBanner />
        <DataSourceBanner scan={scan} />
        {showPostScan && (
          <PostScanPrioritiesCard
            priorities={postScanPriorities}
            onDismiss={dismissPostScan}
            onNavigateTab={navigateFromPriority}
          />
        )}
        <PropertyPassportCard
          address={scan.formattedAddress}
          passport={passport}
          propertyCaseId={propertyCaseId}
          onGoToQuestions={() => setTab("questions")}
          onGoToVerify={() => setTab("verify")}
        />
        <PropertyReportTabs active={tab} onChange={setTab} />
      </div>

      <div className="px-5">
        <PropertyReportTabPanel tab="summary" active={tab}>
          <BuyerJourneyTimeline stages={journey} />
          <ClimateInsuranceRoadmap scan={scan} />
          <WhatWeCheckedReceipt scan={scan} />
          <DueDiligenceCoverageCard address={scan.formattedAddress} coverage={coverage} />
          <PropertyDna categories={dna} />
          <NearbyChangesPanel scan={scan} />
          <AIInsightCard scan={scan} />
        </PropertyReportTabPanel>

        <PropertyReportTabPanel tab="risks" active={tab}>
          <RiskSignalGrid signals={scan.buyerRiskSignals} />
          <MissingChecksPanel items={coverage.missingItems} />
        </PropertyReportTabPanel>

        <PropertyReportTabPanel tab="map" active={tab}>
          <div className="overflow-hidden rounded-xl border border-outline-variant/30 shadow-sm">
            <InteractiveMap scan={scan} />
          </div>
          <DevelopmentFeed developments={scan.developments} />
        </PropertyReportTabPanel>

        <PropertyReportTabPanel tab="verify" active={tab}>
          <DueDiligenceTracker
            items={ddItems}
            onUpdate={(itemId, status) =>
              updateDD(scan.propertyId, itemId, { status })
            }
          />
          <AuctionReadinessChecklist />
          <PreOfferChecklistCard readiness={offerReadiness} />
          <ProfessionalReviewGate />
          <PaidReportPreview scan={scan} propertyCaseId={propertyCaseId} />
        </PropertyReportTabPanel>

        <PropertyReportTabPanel tab="questions" active={tab}>
          <QuestionsToAskPanel questions={professionalQuestions} />
        </PropertyReportTabPanel>

        <PropertyReportTabPanel tab="costs" active={tab}>
          <OwnershipCostSimulator defaultPrice={950_000} />
          <p className="text-xs text-on-surface-variant">
            Household affordability estimate only — not tax, investment, or loan
            advice. Strata levies and special levies can change; confirm with your
            broker and strata manager.
          </p>
        </PropertyReportTabPanel>
      </div>
    </div>
  );
}
