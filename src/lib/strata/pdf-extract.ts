import { extractText, getDocumentProxy } from "unpdf";
import { extractPdfWithDocumentAi } from "@/lib/document-ai/ocr";
import { isDocumentAiConfigured } from "@/lib/document-ai/config";
import type {
  ExtractedPage,
  PdfExtractionResult,
} from "@/lib/strata/extract-types";

export type { ExtractedPage, PdfExtractionMethod, PdfExtractionResult } from "@/lib/strata/extract-types";

async function extractNativePdfPages(buffer: Buffer): Promise<ExtractedPage[]> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { totalPages, text } = await extractText(pdf, { mergePages: false });

  const pages: ExtractedPage[] = [];
  const pageTexts = Array.isArray(text) ? text : [String(text ?? "")];

  pageTexts.forEach((pageText, index) => {
    const cleaned = String(pageText).replace(/\s+/g, " ").trim();
    if (cleaned) {
      pages.push({ pageNumber: index + 1, text: cleaned });
    }
  });

  if (!pages.length && totalPages > 0) {
    throw new Error("No extractable text in PDF");
  }

  return pages;
}

export async function extractPdfPages(buffer: Buffer): Promise<PdfExtractionResult> {
  try {
    const nativePages = await extractNativePdfPages(buffer);
    if (nativePages.length) {
      return { pages: nativePages, method: "native" };
    }
  } catch {
    /* fall through to OCR */
  }

  if (!isDocumentAiConfigured()) {
    throw new Error(
      "No extractable text found. Configure Google Document AI for scanned PDF OCR.",
    );
  }

  const ocrPages = await extractPdfWithDocumentAi(buffer);
  return { pages: ocrPages, method: "document_ai" };
}
