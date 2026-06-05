"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { PropertyScanResult } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { MapSkeleton } from "@/components/skeleton-loaders";

const InteractiveMap = dynamic(
  () => import("@/components/interactive-map").then((m) => m.InteractiveMap),
  { ssr: false, loading: () => <MapSkeleton /> },
);

interface PropertyHeroProps {
  scan: PropertyScanResult;
}

export function PropertyHero({ scan }: PropertyHeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="grid gap-8 lg:grid-cols-2 lg:items-start"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2 text-stone-500">
          <MapPin className="mt-1 h-4 w-4 shrink-0" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
              {scan.formattedAddress}
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              {[scan.suburb, scan.postcode].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
        <p className="max-w-xl text-base leading-relaxed text-stone-600">
          {scan.quickSummary}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">{scan.radiusMeters}m scan radius</Badge>
          {scan.dataSource === "demo" && (
            <Badge variant="medium">Demo data</Badge>
          )}
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 shadow-sm">
        <InteractiveMap
          scan={scan}
          compact
          className="h-[280px] lg:h-[320px]"
        />
      </div>
    </motion.section>
  );
}
