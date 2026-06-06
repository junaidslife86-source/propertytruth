import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  propertyScanResultSchema,
  type PropertyScanResult,
} from "@/lib/schemas";

const STORAGE_KEY = "propertytruth-shortlist";

interface ShortlistState {
  properties: PropertyScanResult[];
  add: (scan: PropertyScanResult) => void;
  remove: (propertyId: string) => void;
  clear: () => void;
  has: (propertyId: string) => boolean;
}

export const useShortlistStore = create<ShortlistState>()(
  persist(
    (set, get) => ({
      properties: [],
      add: (scan) => {
        const validated = propertyScanResultSchema.parse(scan);
        const existing = get().properties.filter(
          (p) => p.propertyId !== validated.propertyId,
        );
        set({ properties: [validated, ...existing].slice(0, 20) });
      },
      remove: (propertyId) =>
        set({
          properties: get().properties.filter(
            (p) => p.propertyId !== propertyId,
          ),
        }),
      clear: () => set({ properties: [] }),
      has: (propertyId) =>
        get().properties.some((p) => p.propertyId === propertyId),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
