import type { SupabaseClient } from "@supabase/supabase-js";
import { extractPdfPages } from "@/lib/strata/pdf-extract";
import { chunkPages } from "@/lib/strata/chunk";
import { analyzeStrataReport } from "@/lib/strata/analyze";

export async function processStrataDocument(
  supabase: SupabaseClient,
  documentId: string,
  pdfBuffer: Buffer,
): Promise<void> {
  await supabase
    .from("documents")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", documentId);

  try {
    const { pages, method } = await extractPdfPages(pdfBuffer);
    const textChunks = chunkPages(pages);

    const pageRows = pages.map((p) => ({
      document_id: documentId,
      page_number: p.pageNumber,
      text_content: p.text,
      char_count: p.text.length,
    }));

    const { data: insertedPages, error: pagesError } = await supabase
      .from("document_pages")
      .insert(pageRows)
      .select("id, page_number");

    if (pagesError) throw pagesError;

    const pageIdByNumber = new Map(
      (insertedPages ?? []).map((p) => [p.page_number, p.id]),
    );

    const chunkRows = textChunks.map((c) => ({
      document_id: documentId,
      page_id: pageIdByNumber.get(c.pageNumber) ?? null,
      page_number: c.pageNumber,
      chunk_index: c.chunkIndex,
      content: c.content,
      char_count: c.content.length,
    }));

    const { data: insertedChunks, error: chunksError } = await supabase
      .from("document_chunks")
      .insert(chunkRows)
      .select("id, page_number, chunk_index, content");

    if (chunksError) throw chunksError;

    const findings = await analyzeStrataReport(textChunks);

    const chunkByPageIndex = new Map(
      (insertedChunks ?? []).map((c) => [
        `${c.page_number}-${c.chunk_index}`,
        c.id,
      ]),
    );

    const findingRows = findings.map((f) => {
      const chunkId =
        chunkByPageIndex.get(`${f.pageNumber}-0`) ??
        insertedChunks?.find((c) => c.page_number === f.pageNumber)?.id ??
        null;

      return {
        document_id: documentId,
        category: f.category,
        title: f.title,
        severity: f.severity,
        plain_english_explanation: f.plainEnglishExplanation,
        supporting_quote: f.supportingQuote,
        page_number: f.pageNumber,
        confidence: f.confidence,
        chunk_id: chunkId,
      };
    });

    if (findingRows.length) {
      const { error: findingsError } = await supabase
        .from("document_findings")
        .insert(findingRows);
      if (findingsError) throw findingsError;
    }

    await supabase
      .from("documents")
      .update({
        status: "ready",
        page_count: pages.length,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Processing failed";
    await supabase
      .from("documents")
      .update({
        status: "failed",
        error_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId);
    throw err;
  }
}
