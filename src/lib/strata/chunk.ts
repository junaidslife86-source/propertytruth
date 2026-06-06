import type { ExtractedPage } from "@/lib/strata/extract-types";

export interface TextChunk {
  pageNumber: number;
  chunkIndex: number;
  content: string;
}

const MAX_CHUNK_CHARS = 1200;
const OVERLAP_CHARS = 100;

export function chunkPages(pages: ExtractedPage[]): TextChunk[] {
  const chunks: TextChunk[] = [];

  for (const page of pages) {
    const text = page.text;
    if (text.length <= MAX_CHUNK_CHARS) {
      chunks.push({
        pageNumber: page.pageNumber,
        chunkIndex: 0,
        content: text,
      });
      continue;
    }

    let start = 0;
    let chunkIndex = 0;

    while (start < text.length) {
      let end = Math.min(start + MAX_CHUNK_CHARS, text.length);

      if (end < text.length) {
        const breakAt = text.lastIndexOf(". ", end);
        if (breakAt > start + MAX_CHUNK_CHARS * 0.5) {
          end = breakAt + 1;
        }
      }

      chunks.push({
        pageNumber: page.pageNumber,
        chunkIndex,
        content: text.slice(start, end).trim(),
      });

      if (end >= text.length) break;
      start = Math.max(end - OVERLAP_CHARS, start + 1);
      chunkIndex++;
    }
  }

  return chunks;
}
