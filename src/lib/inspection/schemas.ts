import { z } from "zod";

export const propertyTypeSchema = z.enum([
  "apartment",
  "townhouse",
  "freestanding_house",
]);

export const roomTypeSchema = z.enum([
  "kitchen",
  "bathroom",
  "bedrooms",
  "balcony",
  "garage",
  "exterior",
  "common_areas",
]);

export const inspectionSeveritySchema = z.enum([
  "ok",
  "minor",
  "major",
  "not_checked",
]);

export const inspectionStatusSchema = z.enum([
  "draft",
  "in_progress",
  "completed",
]);

export const inspectionPhotoSchema = z.object({
  id: z.string(),
  storagePath: z.string().optional(),
  localPreviewUrl: z.string().optional(),
  caption: z.string().default(""),
  createdAt: z.string(),
});

export const inspectionItemSchema = z.object({
  id: z.string(),
  key: z.string(),
  label: z.string(),
  severity: inspectionSeveritySchema,
  notes: z.string().default(""),
  photos: z.array(inspectionPhotoSchema).default([]),
});

export const inspectionRoomSchema = z.object({
  roomType: roomTypeSchema,
  items: z.array(inspectionItemSchema),
});

export const inspectionSummarySchema = z.object({
  readinessScore: z.number().min(0).max(100),
  topConcerns: z.array(z.string()),
  missedChecks: z.array(z.string()),
  followUpQuestions: z.array(z.string()),
  checkedCount: z.number(),
  totalCount: z.number(),
});

export const inspectionSchema = z.object({
  id: z.string(),
  propertyAddress: z.string(),
  propertyType: propertyTypeSchema,
  selectedRooms: z.array(roomTypeSchema),
  rooms: z.array(inspectionRoomSchema),
  status: inspectionStatusSchema,
  summary: inspectionSummarySchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PropertyType = z.infer<typeof propertyTypeSchema>;
export type RoomType = z.infer<typeof roomTypeSchema>;
export type InspectionSeverity = z.infer<typeof inspectionSeveritySchema>;
export type InspectionStatus = z.infer<typeof inspectionStatusSchema>;
export type InspectionPhoto = z.infer<typeof inspectionPhotoSchema>;
export type InspectionItem = z.infer<typeof inspectionItemSchema>;
export type InspectionRoom = z.infer<typeof inspectionRoomSchema>;
export type InspectionSummary = z.infer<typeof inspectionSummarySchema>;
export type Inspection = z.infer<typeof inspectionSchema>;

export const createInspectionRequestSchema = z.object({
  propertyAddress: z.string().default(""),
  propertyType: propertyTypeSchema,
  selectedRooms: z.array(roomTypeSchema).min(1),
});

export const updateInspectionItemSchema = z.object({
  roomType: roomTypeSchema,
  itemId: z.string(),
  severity: inspectionSeveritySchema.optional(),
  notes: z.string().optional(),
});
