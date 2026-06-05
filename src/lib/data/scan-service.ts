import { createServiceClient } from "@/lib/supabase/server";
import { buildDemoScanResult } from "@/lib/data/demo-data";
import { computeRiskIndicators, buildQuickSummary } from "@/lib/data/risk-engine";
import {
  developmentSchema,
  infrastructureSchema,
  propertyScanResultSchema,
  zoningSchema,
  type PropertyScanResult,
} from "@/lib/schemas";
import { z } from "zod";

export async function scanPropertyArea(input: {
  formattedAddress: string;
  lat: number;
  lng: number;
  suburb?: string;
  postcode?: string;
  radiusMeters: number;
}): Promise<PropertyScanResult> {
  const supabase = createServiceClient();

  if (!supabase) {
    return buildDemoScanResult(
      input.formattedAddress,
      input.lat,
      input.lng,
      input.suburb,
      input.postcode,
      input.radiusMeters,
    );
  }

  const { data: property, error: propError } = await supabase
    .from("properties")
    .insert({
      formatted_address: input.formattedAddress,
      lat: input.lat,
      lng: input.lng,
      suburb: input.suburb,
      postcode: input.postcode,
      geometry: `SRID=4326;POINT(${input.lng} ${input.lat})`,
    })
    .select("id")
    .single();

  if (propError) {
    console.error("[scan] property insert failed, using demo", propError.message);
    return buildDemoScanResult(
      input.formattedAddress,
      input.lat,
      input.lng,
      input.suburb,
      input.postcode,
      input.radiusMeters,
    );
  }

  const { data: scanRaw, error: scanError } = await supabase.rpc(
    "scan_nearby_property",
    {
      p_lat: input.lat,
      p_lng: input.lng,
      p_radius_meters: input.radiusMeters,
    },
  );

  if (scanError || !scanRaw) {
    console.error("[scan] rpc failed, using demo", scanError?.message);
    const demo = buildDemoScanResult(
      input.formattedAddress,
      input.lat,
      input.lng,
      input.suburb,
      input.postcode,
      input.radiusMeters,
    );
    return { ...demo, propertyId: property.id };
  }

  const parsed = z
    .object({
      developments: z.array(z.unknown()).default([]),
      infrastructure: z.array(z.unknown()).default([]),
      zoning: z.array(z.unknown()).default([]),
    })
    .parse(scanRaw);

  const developments = parsed.developments.map((d) =>
    developmentSchema.parse({ ...(d as Record<string, unknown>) }),
  );
  const infrastructure = parsed.infrastructure.map((i) =>
    infrastructureSchema.parse({ ...(i as Record<string, unknown>) }),
  );
  const zoning = parsed.zoning.map((z) =>
    zoningSchema.parse({ ...(z as Record<string, unknown>) }),
  );

  const riskIndicators = computeRiskIndicators(
    developments,
    infrastructure,
    zoning,
  );

  const result: PropertyScanResult = {
    propertyId: property.id,
    formattedAddress: input.formattedAddress,
    suburb: input.suburb,
    postcode: input.postcode,
    lat: input.lat,
    lng: input.lng,
    radiusMeters: input.radiusMeters,
    developments,
    infrastructure,
    zoning,
    riskIndicators,
    quickSummary: buildQuickSummary(riskIndicators),
    dataSource: "database",
    scannedAt: new Date().toISOString(),
  };

  return propertyScanResultSchema.parse(result);
}
