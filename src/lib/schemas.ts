import { z } from "zod";

export const geocodeRequestSchema = z.object({
  placeId: z.string().min(1).optional(),
  address: z.string().min(3).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
}).refine((d) => d.placeId || d.address || (d.lat != null && d.lng != null), {
  message: "placeId, address, or lat/lng required",
});

export const scanRequestSchema = z.object({
  formattedAddress: z.string().min(5),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  suburb: z.string().nullish(),
  postcode: z.string().nullish(),
  radiusMeters: z.coerce.number().int().min(100).max(2000).default(500),
});

export const placesAutocompleteSchema = z.object({
  input: z.string().min(2).max(200),
});

export const developmentSchema = z.object({
  id: z.string(),
  council: z.string(),
  application_number: z.string(),
  address: z.string().nullable().optional(),
  application_type: z.string().nullable().optional(),
  development_type: z.string().nullable().optional(),
  estimated_cost: z.number().nullable().optional(),
  lodged_date: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  storeys: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  distance_meters: z.number(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const infrastructureSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  status: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  distance_meters: z.number(),
});

export const zoningSchema = z.object({
  id: z.string(),
  zoning_type: z.string(),
  council: z.string().nullable().optional(),
});

export const riskOverlayCategorySchema = z.enum([
  "flood",
  "bushfire",
  "heritage",
  "aircraft_noise",
  "contamination",
]);

const geoPolygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
});

export const riskOverlaySchema = z.object({
  id: z.string(),
  category: riskOverlayCategorySchema,
  severity: z.enum(["low", "medium", "high"]),
  name: z.string(),
  source: z.string(),
  source_url: z.string().nullish(),
  last_updated: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  overlayRadiusMeters: z.number().optional(),
  geometry: geoPolygonSchema.optional(),
});

export const riskIndicatorSchema = z.object({
  id: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  title: z.string(),
  description: z.string(),
  source: z.string().optional(),
});

export const riskCategorySchema = z.enum([
  "planning",
  "flood",
  "bushfire",
  "noise",
  "strata",
  "inspection",
  "ownership_cost",
]);

export const riskSeveritySchema = z.enum(["low", "medium", "high", "unknown"]);

export const buyerRiskSignalSchema = z.object({
  id: z.string(),
  category: riskCategorySchema,
  severity: riskSeveritySchema,
  title: z.string(),
  plainEnglishSummary: z.string(),
  buyerQuestion: z.string(),
  evidenceSource: z.string(),
  sourceUrl: z.string().url().optional(),
  confidence: z.enum(["low", "medium", "high"]),
  lastUpdated: z.string(),
});

export const propertyConfidenceLabelSchema = z.enum([
  "strong",
  "cautious",
  "risky",
  "incomplete",
]);

export const propertyConfidenceScoreSchema = z.object({
  score: z.number().min(0).max(100),
  label: propertyConfidenceLabelSchema,
  summary: z.string(),
  blockers: z.array(z.string()),
  cautionItems: z.array(z.string()),
  positives: z.array(z.string()),
});

export const propertyScanResultSchema = z.object({
  propertyId: z.string(),
  formattedAddress: z.string(),
  suburb: z.string().optional(),
  postcode: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  radiusMeters: z.number(),
  developments: z.array(developmentSchema),
  infrastructure: z.array(infrastructureSchema),
  zoning: z.array(zoningSchema),
  riskOverlays: z.array(riskOverlaySchema),
  riskIndicators: z.array(riskIndicatorSchema),
  buyerRiskSignals: z.array(buyerRiskSignalSchema),
  confidenceScore: propertyConfidenceScoreSchema,
  quickSummary: z.string(),
  dataSource: z.enum(["database", "demo"]),
  scannedAt: z.string(),
});

export type PropertyScanResult = z.infer<typeof propertyScanResultSchema>;
export type Development = z.infer<typeof developmentSchema>;
export type Infrastructure = z.infer<typeof infrastructureSchema>;
export type RiskOverlay = z.infer<typeof riskOverlaySchema>;
export type RiskOverlayCategory = z.infer<typeof riskOverlayCategorySchema>;
export type RiskIndicator = z.infer<typeof riskIndicatorSchema>;
export type RiskCategory = z.infer<typeof riskCategorySchema>;
export type RiskSeverity = z.infer<typeof riskSeveritySchema>;
export type BuyerRiskSignal = z.infer<typeof buyerRiskSignalSchema>;
export type PropertyConfidenceScore = z.infer<typeof propertyConfidenceScoreSchema>;
export type PropertyConfidenceLabel = z.infer<typeof propertyConfidenceLabelSchema>;

export const aiInsightRequestSchema = z.object({
  propertyId: z.string().uuid(),
});

export const aiInsightResponseSchema = z.object({
  summary: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
  sources: z.array(z.string()),
  disclaimer: z.string(),
});
