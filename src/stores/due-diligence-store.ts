import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DueDiligenceItem } from "@/lib/due-diligence/types";
import { defaultDueDiligenceTemplate } from "@/lib/due-diligence/templates";
import { scheduleWorkspaceSync } from "@/lib/workspace/sync-client";

const STORAGE_KEY = "propertytruth-due-diligence";

const EMPTY_DD_ITEMS: DueDiligenceItem[] = [];

interface DueDiligenceState {
  byProperty: Record<string, DueDiligenceItem[]>;
  getItems: (propertyId: string) => DueDiligenceItem[];
  initProperty: (propertyId: string) => void;
  updateItem: (
    propertyId: string,
    itemId: string,
    patch: Partial<DueDiligenceItem>,
  ) => void;
}

export const useDueDiligenceStore = create<DueDiligenceState>()(
  persist(
    (set, get) => ({
      byProperty: {},
      getItems: (propertyId) =>
        get().byProperty[propertyId] ?? EMPTY_DD_ITEMS,
      initProperty: (propertyId) => {
        if (get().byProperty[propertyId]) return;
        set({
          byProperty: {
            ...get().byProperty,
            [propertyId]: defaultDueDiligenceTemplate(),
          },
        });
      },
      updateItem: (propertyId, itemId, patch) => {
        const items = get().getItems(propertyId);
        const nextByProperty = {
          ...get().byProperty,
          [propertyId]: items.map((i) =>
            i.id === itemId ? { ...i, ...patch } : i,
          ),
        };
        set({ byProperty: nextByProperty });
        scheduleWorkspaceSync({ dueDiligence: nextByProperty });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
