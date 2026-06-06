import type { DocumentChunk } from "@/lib/strata/schemas";

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 2);
}

export function retrieveRelevantChunks(
  chunks: DocumentChunk[],
  query: string,
  limit = 5,
): DocumentChunk[] {
  const terms = tokenize(query);
  if (!terms.length) return chunks.slice(0, limit);

  const scored = chunks.map((chunk) => {
    const lower = chunk.content.toLowerCase();
    let score = 0;
    for (const term of terms) {
      const matches = lower.split(term).length - 1;
      score += matches * 2;
      if (lower.includes(term)) score += 1;
    }
    return { chunk, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.chunk);
}
