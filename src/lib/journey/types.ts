export type JourneyStage =
  | "explore"
  | "inspect"
  | "verify"
  | "offer"
  | "settle"
  | "own";

export type StageStatus =
  | "not_started"
  | "in_progress"
  | "blocked"
  | "ready"
  | "complete";

export interface JourneyStageState {
  stage: JourneyStage;
  label: string;
  status: StageStatus;
  summary: string;
  missingItems: string[];
  nextAction: string;
}

export const JOURNEY_STAGES: { stage: JourneyStage; label: string }[] = [
  { stage: "explore", label: "Explore" },
  { stage: "inspect", label: "Inspect" },
  { stage: "verify", label: "Verify" },
  { stage: "offer", label: "Offer" },
  { stage: "settle", label: "Settle" },
  { stage: "own", label: "Own" },
];
