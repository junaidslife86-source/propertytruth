import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Dealbreaker =
  | "flood_risk"
  | "bushfire_risk"
  | "aircraft_noise"
  | "high_strata"
  | "special_levies"
  | "water_ingress"
  | "major_nearby_da"
  | "heritage_restrictions"
  | "high_ownership_cost";

export type BuyerJourneyType =
  | "first_home"
  | "next_home"
  | "apartment_strata"
  | "investment";

export const BUYER_JOURNEY_LABELS: Record<BuyerJourneyType, string> = {
  first_home: "First home",
  next_home: "Next home",
  apartment_strata: "Apartment / strata",
  investment: "Investment property",
};

export interface BuyerProfile {
  budgetMin?: number;
  budgetMax?: number;
  deposit?: number;
  monthlyComfortPayment?: number;
  propertyTypes: string[];
  targetSuburbs: string[];
  riskAppetite: "cautious" | "balanced" | "adventurous";
  firstHomeBuyer: boolean;
  buyerJourneyType?: BuyerJourneyType;
  dealbreakers: Dealbreaker[];
  completedOnboarding: boolean;
}

interface BuyerProfileState {
  profile: BuyerProfile;
  updateProfile: (patch: Partial<BuyerProfile>) => void;
  resetProfile: () => void;
}

const DEFAULT_PROFILE: BuyerProfile = {
  propertyTypes: ["apartment", "house"],
  targetSuburbs: [],
  riskAppetite: "cautious",
  firstHomeBuyer: false,
  dealbreakers: [],
  completedOnboarding: false,
};

export const DEALBREAKER_LABELS: Record<Dealbreaker, string> = {
  flood_risk: "Flood risk",
  bushfire_risk: "Bushfire risk",
  aircraft_noise: "Aircraft noise",
  high_strata: "High strata levies",
  special_levies: "Special levies",
  water_ingress: "Water ingress",
  major_nearby_da: "Major nearby development",
  heritage_restrictions: "Heritage restrictions",
  high_ownership_cost: "High ownership cost",
};

export const useBuyerProfileStore = create<BuyerProfileState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      updateProfile: (patch) =>
        set((s) => ({ profile: { ...s.profile, ...patch } })),
      resetProfile: () => set({ profile: DEFAULT_PROFILE }),
    }),
    { name: "propertytruth-buyer-profile" },
  ),
);
