"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { PropertyScanResult } from "@/lib/schemas";
import { propertyScanResultSchema } from "@/lib/schemas";
import { PropertyHero } from "@/components/property-hero";
import { RiskSummaryCard } from "@/components/risk-summary-card";
import { DevelopmentFeed } from "@/components/development-feed";
import { NearbyChangesPanel } from "@/components/nearby-changes-panel";
import { AIInsightCard } from "@/components/ai-insight-card";
import { SavePropertyButton } from "@/components/save-property-button";
import { ReportPageSkeleton } from "@/components/skeleton-loaders";
import dynamic from "next/dynamic";
import { MapSkeleton } from "@/components/skeleton-loaders";
import { buildDemoScanResult } from "@/lib/data/demo-data";

const InteractiveMap = dynamic(
  () => import("@/components/interactive-map").then((m) => m.InteractiveMap),
  { ssr: false, loading: () => <MapSkeleton /> },
);

export default function PropertyReportPage() {
  const params = useParams();
  const id = decodeURIComponent(params.id as string);
  const [scan, setScan] = useState<PropertyScanResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem(`scan:${id}`);
    if (cached) {
      try {
        const parsed = propertyScanResultSchema.parse(JSON.parse(cached));
        setScan(parsed);
        setLoading(false);
        return;
      } catch {
        sessionStorage.removeItem(`scan:${id}`);
      }
    }

    if (id.startsWith("demo-")) {
      const demo = buildDemoScanResult(
        "123 George Street, Sydney NSW 2000, Australia",
        -33.8688,
        151.2093,
      );
      setScan({ ...demo, propertyId: id });
      setLoading(false);
      return;
    }

    setScan(
      buildDemoScanResult(
        "123 George Street, Sydney NSW 2000, Australia",
        -33.8688,
        151.2093,
      ),
    );
    setLoading(false);
  }, [id]);

  if (loading || !scan) {
    return <ReportPageSkeleton />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"
        >
          <ArrowLeft className="h-4 w-4" />
          New search
        </Link>
        <SavePropertyButton scan={scan} />
      </div>

      <PropertyHero scan={scan} />
      <NearbyChangesPanel scan={scan} />
      <RiskSummaryCard indicators={scan.riskIndicators} />

      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-stone-900">
          Nearby developments
        </h2>
        <DevelopmentFeed developments={scan.developments} />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-stone-900">
          Area map
        </h2>
        <div className="overflow-hidden rounded-2xl border border-stone-200/80 shadow-sm">
          <InteractiveMap scan={scan} />
        </div>
      </section>

      <AIInsightCard scan={scan} />
    </div>
  );
}
