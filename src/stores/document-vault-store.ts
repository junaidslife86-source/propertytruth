import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DocumentType =
  | "contract"
  | "strata_report"
  | "building_report"
  | "pest_report"
  | "section_10_7"
  | "insurance_quote"
  | "other";

export interface VaultDocument {
  id: string;
  propertyId: string;
  documentType: DocumentType;
  fileName: string;
  mimeType: string;
  status: "uploaded" | "extracting" | "extracted" | "extraction_failed";
  uploadedAt: string;
  sizeBytes?: number;
}

interface DocumentVaultState {
  documents: VaultDocument[];
  addDocument: (doc: Omit<VaultDocument, "id" | "uploadedAt" | "status">) => VaultDocument;
  removeDocument: (id: string) => void;
  getForProperty: (propertyId: string) => VaultDocument[];
}

export const useDocumentVaultStore = create<DocumentVaultState>()(
  persist(
    (set, get) => ({
      documents: [],
      addDocument: (doc) => {
        const newDoc: VaultDocument = {
          ...doc,
          id: crypto.randomUUID(),
          status: "uploaded",
          uploadedAt: new Date().toISOString(),
        };
        set({ documents: [...get().documents, newDoc] });
        return newDoc;
      },
      removeDocument: (id) =>
        set({ documents: get().documents.filter((d) => d.id !== id) }),
      getForProperty: (propertyId) =>
        get().documents.filter((d) => d.propertyId === propertyId),
    }),
    { name: "propertytruth-documents" },
  ),
);

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  contract: "Contract of sale",
  strata_report: "Strata report",
  building_report: "Building inspection",
  pest_report: "Pest inspection",
  section_10_7: "Section 10.7 certificate",
  insurance_quote: "Insurance quote",
  other: "Other document",
};

export const REQUIRED_DOCS_APARTMENT: DocumentType[] = [
  "contract",
  "strata_report",
  "building_report",
];

export const REQUIRED_DOCS_HOUSE: DocumentType[] = [
  "contract",
  "building_report",
  "pest_report",
];
