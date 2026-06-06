import type { PropertyScanResult } from "@/lib/schemas";
import { buildBuyerRiskSnapshot } from "@/lib/risk/signals";

const SYDNEY_CBD = { lat: -33.8688, lng: 151.2093 };

/** Demo scan for local dev without Firebase seed data */
export function buildDemoScanResult(
  formattedAddress: string,
  lat: number,
  lng: number,
  suburb?: string | null,
  postcode?: string | null,
  radiusMeters = 500,
): PropertyScanResult {
  const propertyId = `demo-${Buffer.from(`${lat},${lng}`).toString("base64url").slice(0, 12)}`;

  const developments = [
    {
      id: "da-1",
      council: "City of Sydney",
      application_number: "DA-2024-00142",
      address: "120 George Street, Sydney",
      application_type: "Development Application",
      development_type: "Mixed-use",
      estimated_cost: 45_000_000,
      lodged_date: "2024-03-15",
      status: "Under assessment",
      storeys: 12,
      description: "Mixed-use tower with retail podium",
      distance_meters: 180,
      lat: SYDNEY_CBD.lat + 0.001,
      lng: SYDNEY_CBD.lng + 0.001,
    },
    {
      id: "da-2",
      council: "City of Sydney",
      application_number: "DA-2024-00089",
      address: "45 Pitt Street, Sydney",
      application_type: "Modification",
      development_type: "Residential",
      estimated_cost: 12_000_000,
      lodged_date: "2024-01-22",
      status: "Approved",
      storeys: 8,
      description: "Boutique residential apartments",
      distance_meters: 320,
      lat: SYDNEY_CBD.lat - 0.0008,
      lng: SYDNEY_CBD.lng - 0.0005,
    },
    {
      id: "da-3",
      council: "Inner West Council",
      application_number: "DA-2023-04521",
      address: "88 King Street, Newtown",
      application_type: "Development Application",
      development_type: "Medium density",
      estimated_cost: 8_500_000,
      lodged_date: "2023-11-08",
      status: "Under assessment",
      storeys: 6,
      description: "Medium-density residential with ground-floor retail",
      distance_meters: 410,
      lat: lat - 0.002,
      lng: lng - 0.003,
    },
  ];

  const infrastructure = [
    {
      id: "infra-1",
      title: "CBD Metro Line upgrade",
      type: "Transport",
      status: "Planning",
      summary: "Station accessibility and concourse expansion works",
      source: "Transport for NSW (demo)",
      distance_meters: 450,
    },
    {
      id: "infra-2",
      title: "George Street public domain improvements",
      type: "Streetscape",
      status: "In progress",
      summary: "Pedestrian priority and tree planting program",
      source: "City of Sydney (demo)",
      distance_meters: 220,
    },
  ];

  const zoning = [
    {
      id: "zone-1",
      zoning_type: "B8 Metropolitan Centre",
      council: "City of Sydney",
    },
    {
      id: "zone-2",
      zoning_type: "Heritage conservation area",
      council: "City of Sydney",
    },
  ];

  const riskIndicators = [
    {
      id: "risk-1",
      severity: "high" as const,
      title: "Nearby high-rise DA",
      description:
        "A 12-storey mixed-use development application is under assessment roughly 180m away.",
      source: "DA-2024-00142",
    },
    {
      id: "risk-2",
      severity: "medium" as const,
      title: "Medium construction activity",
      description:
        "Several residential and mixed-use applications are active within 500m.",
      source: "NSW Planning records (demo)",
    },
    {
      id: "risk-3",
      severity: "medium" as const,
      title: "Transport upgrades planned",
      description:
        "Public transport and streetscape projects may change local access and noise patterns.",
      source: "Transport for NSW (demo)",
    },
    {
      id: "risk-4",
      severity: "low" as const,
      title: "Heritage overlay nearby",
      description:
        "Heritage controls in the area may influence neighbouring development character.",
      source: "City of Sydney LEP (demo)",
    },
  ];

  const riskOverlays = [
    {
      id: "overlay-flood-demo",
      category: "flood" as const,
      severity: "medium" as const,
      name: "Probable Maximum Flood — Harbour fringe (demo)",
      source: "NSW Department of Planning and Environment (demo)",
      source_url: "https://www.planningportal.nsw.gov.au/spatialviewer/",
      last_updated: new Date().toISOString(),
    },
  ];

  const { buyerRiskSignals, confidenceScore } = buildBuyerRiskSnapshot(
    developments,
    infrastructure,
    zoning,
    riskOverlays,
  );

  return {
    propertyId,
    formattedAddress,
    suburb: suburb ?? "Sydney",
    postcode: postcode ?? "2000",
    lat,
    lng,
    radiusMeters,
    developments,
    infrastructure,
    zoning,
    riskOverlays,
    riskIndicators,
    buyerRiskSignals,
    confidenceScore,
    quickSummary: confidenceScore.summary,
    dataSource: "demo",
    scannedAt: new Date().toISOString(),
  };
}
