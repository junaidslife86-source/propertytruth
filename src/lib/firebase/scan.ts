import type { Firestore } from "firebase-admin/firestore";
import { buildDemoScanResult } from "@/lib/data/demo-data";
import { computeRiskIndicators } from "@/lib/data/risk-engine";
import { buildBuyerRiskSnapshot } from "@/lib/risk/signals";
import {
  developmentSchema,
  infrastructureSchema,
  propertyScanResultSchema,
  riskOverlaySchema,
  zoningSchema,
  type PropertyScanResult,
} from "@/lib/schemas";

function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function queryNearby<T extends { lat?: number; lng?: number }>(
  db: Firestore,
  collection: string,
  lat: number,
  lng: number,
  radiusMeters: number,
): Promise<T[]> {
  const snap = await db.collection(collection).get();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as T & { id: string })
    .filter((row) => {
      if (row.lat == null || row.lng == null) return false;
      return haversineMeters(lat, lng, row.lat, row.lng) <= radiusMeters;
    });
}

export async function scanPropertyWithFirebase(input: {
  formattedAddress: string;
  lat: number;
  lng: number;
  suburb?: string | null;
  postcode?: string | null;
  radiusMeters: number;
}): Promise<PropertyScanResult | null> {
  const { getAdminDb } = await import("@/lib/firebase/admin");
  const db = getAdminDb();
  if (!db) return null;

  const propertyRef = db.collection("properties").doc();
  await propertyRef.set({
    formattedAddress: input.formattedAddress,
    lat: input.lat,
    lng: input.lng,
    suburb: input.suburb ?? null,
    postcode: input.postcode ?? null,
    createdAt: new Date().toISOString(),
  });

  const [devRows, infraRows, zoningRows, overlayRows] = await Promise.all([
    queryNearby<Record<string, unknown>>(
      db,
      "developments",
      input.lat,
      input.lng,
      input.radiusMeters,
    ),
    queryNearby<Record<string, unknown>>(
      db,
      "infrastructure",
      input.lat,
      input.lng,
      input.radiusMeters * 2,
    ),
    queryNearby<Record<string, unknown>>(
      db,
      "zoning",
      input.lat,
      input.lng,
      2000,
    ),
    queryNearby<Record<string, unknown>>(
      db,
      "risk_overlays",
      input.lat,
      input.lng,
      0,
    ),
  ]);

  const hasSeedData =
    devRows.length + infraRows.length + zoningRows.length + overlayRows.length >
    0;

  if (!hasSeedData) {
    const demo = buildDemoScanResult(
      input.formattedAddress,
      input.lat,
      input.lng,
      input.suburb,
      input.postcode,
      input.radiusMeters,
    );
    await propertyRef.update({ scanSnapshot: demo });
    return { ...demo, propertyId: propertyRef.id, dataSource: "demo" };
  }

  const developments = devRows.map((d) => {
    const dist = haversineMeters(input.lat, input.lng, d.lat as number, d.lng as number);
    return developmentSchema.parse({
      id: d.id,
      council: d.council,
      application_number: d.application_number ?? d.applicationNumber,
      address: d.address,
      application_type: d.application_type ?? d.applicationType,
      development_type: d.development_type ?? d.developmentType,
      estimated_cost: d.estimated_cost ?? d.estimatedCost,
      lodged_date: d.lodged_date ?? d.lodgedDate,
      status: d.status,
      storeys: d.storeys,
      description: d.description,
      distance_meters: Math.round(dist),
      lat: d.lat,
      lng: d.lng,
    });
  });

  const infrastructure = infraRows.map((i) => {
    const dist = haversineMeters(input.lat, input.lng, i.lat as number, i.lng as number);
    return infrastructureSchema.parse({
      id: i.id,
      title: i.title,
      type: i.type,
      status: i.status,
      summary: i.summary,
      source: i.source,
      distance_meters: Math.round(dist),
    });
  });

  const zoning = zoningRows.map((z) =>
    zoningSchema.parse({
      id: z.id,
      zoning_type: z.zoning_type ?? z.zoningType,
      council: z.council,
    }),
  );

  const riskOverlays = overlayRows.map((o) =>
    riskOverlaySchema.parse({
      id: o.id,
      category: o.category,
      severity: o.severity ?? "medium",
      name: o.name,
      source: o.source ?? o.source_name ?? "NSW open data",
      source_url: o.source_url ?? o.sourceUrl,
      last_updated: o.last_updated ?? new Date().toISOString(),
    }),
  );

  const riskIndicators = computeRiskIndicators(
    developments,
    infrastructure,
    zoning,
  );
  const { buyerRiskSignals, confidenceScore } = buildBuyerRiskSnapshot(
    developments,
    infrastructure,
    zoning,
    riskOverlays,
  );

  const result: PropertyScanResult = {
    propertyId: propertyRef.id,
    formattedAddress: input.formattedAddress,
    suburb: input.suburb ?? undefined,
    postcode: input.postcode ?? undefined,
    lat: input.lat,
    lng: input.lng,
    radiusMeters: input.radiusMeters,
    developments,
    infrastructure,
    zoning,
    riskOverlays,
    riskIndicators,
    buyerRiskSignals,
    confidenceScore,
    quickSummary: confidenceScore.summary,
    dataSource: "database",
    scannedAt: new Date().toISOString(),
  };

  const parsed = propertyScanResultSchema.parse(result);
  await propertyRef.update({ scanSnapshot: parsed });
  return parsed;
}
