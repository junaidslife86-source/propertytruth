import type { PropertyType, RoomType } from "@/lib/inspection/schemas";

export interface ChecklistItemDef {
  key: string;
  label: string;
  rooms: RoomType[];
  propertyTypes: PropertyType[];
  followUpQuestion?: string;
}

export const ROOM_LABELS: Record<RoomType, string> = {
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  bedrooms: "Bedrooms",
  balcony: "Balcony",
  garage: "Garage",
  exterior: "Exterior",
  common_areas: "Common areas",
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: "Apartment",
  townhouse: "Townhouse",
  freestanding_house: "Freestanding house",
};

export const ALL_ROOMS: RoomType[] = [
  "kitchen",
  "bathroom",
  "bedrooms",
  "balcony",
  "garage",
  "exterior",
  "common_areas",
];

const APARTMENT_CHECKLIST: ChecklistItemDef[] = [
  {
    key: "water_pressure",
    label: "Water pressure",
    rooms: ["kitchen", "bathroom"],
    propertyTypes: ["apartment"],
    followUpQuestion:
      "Has the hot water system been serviced recently, and are there any known pressure issues in the building?",
  },
  {
    key: "mould",
    label: "Mould or damp signs",
    rooms: ["bathroom", "bedrooms"],
    propertyTypes: ["apartment"],
    followUpQuestion:
      "Has the owners corporation addressed any past mould or waterproofing claims?",
  },
  {
    key: "ventilation",
    label: "Ventilation",
    rooms: ["bathroom", "kitchen", "bedrooms"],
    propertyTypes: ["apartment"],
    followUpQuestion:
      "Are exhaust fans ducted externally, and do windows open fully for cross-ventilation?",
  },
  {
    key: "balcony_drainage",
    label: "Balcony drainage",
    rooms: ["balcony"],
    propertyTypes: ["apartment"],
    followUpQuestion:
      "Who is responsible for balcony waterproofing maintenance — owner or strata?",
  },
  {
    key: "hallway_lift_noise",
    label: "Noise from hallway / lift",
    rooms: ["bedrooms", "common_areas"],
    propertyTypes: ["apartment"],
    followUpQuestion:
      "Are there bylaws restricting renovations or flooring that could affect noise transfer?",
  },
  {
    key: "cracks",
    label: "Cracks in walls or ceilings",
    rooms: ["bedrooms", "exterior"],
    propertyTypes: ["apartment"],
    followUpQuestion:
      "Have any structural or facade remediation works been approved by the owners corporation?",
  },
  {
    key: "storage",
    label: "Storage space",
    rooms: ["bedrooms", "garage"],
    propertyTypes: ["apartment"],
    followUpQuestion:
      "Is the storage cage or locker included in the sale, and are there size restrictions?",
  },
  {
    key: "natural_light",
    label: "Natural light",
    rooms: ["bedrooms", "kitchen"],
    propertyTypes: ["apartment"],
    followUpQuestion:
      "Are there approved DAs nearby that could affect light or outlook?",
  },
  {
    key: "common_areas",
    label: "Common areas condition",
    rooms: ["common_areas"],
    propertyTypes: ["apartment"],
    followUpQuestion:
      "What major capital works are planned in the next 3 years according to strata minutes?",
  },
  {
    key: "parking_access",
    label: "Parking access",
    rooms: ["garage", "common_areas"],
    propertyTypes: ["apartment"],
    followUpQuestion:
      "Is the car space on a separate title or by-law, and are there visitor parking rules?",
  },
];

const TOWNHOUSE_CHECKLIST: ChecklistItemDef[] = [
  {
    key: "water_pressure",
    label: "Water pressure",
    rooms: ["kitchen", "bathroom"],
    propertyTypes: ["townhouse"],
    followUpQuestion: "When was the hot water system last replaced or serviced?",
  },
  {
    key: "mould",
    label: "Mould or damp signs",
    rooms: ["bathroom", "bedrooms"],
    propertyTypes: ["townhouse"],
    followUpQuestion: "Has the property had any past water ingress or leak claims?",
  },
  {
    key: "ventilation",
    label: "Ventilation",
    rooms: ["bathroom", "kitchen", "bedrooms"],
    propertyTypes: ["townhouse"],
    followUpQuestion: "Are rangehood and bathroom fans vented outside the building envelope?",
  },
  {
    key: "cracks",
    label: "Cracks in walls or brickwork",
    rooms: ["exterior", "bedrooms"],
    propertyTypes: ["townhouse"],
    followUpQuestion: "Has a structural engineer reviewed any significant cracking?",
  },
  {
    key: "roof_gutters",
    label: "Roof and gutters",
    rooms: ["exterior"],
    propertyTypes: ["townhouse"],
    followUpQuestion: "When were the roof and gutters last inspected or replaced?",
  },
  {
    key: "garage_door",
    label: "Garage door and access",
    rooms: ["garage"],
    propertyTypes: ["townhouse"],
    followUpQuestion: "Is the garage door motor included, and are there body corporate rules for noise?",
  },
  {
    key: "shared_walls",
    label: "Shared wall noise",
    rooms: ["bedrooms"],
    propertyTypes: ["townhouse"],
    followUpQuestion: "Are there acoustic requirements for renovations on shared walls?",
  },
  {
    key: "outdoor_drainage",
    label: "Outdoor drainage",
    rooms: ["exterior", "balcony"],
    propertyTypes: ["townhouse"],
    followUpQuestion: "Does stormwater drain away from the building footings?",
  },
  {
    key: "storage",
    label: "Storage and layout",
    rooms: ["garage", "kitchen"],
    propertyTypes: ["townhouse"],
    followUpQuestion: "Are all built-in storage fixtures included in the contract?",
  },
  {
    key: "natural_light",
    label: "Natural light and outlook",
    rooms: ["bedrooms", "kitchen"],
    propertyTypes: ["townhouse"],
    followUpQuestion: "Are there easements or planned works that could affect privacy or light?",
  },
];

const HOUSE_CHECKLIST: ChecklistItemDef[] = [
  {
    key: "water_pressure",
    label: "Water pressure",
    rooms: ["kitchen", "bathroom"],
    propertyTypes: ["freestanding_house"],
    followUpQuestion: "Is the property on mains water or tank supply, and when were pipes last checked?",
  },
  {
    key: "mould",
    label: "Mould or damp signs",
    rooms: ["bathroom", "bedrooms"],
    propertyTypes: ["freestanding_house"],
    followUpQuestion: "Has subfloor ventilation been checked, especially if the home is raised?",
  },
  {
    key: "ventilation",
    label: "Ventilation",
    rooms: ["bathroom", "kitchen", "bedrooms"],
    propertyTypes: ["freestanding_house"],
    followUpQuestion: "Do all wet areas have working extraction to the outside?",
  },
  {
    key: "roof_gutters",
    label: "Roof and gutters",
    rooms: ["exterior"],
    propertyTypes: ["freestanding_house"],
    followUpQuestion: "What is the approximate age of the roof, and are there signs of rust or broken tiles?",
  },
  {
    key: "cracks",
    label: "Cracks in walls or foundations",
    rooms: ["exterior", "bedrooms"],
    propertyTypes: ["freestanding_house"],
    followUpQuestion: "Has movement been monitored over time, and is there a recent building report?",
  },
  {
    key: "drainage",
    label: "Site drainage",
    rooms: ["exterior", "garage"],
    propertyTypes: ["freestanding_house"],
    followUpQuestion: "Does water pool near the house after rain, and are drains clear?",
  },
  {
    key: "garage_structure",
    label: "Garage or carport structure",
    rooms: ["garage"],
    propertyTypes: ["freestanding_house"],
    followUpQuestion: "Is the garage council-approved, and are there any unapproved structures?",
  },
  {
    key: "pest_signs",
    label: "Pest signs",
    rooms: ["exterior", "kitchen"],
    propertyTypes: ["freestanding_house"],
    followUpQuestion: "When was the last pest inspection, and are termite barriers in place?",
  },
  {
    key: "natural_light",
    label: "Natural light and aspect",
    rooms: ["bedrooms", "kitchen"],
    propertyTypes: ["freestanding_house"],
    followUpQuestion: "Do neighbouring trees or easements limit future extension options?",
  },
  {
    key: "fencing_boundaries",
    label: "Fencing and boundaries",
    rooms: ["exterior"],
    propertyTypes: ["freestanding_house"],
    followUpQuestion: "Is the fence on the boundary, and are there any encroachment or easement issues?",
  },
];

export const CHECKLIST_BY_TYPE: Record<PropertyType, ChecklistItemDef[]> = {
  apartment: APARTMENT_CHECKLIST,
  townhouse: TOWNHOUSE_CHECKLIST,
  freestanding_house: HOUSE_CHECKLIST,
};

export function getDefaultRoomsForType(propertyType: PropertyType): RoomType[] {
  switch (propertyType) {
    case "apartment":
      return [
        "kitchen",
        "bathroom",
        "bedrooms",
        "balcony",
        "common_areas",
        "garage",
      ];
    case "townhouse":
      return ["kitchen", "bathroom", "bedrooms", "garage", "exterior", "balcony"];
    case "freestanding_house":
      return ["kitchen", "bathroom", "bedrooms", "garage", "exterior"];
  }
}

export function buildRoomChecklists(
  propertyType: PropertyType,
  selectedRooms: RoomType[],
): { roomType: RoomType; key: string; label: string; followUpQuestion?: string }[] {
  const defs = CHECKLIST_BY_TYPE[propertyType];
  const roomSet = new Set(selectedRooms);
  const result: {
    roomType: RoomType;
    key: string;
    label: string;
    followUpQuestion?: string;
  }[] = [];

  for (const room of selectedRooms) {
    for (const def of defs) {
      if (def.rooms.includes(room) && roomSet.has(room)) {
        result.push({
          roomType: room,
          key: `${room}-${def.key}`,
          label: def.label,
          followUpQuestion: def.followUpQuestion,
        });
      }
    }
  }

  return result;
}
