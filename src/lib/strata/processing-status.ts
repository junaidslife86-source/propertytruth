export const PROCESSING_STATUSES = [
  "uploaded",
  "queued",
  "extracting_text",
  "ocr_processing",
  "classifying_pages",
  "grouping_sections",
  "extracting_findings",
  "generating_summary",
  "complete",
  "failed",
] as const;

export type ProcessingStatus = (typeof PROCESSING_STATUSES)[number];

export const PROCESSING_STATUS_LABELS: Record<ProcessingStatus, string> = {
  uploaded: "Uploaded",
  queued: "Queued",
  extracting_text: "Extracting text",
  ocr_processing: "Running OCR",
  classifying_pages: "Classifying pages",
  grouping_sections: "Grouping sections",
  extracting_findings: "Analysing sections",
  generating_summary: "Generating summary",
  complete: "Complete",
  failed: "Failed",
};
