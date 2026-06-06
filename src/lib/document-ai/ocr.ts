import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import type { google } from "@google-cloud/documentai/build/protos/protos";
import { getDocumentAiConfig } from "@/lib/document-ai/config";
import type { ExtractedPage } from "@/lib/strata/extract-types";

type DocumentPage = google.cloud.documentai.v1.Document.IPage;
type TextAnchor = google.cloud.documentai.v1.Document.ITextAnchor;

function getCredentials() {
  return {
    client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  };
}

function textFromAnchor(anchor: TextAnchor | null | undefined, fullText: string) {
  if (!anchor?.textSegments?.length) return "";
  return anchor.textSegments
    .map((seg) => {
      const start = Number(seg.startIndex ?? 0);
      const end = Number(seg.endIndex ?? fullText.length);
      return fullText.substring(start, end);
    })
    .join("");
}

function pageToText(page: DocumentPage, fullText: string): string {
  const segments: string[] = [];

  const blocks = [
    ...(page.paragraphs ?? []),
    ...(page.lines ?? []),
    ...(page.tokens ?? []),
  ];

  for (const block of blocks) {
    const text = textFromAnchor(block.layout?.textAnchor, fullText)
      .replace(/\s+/g, " ")
      .trim();
    if (text) segments.push(text);
  }

  return [...new Set(segments)].join(" ").replace(/\s+/g, " ").trim();
}

function documentToPages(
  document: google.cloud.documentai.v1.IDocument,
): ExtractedPage[] {
  const fullText = document.text ?? "";
  const pages = document.pages ?? [];

  if (pages.length) {
    return pages
      .map((page, index) => ({
        pageNumber: page.pageNumber ?? index + 1,
        text: pageToText(page, fullText),
      }))
      .filter((p) => p.text.length > 0);
  }

  if (fullText.trim()) {
    return [
      {
        pageNumber: 1,
        text: fullText.replace(/\s+/g, " ").trim(),
      },
    ];
  }

  return [];
}

let client: DocumentProcessorServiceClient | null = null;

function getClient(location: string) {
  if (!client) {
    client = new DocumentProcessorServiceClient({
      credentials: getCredentials(),
      apiEndpoint: `${location}-documentai.googleapis.com`,
    });
  }
  return client;
}

export async function extractPdfWithDocumentAi(
  buffer: Buffer,
): Promise<ExtractedPage[]> {
  const config = getDocumentAiConfig();
  if (!config) {
    throw new Error("Google Document AI is not configured");
  }

  const processorName = `projects/${config.projectId}/locations/${config.location}/processors/${config.processorId}`;
  const docClient = getClient(config.location);

  const [result] = await docClient.processDocument({
    name: processorName,
    rawDocument: {
      content: buffer.toString("base64"),
      mimeType: "application/pdf",
    },
  });

  const pages = documentToPages(result.document ?? {});
  if (!pages.length) {
    throw new Error("Document AI returned no readable text from this PDF");
  }

  return pages;
}
