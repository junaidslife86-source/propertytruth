"use client";

import { Train, Building2, Layers } from "lucide-react";
import type { PropertyScanResult } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistance } from "@/lib/utils";

interface NearbyChangesPanelProps {
  scan: PropertyScanResult;
}

export function NearbyChangesPanel({ scan }: NearbyChangesPanelProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-stone-500" />
            Developments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-stone-900">{scan.developments.length}</p>
          <p className="mt-1 text-sm text-stone-500">Applications within {scan.radiusMeters}m</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Train className="h-4 w-4 text-stone-500" />
            Infrastructure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-stone-900">{scan.infrastructure.length}</p>
          <p className="mt-1 text-sm text-stone-500">
            {scan.infrastructure[0]
              ? `${scan.infrastructure[0].title} · ${formatDistance(scan.infrastructure[0].distance_meters)}`
              : "None in current dataset"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-4 w-4 text-stone-500" />
            Zoning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-stone-600">
            {scan.zoning.length
              ? scan.zoning.map((z) => z.zoning_type).join(" · ")
              : "Zoning overlays will appear when council data is loaded."}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
