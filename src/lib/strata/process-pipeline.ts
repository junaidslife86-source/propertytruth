import { createHash } from "crypto";
import type { DocumentReference, Firestore } from "firebase-admin/firestore";
import { extractPdfPages } from "@/lib/strata/pdf-extract";
import { chunkPages } from "@/lib/strata/chunk";
import { classifyPages } from "@/lib/strata/classify-pages";
import {
  groupPagesIntoSections,
  HIGH_PRIORITY_SECTIONS,
} from "@/lib/strata/group-sections";
import { extractSectionFindings } from "@/lib/strata/extractors";
import { validateFindings } from "@/lib/strata/evidence";
import { generateStrataSummary } from "@/lib/strata/summary";
import { redactOptional, redactPii, redactStrataSummary } from "@/lib/compliance/redact";
import type { ProcessingStatus } from "@/lib/strata/processing-status";

export function sha256(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

async function setStatus(
  docRef: DocumentReference,
  status: ProcessingStatus,
  extra: Record<string, unknown> = {},
) {
  await docRef.update({
    processingStatus: status,
    status: status === "complete" ? "ready" : status === "failed" ? "failed" : "processing",
    updatedAt: new Date().toISOString(),
    ...extra,
  });
}

export async function runStrataProcessingPipeline(
  db: Firestore,
  documentId: string,
  pdfBuffer: Buffer,
): Promise<void> {
  const docRef = db.collection("strata_documents").doc(documentId);
  const jobRef = db.collection("document_jobs").doc();

  await jobRef.set({
    docId: documentId,
    jobType: "strata_analysis",
    status: "running",
    attemptCount: 1,
    createdAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
  });

  try {
    const fileHash = sha256(pdfBuffer);
    await docRef.update({ fileHash, retryAvailable: false });

    const existing = await db
      .collection("strata_documents")
      .where("fileHash", "==", fileHash)
      .where("processingStatus", "==", "complete")
      .limit(1)
      .get();

    if (!existing.empty && existing.docs[0].id !== documentId) {
      const sourceId = existing.docs[0].id;
      await cloneProcessedDocument(db, sourceId, documentId);
      await setStatus(docRef, "complete", {
        deduplicatedFrom: sourceId,
        completedAt: new Date().toISOString(),
      });
      await jobRef.update({
        status: "complete",
        completedAt: new Date().toISOString(),
        note: `deduplicated from ${sourceId}`,
      });
      return;
    }

    await setStatus(docRef, "extracting_text");
    const { pages: extractedPages, method } = await extractPdfPages(pdfBuffer);

    if (method === "document_ai") {
      await setStatus(docRef, "ocr_processing");
    }

    await setStatus(docRef, "classifying_pages");
    const classified = classifyPages(extractedPages, method);

    await setStatus(docRef, "grouping_sections");
    const sections = groupPagesIntoSections(classified).filter((s) =>
      HIGH_PRIORITY_SECTIONS.includes(s.sectionType),
    );

    const pagesCol = docRef.collection("pages");
    const sectionsCol = docRef.collection("sections");
    const chunksCol = docRef.collection("chunks");
    const findingsCol = docRef.collection("findings");

    for (const col of [pagesCol, sectionsCol, chunksCol, findingsCol]) {
      const snap = await col.get();
      const batch = db.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    const pageBatch = db.batch();
    for (const p of classified) {
      pageBatch.set(pagesCol.doc(), {
        pageNumber: p.pageNumber,
        textContent: p.text,
        charCount: p.text.length,
        pageType: p.pageType,
        classificationConfidence: p.classificationConfidence,
        analysisPriority: p.analysisPriority,
        textCoverageScore: p.textCoverageScore,
        extractionMethod: p.extractionMethod,
      });
    }
    await pageBatch.commit();

    const sectionBatch = db.batch();
    for (const s of sections) {
      sectionBatch.set(sectionsCol.doc(s.id), s);
    }
    await sectionBatch.commit();

    const textChunks = chunkPages(extractedPages);
    const chunkBatch = db.batch();
    for (const c of textChunks) {
      chunkBatch.set(chunksCol.doc(), {
        pageNumber: c.pageNumber,
        chunkIndex: c.chunkIndex,
        content: c.content,
        charCount: c.content.length,
      });
    }
    await chunkBatch.commit();

    await setStatus(docRef, "extracting_findings");
    const rawFindings = (
      await Promise.all(sections.map((s) => extractSectionFindings(s, classified)))
    ).flat();

    const validated = validateFindings(rawFindings, classified);

    const findingBatch = db.batch();
    for (const f of validated) {
      findingBatch.set(findingsCol.doc(), {
        category: f.category,
        severity: f.severity,
        title: redactPii(f.title),
        plainEnglishExplanation: redactPii(f.plainEnglishExplanation),
        buyerImpact: redactOptional(f.buyerImpact),
        supportingQuote: redactPii(f.supportingQuote),
        pageNumber: f.pageNumber,
        confidence: f.confidence,
        recommendedQuestion: redactOptional(f.recommendedQuestion),
        evidenceStrength: f.evidenceStrength,
        needsProfessionalReview: f.needsProfessionalReview ?? false,
      });
    }
    await findingBatch.commit();

    await setStatus(docRef, "generating_summary");
    const summary = redactStrataSummary(
      generateStrataSummary(validated, sections, classified.length),
    );

    const avgCoverage =
      classified.reduce((s, p) => s + p.textCoverageScore, 0) /
      Math.max(classified.length, 1);

    await setStatus(docRef, "complete", {
      pageCount: classified.length,
      sectionCount: sections.length,
      findingCount: validated.length,
      highSeverityCount: validated.filter((f) => f.severity === "high").length,
      extractionMethod: method,
      extractionCoverage: avgCoverage,
      summary,
      completedAt: new Date().toISOString(),
      errorMessage: null,
      errorCode: null,
    });

    await jobRef.update({
      status: "complete",
      completedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Processing failed";
    const code = message.includes("Document AI") ? "OCR_FAILED" : "PROCESS_FAILED";

    await setStatus(docRef, "failed", {
      errorMessage: message,
      errorCode: code,
      retryAvailable: true,
    });

    await jobRef.update({
      status: "failed",
      error: message,
      completedAt: new Date().toISOString(),
    });

    throw err;
  }
}

async function cloneProcessedDocument(
  db: Firestore,
  sourceId: string,
  targetId: string,
) {
  const sourceRef = db.collection("strata_documents").doc(sourceId);
  const targetRef = db.collection("strata_documents").doc(targetId);
  const source = (await sourceRef.get()).data();
  if (!source) return;

  for (const sub of ["pages", "sections", "chunks", "findings"]) {
    const snap = await sourceRef.collection(sub).get();
    const batch = db.batch();
    for (const doc of snap.docs) {
      batch.set(targetRef.collection(sub).doc(), doc.data());
    }
    await batch.commit();
  }

  await targetRef.update({
    pageCount: source.pageCount,
    sectionCount: source.sectionCount,
    findingCount: source.findingCount,
    highSeverityCount: source.highSeverityCount,
    extractionMethod: source.extractionMethod,
    extractionCoverage: source.extractionCoverage,
    summary: source.summary,
  });
}
