export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export type PdfExtractionMethod = "native" | "document_ai";

export interface PdfExtractionResult {
  pages: ExtractedPage[];
  method: PdfExtractionMethod;
}
