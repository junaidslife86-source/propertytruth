export type DueDiligenceCategory =
  | "finance"
  | "contract"
  | "building_inspection"
  | "pest_inspection"
  | "strata"
  | "insurance"
  | "council_planning"
  | "conveyancer"
  | "offer"
  | "settlement";

export type DueDiligenceStatus =
  | "not_started"
  | "in_progress"
  | "concern_found"
  | "cleared"
  | "not_applicable";

export interface DueDiligenceItem {
  id: string;
  category: DueDiligenceCategory;
  label: string;
  status: DueDiligenceStatus;
  required: boolean;
  notes: string;
}
