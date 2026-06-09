export type SourceLabel =
  | "public_record"
  | "seeded_sample"
  | "demo_sample"
  | "uploaded_document"
  | "buyer_note"
  | "ai_assisted"
  | "unknown"
  | "needs_verification";

export const SOURCE_LABEL_DISPLAY: Record<SourceLabel, string> = {
  public_record: "Public record",
  seeded_sample: "Seeded sample (NSW)",
  demo_sample: "Demo sample",
  uploaded_document: "Uploaded document",
  buyer_note: "Your note",
  ai_assisted: "AI-assisted",
  unknown: "Not checked",
  needs_verification: "Needs verification",
};

export function dataSourceToLabel(
  dataSource: "database" | "demo",
  seeded?: boolean,
): SourceLabel {
  if (dataSource === "demo") return "demo_sample";
  if (seeded) return "seeded_sample";
  return "public_record";
}
