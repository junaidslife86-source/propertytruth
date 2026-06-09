/**
 * NSW-wide sample planning records for Firestore testing.
 * Labelled as seeded_sample in UI — not live council feeds.
 */
import type { Firestore } from "firebase-admin/firestore";

type SeedDevelopment = {
  id: string;
  council: string;
  application_number: string;
  address: string;
  application_type: string;
  development_type: string;
  estimated_cost: number;
  lodged_date: string;
  status: string;
  storeys: number;
  description: string;
  lat: number;
  lng: number;
};

type SeedInfrastructure = {
  id: string;
  title: string;
  type: string;
  status: string;
  summary: string;
  source: string;
  lat: number;
  lng: number;
};

type SeedZoning = {
  id: string;
  zoning_type: string;
  council: string;
  lat: number;
  lng: number;
};

type SeedOverlay = {
  id: string;
  category: "flood" | "bushfire" | "heritage" | "aircraft_noise" | "contamination";
  severity: "low" | "medium" | "high";
  name: string;
  source: string;
  source_url?: string;
  lat: number;
  lng: number;
  overlayRadiusMeters: number;
};

export const NSW_SEED_DEVELOPMENTS: SeedDevelopment[] = [
  {
    id: "nsw-da-syd-001",
    council: "City of Sydney",
    application_number: "DA-2024-00142",
    address: "120 George Street, Sydney NSW",
    application_type: "Development Application",
    development_type: "Mixed-use",
    estimated_cost: 45_000_000,
    lodged_date: "2024-03-15",
    status: "Under assessment",
    storeys: 12,
    description: "Mixed-use tower with retail podium",
    lat: -33.8688,
    lng: 151.2093,
  },
  {
    id: "nsw-da-par-001",
    council: "City of Parramatta",
    application_number: "DA-2024-00891",
    address: "42 Church Street, Parramatta NSW",
    application_type: "Development Application",
    development_type: "Residential",
    estimated_cost: 28_000_000,
    lodged_date: "2024-02-10",
    status: "Under assessment",
    storeys: 18,
    description: "Residential tower above metro podium",
    lat: -33.815,
    lng: 151.003,
  },
  {
    id: "nsw-da-new-001",
    council: "City of Newcastle",
    application_number: "DA-2024-00312",
    address: "88 Hunter Street, Newcastle NSW",
    application_type: "Modification",
    development_type: "Mixed-use",
    estimated_cost: 15_000_000,
    lodged_date: "2024-01-20",
    status: "Approved",
    storeys: 10,
    description: "Heritage facade retention with new levels",
    lat: -32.9283,
    lng: 151.7817,
  },
  {
    id: "nsw-da-wol-001",
    council: "Wollongong City Council",
    application_number: "DA-2023-12004",
    address: "15 Crown Street, Wollongong NSW",
    application_type: "Development Application",
    development_type: "Residential",
    estimated_cost: 9_500_000,
    lodged_date: "2023-11-05",
    status: "Under assessment",
    storeys: 8,
    description: "Medium-density apartments near station",
    lat: -34.424,
    lng: 150.893,
  },
  {
    id: "nsw-da-gos-001",
    council: "Central Coast Council",
    application_number: "DA-2024-00456",
    address: "10 Mann Street, Gosford NSW",
    application_type: "Development Application",
    development_type: "Mixed-use",
    estimated_cost: 22_000_000,
    lodged_date: "2024-04-01",
    status: "Lodged",
    storeys: 14,
    description: "CBD revitalisation mixed-use",
    lat: -33.424,
    lng: 151.342,
  },
  {
    id: "nsw-da-cof-001",
    council: "Coffs Harbour City Council",
    application_number: "DA-2023-08901",
    address: "45 Harbour Drive, Coffs Harbour NSW",
    application_type: "Development Application",
    development_type: "Tourism",
    estimated_cost: 18_000_000,
    lodged_date: "2023-09-18",
    status: "Under assessment",
    storeys: 6,
    description: "Coastal hotel and conference facility",
    lat: -30.2963,
    lng: 153.1157,
  },
  {
    id: "nsw-da-wag-001",
    council: "Wagga Wagga City Council",
    application_number: "DA-2024-00201",
    address: "88 Baylis Street, Wagga Wagga NSW",
    application_type: "Development Application",
    development_type: "Commercial",
    estimated_cost: 6_200_000,
    lodged_date: "2024-03-28",
    status: "Lodged",
    storeys: 4,
    description: "Commercial hub with basement parking",
    lat: -35.1082,
    lng: 147.3598,
  },
  {
    id: "nsw-da-dub-001",
    council: "Dubbo Regional Council",
    application_number: "DA-2023-07712",
    address: "22 Macquarie Street, Dubbo NSW",
    application_type: "Development Application",
    development_type: "Residential",
    estimated_cost: 4_800_000,
    lodged_date: "2023-12-12",
    status: "Approved",
    storeys: 5,
    description: "Infill residential near hospital precinct",
    lat: -32.243,
    lng: 148.6048,
  },
  {
    id: "nsw-da-bat-001",
    council: "Bathurst Regional Council",
    application_number: "DA-2024-00118",
    address: "150 William Street, Bathurst NSW",
    application_type: "Modification",
    development_type: "Residential",
    estimated_cost: 3_100_000,
    lodged_date: "2024-02-22",
    status: "Under assessment",
    storeys: 4,
    description: "Heritage shop-top housing",
    lat: -33.4192,
    lng: 149.5775,
  },
  {
    id: "nsw-da-ora-001",
    council: "Orange City Council",
    application_number: "DA-2023-05590",
    address: "5 Byng Street, Orange NSW",
    application_type: "Development Application",
    development_type: "Mixed-use",
    estimated_cost: 7_400_000,
    lodged_date: "2023-10-30",
    status: "Lodged",
    storeys: 6,
    description: "Mixed retail and apartments",
    lat: -33.283,
    lng: 149.1004,
  },
  {
    id: "nsw-da-iww-001",
    council: "Inner West Council",
    application_number: "DA-2023-04521",
    address: "88 King Street, Newtown NSW",
    application_type: "Development Application",
    development_type: "Medium density",
    estimated_cost: 8_500_000,
    lodged_date: "2023-11-08",
    status: "Under assessment",
    storeys: 6,
    description: "Medium-density with ground-floor retail",
    lat: -33.8975,
    lng: 151.179,
  },
  {
    id: "nsw-da-pen-001",
    council: "Penrith City Council",
    application_number: "DA-2024-00670",
    address: "300 High Street, Penrith NSW",
    application_type: "Development Application",
    development_type: "Residential",
    estimated_cost: 19_000_000,
    lodged_date: "2024-04-12",
    status: "Lodged",
    storeys: 12,
    description: "Stadium precinct residential",
    lat: -33.751,
    lng: 150.694,
  },
];

export const NSW_SEED_INFRASTRUCTURE: SeedInfrastructure[] = [
  {
    id: "nsw-infra-metro-syd",
    title: "Sydney Metro City extension",
    type: "Transport",
    status: "Construction",
    summary: "Underground metro stations and line works",
    source: "Transport for NSW (seed)",
    lat: -33.868,
    lng: 151.207,
  },
  {
    id: "nsw-infra-metro-par",
    title: "Parramatta Light Rail Stage 2",
    type: "Transport",
    status: "Planning",
    summary: "Light rail corridor through Parramatta CBD",
    source: "Transport for NSW (seed)",
    lat: -33.814,
    lng: 151.001,
  },
  {
    id: "nsw-infra-hunter-ex",
    title: "Hunter Expressway upgrade",
    type: "Road",
    status: "Planning",
    summary: "Intersection and safety improvements",
    source: "Transport for NSW (seed)",
    lat: -32.93,
    lng: 151.75,
  },
  {
    id: "nsw-infra-illawarra",
    title: "South Coast rail service uplift",
    type: "Transport",
    status: "Planning",
    summary: "Additional services and stabling",
    source: "Transport for NSW (seed)",
    lat: -34.42,
    lng: 150.89,
  },
  {
    id: "nsw-infra-western-park",
    title: "Western Sydney parklands connector",
    type: "Open space",
    status: "Approved",
    summary: "Shared path and creek restoration",
    source: "NSW Planning (seed)",
    lat: -33.85,
    lng: 150.92,
  },
];

export const NSW_SEED_ZONING: SeedZoning[] = [
  { id: "nsw-zone-syd-b4", zoning_type: "B4 Mixed Use", council: "City of Sydney", lat: -33.8688, lng: 151.2093 },
  { id: "nsw-zone-par-e1", zoning_type: "E1 Local Centre", council: "City of Parramatta", lat: -33.815, lng: 151.003 },
  { id: "nsw-zone-new-r3", zoning_type: "R3 Medium Density", council: "City of Newcastle", lat: -32.9283, lng: 151.7817 },
  { id: "nsw-zone-wol-b2", zoning_type: "B2 Local Centre", council: "Wollongong", lat: -34.424, lng: 150.893 },
  { id: "nsw-zone-gos-sp2", zoning_type: "SP2 Infrastructure", council: "Central Coast", lat: -33.424, lng: 151.342 },
  { id: "nsw-zone-iww-r2", zoning_type: "R2 Low Density", council: "Inner West", lat: -33.8975, lng: 151.179 },
];

export const NSW_SEED_OVERLAYS: SeedOverlay[] = [
  {
    id: "nsw-ov-syd-flood",
    category: "flood",
    severity: "medium",
    name: "Sydney CBD flood planning area (sample)",
    source: "NSW SES sample layer",
    lat: -33.8688,
    lng: 151.2093,
    overlayRadiusMeters: 400,
  },
  {
    id: "nsw-ov-par-noise",
    category: "aircraft_noise",
    severity: "high",
    name: "ANEF 20 contour — Western Sydney (sample)",
    source: "Airservices Australia sample",
    lat: -33.815,
    lng: 151.003,
    overlayRadiusMeters: 1200,
  },
  {
    id: "nsw-ov-new-heritage",
    category: "heritage",
    severity: "medium",
    name: "Newcastle East heritage conservation (sample)",
    source: "Heritage NSW sample",
    lat: -32.9283,
    lng: 151.7817,
    overlayRadiusMeters: 350,
  },
  {
    id: "nsw-ov-wol-bush",
    category: "bushfire",
    severity: "high",
    name: "Illawarra bushfire prone land (sample)",
    source: "RFS sample layer",
    lat: -34.424,
    lng: 150.893,
    overlayRadiusMeters: 800,
  },
  {
    id: "nsw-ov-gos-flood",
    category: "flood",
    severity: "medium",
    name: "Brisbane Water flood planning (sample)",
    source: "NSW SES sample",
    lat: -33.424,
    lng: 151.342,
    overlayRadiusMeters: 600,
  },
  {
    id: "nsw-ov-cof-contam",
    category: "contamination",
    severity: "low",
    name: "Former industrial site register (sample)",
    source: "EPA NSW sample",
    lat: -30.2963,
    lng: 153.1157,
    overlayRadiusMeters: 250,
  },
];

export async function seedNswFirestore(
  db: Firestore,
): Promise<{ counts: Record<string, number> }> {
  const now = new Date().toISOString();
  const batch = db.batch();

  for (const d of NSW_SEED_DEVELOPMENTS) {
    batch.set(db.collection("developments").doc(d.id), { ...d, seeded: true, updatedAt: now });
  }
  for (const i of NSW_SEED_INFRASTRUCTURE) {
    batch.set(db.collection("infrastructure").doc(i.id), { ...i, seeded: true, updatedAt: now });
  }
  for (const z of NSW_SEED_ZONING) {
    batch.set(db.collection("zoning").doc(z.id), { ...z, seeded: true, updatedAt: now });
  }
  for (const o of NSW_SEED_OVERLAYS) {
    batch.set(db.collection("risk_overlays").doc(o.id), { ...o, seeded: true, last_updated: now, updatedAt: now });
  }

  await batch.commit();

  await db.collection("meta").doc("seed").set({
    region: "NSW",
    seededAt: now,
    collections: ["developments", "infrastructure", "zoning", "risk_overlays"],
    label: "seeded_sample",
  });

  return {
    counts: {
      developments: NSW_SEED_DEVELOPMENTS.length,
      infrastructure: NSW_SEED_INFRASTRUCTURE.length,
      zoning: NSW_SEED_ZONING.length,
      risk_overlays: NSW_SEED_OVERLAYS.length,
    },
  };
}
