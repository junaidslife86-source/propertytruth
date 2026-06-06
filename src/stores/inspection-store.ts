import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  inspectionSchema,
  type Inspection,
  type InspectionItem,
  type InspectionPhoto,
  type InspectionSeverity,
  type PropertyType,
  type RoomType,
} from "@/lib/inspection/schemas";
import { buildRoomChecklists } from "@/lib/inspection/checklists";
import { generateInspectionSummary } from "@/lib/inspection/summary";

const STORAGE_KEY = "propertytruth-inspections";

function newId(): string {
  return crypto.randomUUID();
}

function buildInspection(
  propertyAddress: string,
  propertyType: PropertyType,
  selectedRooms: RoomType[],
): Inspection {
  const now = new Date().toISOString();
  const checklist = buildRoomChecklists(propertyType, selectedRooms);

  const rooms: Inspection["rooms"] = selectedRooms.map((roomType) => ({
    roomType,
    items: checklist
      .filter((c) => c.roomType === roomType)
      .map((c) => ({
        id: newId(),
        key: c.key,
        label: c.label,
        severity: "not_checked" as const,
        notes: "",
        photos: [],
      })),
  }));

  return {
    id: newId(),
    propertyAddress,
    propertyType,
    selectedRooms,
    rooms,
    status: "in_progress",
    createdAt: now,
    updatedAt: now,
  };
}

interface InspectionState {
  inspections: Inspection[];
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  createInspection: (
    propertyAddress: string,
    propertyType: PropertyType,
    selectedRooms: RoomType[],
  ) => Inspection;
  getInspection: (id: string) => Inspection | undefined;
  updateItem: (
    inspectionId: string,
    roomType: RoomType,
    itemId: string,
    patch: Partial<Pick<InspectionItem, "severity" | "notes">>,
  ) => void;
  addPhoto: (
    inspectionId: string,
    roomType: RoomType,
    itemId: string,
    photo: Omit<InspectionPhoto, "id" | "createdAt">,
  ) => void;
  removePhoto: (
    inspectionId: string,
    roomType: RoomType,
    itemId: string,
    photoId: string,
  ) => void;
  completeInspection: (inspectionId: string) => Inspection | undefined;
  deleteInspection: (inspectionId: string) => void;
}

function parseStoredInspections(raw: unknown): Inspection[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    const parsed = inspectionSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export const useInspectionStore = create<InspectionState>()(
  persist(
    (set, get) => ({
      inspections: [],
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),

      createInspection: (propertyAddress, propertyType, selectedRooms) => {
        const inspection = buildInspection(
          propertyAddress,
          propertyType,
          selectedRooms,
        );
        set({ inspections: [inspection, ...get().inspections] });
        return inspection;
      },

      getInspection: (id) => get().inspections.find((i) => i.id === id),

      updateItem: (inspectionId, roomType, itemId, patch) => {
        set({
          inspections: get().inspections.map((inspection) => {
            if (inspection.id !== inspectionId) return inspection;
            return {
              ...inspection,
              updatedAt: new Date().toISOString(),
              rooms: inspection.rooms.map((room) => {
                if (room.roomType !== roomType) return room;
                return {
                  ...room,
                  items: room.items.map((item) =>
                    item.id === itemId ? { ...item, ...patch } : item,
                  ),
                };
              }),
            };
          }),
        });
      },

      addPhoto: (inspectionId, roomType, itemId, photo) => {
        const entry: InspectionPhoto = {
          ...photo,
          id: newId(),
          createdAt: new Date().toISOString(),
        };
        set({
          inspections: get().inspections.map((inspection) => {
            if (inspection.id !== inspectionId) return inspection;
            return {
              ...inspection,
              updatedAt: new Date().toISOString(),
              rooms: inspection.rooms.map((room) => {
                if (room.roomType !== roomType) return room;
                return {
                  ...room,
                  items: room.items.map((item) =>
                    item.id === itemId
                      ? { ...item, photos: [...item.photos, entry] }
                      : item,
                  ),
                };
              }),
            };
          }),
        });
      },

      removePhoto: (inspectionId, roomType, itemId, photoId) => {
        set({
          inspections: get().inspections.map((inspection) => {
            if (inspection.id !== inspectionId) return inspection;
            return {
              ...inspection,
              updatedAt: new Date().toISOString(),
              rooms: inspection.rooms.map((room) => {
                if (room.roomType !== roomType) return room;
                return {
                  ...room,
                  items: room.items.map((item) =>
                    item.id === itemId
                      ? {
                          ...item,
                          photos: item.photos.filter((p) => p.id !== photoId),
                        }
                      : item,
                  ),
                };
              }),
            };
          }),
        });
      },

      completeInspection: (inspectionId) => {
        const inspection = get().getInspection(inspectionId);
        if (!inspection) return undefined;

        const summary = generateInspectionSummary(inspection);
        const completed: Inspection = {
          ...inspection,
          status: "completed",
          summary,
          updatedAt: new Date().toISOString(),
        };

        set({
          inspections: get().inspections.map((i) =>
            i.id === inspectionId ? completed : i,
          ),
        });

        return completed;
      },

      deleteInspection: (inspectionId) => {
        set({
          inspections: get().inspections.filter((i) => i.id !== inspectionId),
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ inspections: state.inspections }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.inspections = parseStoredInspections(state.inspections);
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);
