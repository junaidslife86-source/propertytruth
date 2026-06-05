import { z } from "zod";

export const geocodeRequestSchema = z.object({
  placeId: z.string().min(1).optional(),
  address: z.string().min(3).optional(),
}).refine((d) => d.placeId || d.address, {
  message: "placeId or address required",
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

export const riskIndicatorSchema = z.object({
  id: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  title: z.string(),
  description: z.string(),
  source: z.string().optional(),
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
  riskIndicators: z.array(riskIndicatorSchema),
  quickSummary: z.string(),
  dataSource: z.enum(["database", "demo"]),
  scannedAt: z.string(),
});

export type PropertyScanResult = z.infer<typeof propertyScanResultSchema>;
export type Development = z.infer<typeof developmentSchema>;
export type Infrastructure = z.infer<typeof infrastructureSchema>;
export type RiskIndicator = z.infer<typeof riskIndicatorSchema>;

export const aiInsightRequestSchema = z.object({
  propertyId: z.string().uuid(),
});

export const aiInsightResponseSchema = z.object({
  summary: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
  sources: z.array(z.string()),
  disclaimer: z.string(),
});
