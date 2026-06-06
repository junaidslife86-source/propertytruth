import type { DueDiligenceItem } from "@/lib/due-diligence/types";

function item(
  id: string,
  category: DueDiligenceItem["category"],
  label: string,
  required = true,
): DueDiligenceItem {
  return {
    id,
    category,
    label,
    status: "not_started",
    required,
    notes: "",
  };
}

export function apartmentDueDiligenceTemplate(): DueDiligenceItem[] {
  return [
    item("dd-contract", "contract", "Contract reviewed by conveyancer"),
    item("dd-strata", "strata", "Strata report reviewed"),
    item("dd-cwf", "strata", "Capital works fund checked"),
    item("dd-levy", "strata", "Special levies checked"),
    item("dd-defects", "building_inspection", "Building defects checked"),
    item("dd-insurance", "insurance", "Strata insurance certificate checked"),
    item("dd-finance", "finance", "Finance pre-approval confirmed"),
    item("dd-inspection", "building_inspection", "Open inspection completed"),
    item("dd-planning", "council_planning", "Section 10.7 / planning certificate"),
  ];
}

export function houseDueDiligenceTemplate(): DueDiligenceItem[] {
  return [
    item("dd-contract", "contract", "Contract reviewed by conveyancer"),
    item("dd-building", "building_inspection", "Building inspection completed"),
    item("dd-pest", "pest_inspection", "Pest inspection completed"),
    item("dd-flood", "council_planning", "Flood / bushfire overlays checked"),
    item("dd-insurance", "insurance", "Insurance quote obtained"),
    item("dd-easements", "conveyancer", "Easements & title checked"),
    item("dd-finance", "finance", "Finance pre-approval confirmed"),
    item("dd-inspection", "building_inspection", "Open inspection completed"),
  ];
}

export function defaultDueDiligenceTemplate(): DueDiligenceItem[] {
  return apartmentDueDiligenceTemplate();
}
