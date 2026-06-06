import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  propertyScanResultSchema,
  type PropertyScanResult,
} from "@/lib/schemas";

const MAX_COMPARE = 4;
const STORAGE_KEY = "propertytruth-compare";

type AddResult =
  | { ok: true; action: "added" | "updated" }
  | { ok: false; reason: "limit" };

interface CompareState {
  properties: PropertyScanResult[];
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addProperty: (scan: PropertyScanResult) => AddResult;
  removeProperty: (propertyId: string) => void;
  clearAll: () => void;
  isInCompare: (propertyId: string) => boolean;
}

function parseStoredProperties(raw: unknown): PropertyScanResult[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item) => {
    const parsed = propertyScanResultSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      properties: [],
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),

      addProperty: (scan) => {
        const validated = propertyScanResultSchema.parse(scan);
        const existing = get().properties;
        const index = existing.findIndex(
          (p) => p.propertyId === validated.propertyId,
        );

        if (index >= 0) {
          const next = [...existing];
          next[index] = validated;
          set({ properties: next });
          return { ok: true, action: "updated" };
        }

        if (existing.length >= MAX_COMPARE) {
          return { ok: false, reason: "limit" };
        }

        set({ properties: [...existing, validated] });
        return { ok: true, action: "added" };
      },

      removeProperty: (propertyId) => {
        set({
          properties: get().properties.filter(
            (p) => p.propertyId !== propertyId,
          ),
        });
      },

      clearAll: () => set({ properties: [] }),

      isInCompare: (propertyId) =>
        get().properties.some((p) => p.propertyId === propertyId),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ properties: state.properties }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.properties = parseStoredProperties(state.properties);
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);

export const MAX_COMPARE_PROPERTIES = MAX_COMPARE;
