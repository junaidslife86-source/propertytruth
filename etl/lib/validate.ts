import { z } from "zod";

export const developmentApplicationRowSchema = z.object({
  council: z.string().min(1),
  application_number: z.string().min(1),
  address: z.string().optional(),
  application_type: z.string().optional(),
  development_type: z.string().optional(),
  estimated_cost: z.number().optional(),
  lodged_date: z.string().optional(),
  status: z.string().optional(),
  storeys: z.number().int().optional(),
  description: z.string().optional(),
  lng: z.number(),
  lat: z.number(),
  raw_source_data: z.record(z.string(), z.unknown()).optional(),
});

export const geoJsonFeatureCollectionSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(
    z.object({
      type: z.literal("Feature"),
      properties: z.record(z.string(), z.unknown()),
      geometry: z
        .object({
          type: z.string(),
          coordinates: z.unknown(),
        })
        .passthrough(),
    }),
  ),
});

export type DevelopmentApplicationRow = z.infer<
  typeof developmentApplicationRowSchema
>;
