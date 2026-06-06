import { z } from "zod";

export const dealbreakerSchema = z.enum([
  "flood_risk",
  "bushfire_risk",
  "aircraft_noise",
  "high_strata",
  "special_levies",
  "water_ingress",
  "major_nearby_da",
  "heritage_restrictions",
  "high_ownership_cost",
]);

export const buyerProfileSchema = z.object({
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  deposit: z.number().optional(),
  monthlyComfortPayment: z.number().optional(),
  propertyTypes: z.array(z.string()),
  targetSuburbs: z.array(z.string()),
  riskAppetite: z.enum(["cautious", "balanced", "adventurous"]),
  firstHomeBuyer: z.boolean(),
  dealbreakers: z.array(dealbreakerSchema),
  completedOnboarding: z.boolean(),
});

export const userPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  productUpdates: z.boolean(),
  defaultScanRadiusMeters: z.number().min(100).max(5000),
  defaultStrataRetention: z.enum(["7d", "30d", "keep"]),
  mapStyle: z.enum(["default", "satellite"]),
  riskHighlightLevel: z.enum(["all", "medium_and_high"]),
});

export const userDocumentSchema = z.object({
  uid: z.string(),
  email: z.string().email().or(z.literal("")),
  displayName: z.string(),
  photoURL: z.string().nullable(),
  phone: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  preferences: userPreferencesSchema,
  buyerProfile: buyerProfileSchema,
  onboardingCompleted: z.boolean(),
});

export const userUpdateSchema = z
  .object({
    displayName: z.string().min(1).max(80).optional(),
    phone: z.string().max(30).nullable().optional(),
    preferences: userPreferencesSchema.partial().optional(),
    buyerProfile: buyerProfileSchema.partial().optional(),
    onboardingCompleted: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type UserDocument = z.infer<typeof userDocumentSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type UserBuyerProfile = z.infer<typeof buyerProfileSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  emailNotifications: true,
  productUpdates: false,
  defaultScanRadiusMeters: 500,
  defaultStrataRetention: "30d",
  mapStyle: "default",
  riskHighlightLevel: "medium_and_high",
};

export const DEFAULT_USER_BUYER_PROFILE: UserBuyerProfile = {
  propertyTypes: ["apartment", "house"],
  targetSuburbs: [],
  riskAppetite: "cautious",
  firstHomeBuyer: false,
  dealbreakers: [],
  completedOnboarding: false,
};
