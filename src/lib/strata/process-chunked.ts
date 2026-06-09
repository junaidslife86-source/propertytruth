import type { Firestore } from "firebase-admin/firestore";
import { downloadFromFirebaseStorage } from "@/lib/firebase/storage";
import type { ProcessingStatus } from "@/lib/strata/processing-status";
import { runStrataProcessingPipeline, sha256 } from "@/lib/strata/process-pipeline";
import { extractPdfPages } from "@/lib/strata/pdf-extract";
import { classifyPages } from "@/lib/strata/classify-pages";
import {
  groupPagesIntoSections,
  HIGH_PRIORITY_SECTIONS,
} from "@/lib/strata/group-sections";
import type { ClassifiedPage, DocumentSection } from "@/lib/strata/page-types";
import { chunkPages } from "@/lib/strata/chunk";
import { extractSectionFindings } from "@/lib/strata/extractors";
import { validateFindings } from "@/lib/strata/evidence";
import { generateStrataSummary } from "@/lib/strata/summary";
import { redactOptional, redactPii, redactStrataSummary } from "@/lib/compliance/redact";

export interface PipelineAdvanceResult {
  status: ProcessingStatus;
  done: boolean;
  continue: boolean;
}

async function setStatus(
  db: Firestore,
  documentId: string,
  status: ProcessingStatus,
  extra: Record<string, unknown> = {},
) {
  await db.collection("strata_documents").doc(documentId).update({
    processingStatus: status,
    status: status === "complete" ? "ready" : status === "failed" ? "failed" : "processing",
    updatedAt: new Date().toISOString(),
    ...extra,
  });
}

/**
 * Advance strata processing by one bounded step (≤60s on hobby Vercel).
 * Client or upload hook should poll until `done` is true.
 */
export async function advanceStrataPipeline(
  db: Firestore,
  documentId: string,
): Promise<PipelineAdvanceResult> {
  const docRef = db.collection("strata_documents").doc(documentId);
  const snap = await docRef.get();
  if (!snap.exists) throw new Error("Document not found");

  const doc = snap.data()!;
  const status = doc.processingStatus as ProcessingStatus;

  if (status === "complete") {
    return { status: "complete", done: true, continue: false };
  }
  if (status === "failed") {
    return { status: "failed", done: true, continue: false };
  }

  if (!doc.storagePath) {
    throw new Error("PDF not found in storage");
  }

  const buffer = await downloadFromFirebaseStorage(doc.storagePath as string);

  if (status === "queued" || status === "uploaded") {
    const fileHash = sha256(buffer);
    await docRef.update({ fileHash, retryAvailable: false });

    const existing = await db
      .collection("strata_documents")
      .where("fileHash", "==", fileHash)
      .where("processingStatus", "==", "complete")
      .limit(1)
      .get();

    if (!existing.empty && existing.docs[0].id !== documentId) {
      await runStrataProcessingPipeline(db, documentId, buffer);
      return { status: "complete", done: true, continue: false };
    }

    await setStatus(db, documentId, "extracting_text");
    const { pages: extractedPages, method } = await extractPdfPages(buffer);

    const pagesCol = docRef.collection("pages");
    const existingPages = await pagesCol.get();
    const clearBatch = db.batch();
    existingPages.docs.forEach((d) => clearBatch.delete(d.ref));
    await clearBatch.commit();

    const pageBatch = db.batch();
    for (const p of extractedPages) {
      pageBatch.set(pagesCol.doc(), {
        pageNumber: p.pageNumber,
        textContent: p.text,
        charCount: p.text.length,
        rawText: p.text,
      });
    }
    await pageBatch.commit();

    await docRef.update({
      extractionMethod: method,
      pageCount: extractedPages.length,
      pipelineMeta: { phase: "classify" },
    });
    await setStatus(db, documentId, "classifying_pages");
    return { status: "classifying_pages", done: false, continue: true };
  }

  if (status === "classifying_pages") {
    const pagesSnap = await docRef.collection("pages").get();
    const extractedPages = pagesSnap.docs
      .map((d) => d.data())
      .sort((a, b) => (a.pageNumber as number) - (b.pageNumber as number))
      .map((p) => ({
        pageNumber: p.pageNumber as number,
        text: (p.rawText ?? p.textContent) as string,
      }));

    const method =
      (doc.extractionMethod as "native" | "document_ai") ?? "native";
    const classified = classifyPages(extractedPages, method);
    const sections = groupPagesIntoSections(classified).filter((s) =>
      HIGH_PRIORITY_SECTIONS.includes(s.sectionType),
    );

    for (const col of ["sections", "chunks", "findings"] as const) {
      const existing = await docRef.collection(col).get();
      const batch = db.batch();
      existing.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    const pageBatch = db.batch();
    for (const p of classified) {
      const pageDoc = pagesSnap.docs.find((d) => d.data().pageNumber === p.pageNumber);
      if (!pageDoc) continue;
      pageBatch.update(pageDoc.ref, {
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
      sectionBatch.set(docRef.collection("sections").doc(s.id), s);
    }
    await sectionBatch.commit();

    const textChunks = chunkPages(extractedPages);
    const chunkBatch = db.batch();
    for (const c of textChunks) {
      chunkBatch.set(docRef.collection("chunks").doc(), {
        pageNumber: c.pageNumber,
        chunkIndex: c.chunkIndex,
        content: c.content,
        charCount: c.content.length,
      });
    }
    await chunkBatch.commit();

    await docRef.update({
      pipelineMeta: {
        phase: "findings",
        sectionIds: sections.map((s) => s.id),
        nextSectionIndex: 0,
        classifiedPageCount: classified.length,
      },
      sectionCount: sections.length,
    });
    await setStatus(db, documentId, "extracting_findings");
    return { status: "extracting_findings", done: false, continue: true };
  }

  if (status === "extracting_findings") {
    const meta = (doc.pipelineMeta ?? {}) as {
      sectionIds?: string[];
      nextSectionIndex?: number;
      classifiedPageCount?: number;
    };
    const sectionIds = meta.sectionIds ?? [];
    let index = meta.nextSectionIndex ?? 0;

    if (sectionIds.length === 0) {
      await setStatus(db, documentId, "generating_summary");
      return { status: "generating_summary", done: false, continue: true };
    }

    const pagesSnap = await docRef.collection("pages").get();
    const classified = pagesSnap.docs
      .map((d) => {
        const p = d.data();
        return {
          pageNumber: p.pageNumber as number,
          text: (p.rawText ?? p.textContent) as string,
          pageType: (p.pageType as ClassifiedPage["pageType"]) ?? "unknown",
          classificationConfidence: (p.classificationConfidence as number) ?? 0.5,
          analysisPriority:
            (p.analysisPriority as ClassifiedPage["analysisPriority"]) ?? "medium",
          textCoverageScore: (p.textCoverageScore as number) ?? 0.5,
          extractionMethod:
            (p.extractionMethod as ClassifiedPage["extractionMethod"]) ?? "native",
        };
      })
      .sort((a, b) => a.pageNumber - b.pageNumber);

    if (index < sectionIds.length) {
      const sectionId = sectionIds[index]!;
      const sectionSnap = await docRef.collection("sections").doc(sectionId).get();
      const section = sectionSnap.data() as DocumentSection | undefined;
      if (section) {
        const raw = await extractSectionFindings(section, classified);
        const validated = validateFindings(raw, classified);
        const findingBatch = db.batch();
        for (const f of validated) {
          findingBatch.set(docRef.collection("findings").doc(), {
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
      }

      index += 1;
      await docRef.update({
        "pipelineMeta.nextSectionIndex": index,
      });

      if (index < sectionIds.length) {
        return { status: "extracting_findings", done: false, continue: true };
      }
    }

    await setStatus(db, documentId, "generating_summary");
    return { status: "generating_summary", done: false, continue: true };
  }

  if (status === "generating_summary") {
    const findingsSnap = await docRef.collection("findings").get();
    const sectionsSnap = await docRef.collection("sections").get();
    const findings = findingsSnap.docs.map((d) => d.data());
    const sections = sectionsSnap.docs.map((d) => d.data());
    const classifiedCount =
      (doc.pipelineMeta as { classifiedPageCount?: number })?.classifiedPageCount ??
      doc.pageCount ??
      0;

    const summary = redactStrataSummary(
      generateStrataSummary(
        findings as Parameters<typeof generateStrataSummary>[0],
        sections as Parameters<typeof generateStrataSummary>[1],
        classifiedCount,
      ),
    );

    await setStatus(db, documentId, "complete", {
      findingCount: findings.length,
      highSeverityCount: findings.filter((f) => f.severity === "high").length,
      summary,
      completedAt: new Date().toISOString(),
      errorMessage: null,
      errorCode: null,
    });

    return { status: "complete", done: true, continue: false };
  }

  await runStrataProcessingPipeline(db, documentId, buffer);
  return { status: "complete", done: true, continue: false };
}
