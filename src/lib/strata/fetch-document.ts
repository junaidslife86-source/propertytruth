import type { SupabaseClient } from "@supabase/supabase-js";
import {
  documentFindingSchema,
  strataDocumentSchema,
  type StrataDocument,
} from "@/lib/strata/schemas";

export async function fetchStrataDocument(
  supabase: SupabaseClient,
  documentId: string,
): Promise<StrataDocument | null> {
  const { data: doc, error } = await supabase
    .from("documents")
    .select("id, filename, page_count, status, error_message, created_at")
    .eq("id", documentId)
    .single();

  if (error || !doc) return null;

  const { data: findings } = await supabase
    .from("document_findings")
    .select(
      "id, category, title, severity, plain_english_explanation, supporting_quote, page_number, confidence",
    )
    .eq("document_id", documentId)
    .order("page_number");

  const mappedFindings = (findings ?? []).map((f) =>
    documentFindingSchema.parse({
      id: f.id,
      category: f.category,
      title: f.title,
      severity: f.severity,
      plainEnglishExplanation: f.plain_english_explanation,
      supportingQuote: f.supporting_quote,
      pageNumber: f.page_number,
      confidence: f.confidence,
    }),
  );

  return strataDocumentSchema.parse({
    id: doc.id,
    filename: doc.filename,
    pageCount: doc.page_count,
    status: doc.status,
    errorMessage: doc.error_message,
    findings: mappedFindings,
    createdAt: doc.created_at,
  });
}

export async function fetchDocumentChunks(
  supabase: SupabaseClient,
  documentId: string,
) {
  const { data } = await supabase
    .from("document_chunks")
    .select("id, page_number, chunk_index, content")
    .eq("document_id", documentId)
    .order("page_number")
    .order("chunk_index");

  return (data ?? []).map((c) => ({
    id: c.id,
    pageNumber: c.page_number,
    chunkIndex: c.chunk_index,
    content: c.content,
  }));
}
