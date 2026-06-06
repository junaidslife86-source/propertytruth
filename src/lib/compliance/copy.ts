export const PRODUCT_POSITIONING =
  "PropertyTruth helps buyers organise due diligence, surface evidence-backed questions, and track missing checks before they speak with professionals.";

export const MASTER_DISCLAIMER =
  "It does not provide legal, financial, building, pest, strata, insurance, or credit advice.";

export const UPLOAD_DISCLAIMER =
  "This scan is AI-assisted and may miss information. It is designed to help you organise questions for professionals, not replace legal, strata, building, pest, insurance or financial advice.";

export const FINDINGS_DISCLAIMER =
  "Findings are based only on processed pages and available source material. Absence of a finding does not mean absence of an issue.";

export const COST_CALCULATOR_DISCLAIMER =
  "Estimates only. This is not financial, tax, credit or investment advice. Confirm affordability and loan options with a licensed professional.";

export const OFFER_CHECKLIST_DISCLAIMER =
  "This checklist helps organise due diligence. It does not recommend whether you should make an offer.";

export const NO_TRAINING_STATEMENT =
  "We do not use uploaded strata documents to train AI models.";

export const PRIVACY_UPLOAD_BULLETS = [
  "This document may contain personal information about other owners or residents.",
  "You have permission or a lawful reason to use this document for your property due diligence.",
  "This is an AI-assisted scan, not professional advice.",
  "We process the file to extract findings and answer your questions.",
  "You can delete the document and extracted data.",
] as const;

export const PROFESSIONAL_REVIEW_ITEMS = [
  { id: "conveyancer", label: "Conveyancer / solicitor" },
  { id: "building", label: "Building inspector" },
  { id: "pest", label: "Pest inspector" },
  { id: "strata", label: "Strata inspector" },
  { id: "broker", label: "Broker / lender" },
  { id: "insurer", label: "Insurer" },
] as const;
