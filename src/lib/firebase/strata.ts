import type { DocumentReference, Firestore } from "firebase-admin/firestore";
import type { StrataDocument } from "@/lib/strata/schemas";
import type { ProcessingStatus } from "@/lib/strata/processing-status";
import {
  documentFindingSchema,
  mapFindingCategory,
  strataDocumentSchema,
} from "@/lib/strata/schemas";
import { uploadToFirebaseStorage, deleteFromFirebaseStorage } from "@/lib/firebase/storage";
import { sanitizeUploadFilename, retentionExpiresAt } from "@/lib/strata/document-utils";
import { redactOptional, redactPii, redactStrataSummary } from "@/lib/compliance/redact";
import type { StrataReviewSummary } from "@/lib/strata/summary";

const COLLECTION = "strata_documents";

export async function createStrataDocument(
  db: Firestore,
  input: {
    filename: string;
    clientSessionId: string;
    userId?: string | null;
    propertyCaseId?: string | null;
  },
): Promise<string> {
  const ref = db.collection(COLLECTION).doc();
  const now = new Date().toISOString();
  await ref.set({
    filename: input.filename,
    storagePath: "",
    mimeType: "application/pdf",
    clientSessionId: input.clientSessionId,
    userId: input.userId ?? null,
    propertyCaseId: input.propertyCaseId ?? null,
    status: "uploaded",
    processingStatus: "uploaded",
    pageCount: null,
    errorMessage: null,
    errorCode: null,
    retryAvailable: false,
    retentionPolicy: "30d",
    retentionExpiresAt: null,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function uploadStrataPdf(
  documentId: string,
  filename: string,
  buffer: Buffer,
): Promise<string> {
  const safeName = sanitizeUploadFilename(filename);
  const storagePath = `strata-documents/${documentId}/${safeName}`;
  await uploadToFirebaseStorage(storagePath, buffer, "application/pdf");
  return storagePath;
}

export async function updateStrataDocumentPath(
  db: Firestore,
  documentId: string,
  storagePath: string,
): Promise<void> {
  await db.collection(COLLECTION).doc(documentId).update({
    storagePath,
    updatedAt: new Date().toISOString(),
  });
}

export async function queueStrataDocument(
  db: Firestore,
  documentId: string,
): Promise<void> {
  await db.collection(COLLECTION).doc(documentId).update({
    processingStatus: "queued",
    status: "processing",
    updatedAt: new Date().toISOString(),
  });

  await db.collection("document_jobs").add({
    docId: documentId,
    jobType: "strata_analysis",
    status: "queued",
    attemptCount: 0,
    createdAt: new Date().toISOString(),
  });
}

export async function getStrataDocumentStatus(
  db: Firestore,
  documentId: string,
) {
  const snap = await db.collection(COLLECTION).doc(documentId).get();
  if (!snap.exists) return null;
  const d = snap.data()!;
  return {
    id: snap.id,
    filename: d.filename as string,
    status: d.status as string,
    processingStatus: d.processingStatus as ProcessingStatus,
    pageCount: d.pageCount as number | null,
    errorMessage: d.errorMessage as string | null,
    errorCode: d.errorCode as string | null,
    retryAvailable: d.retryAvailable as boolean,
    extractionMethod: d.extractionMethod as string | undefined,
    deduplicatedFrom: d.deduplicatedFrom as string | undefined,
  };
}

export async function fetchStrataDocumentFirestore(
  db: Firestore,
  documentId: string,
): Promise<StrataDocument | null> {
  const docSnap = await db.collection(COLLECTION).doc(documentId).get();
  if (!docSnap.exists) return null;

  const doc = docSnap.data()!;
  const findingsSnap = await docSnap.ref.collection("findings").get();
  const sectionsSnap = await docSnap.ref.collection("sections").get();

  const mappedFindings = findingsSnap.docs
    .map((f) => {
      const d = f.data();
      return documentFindingSchema.parse({
        id: f.id,
        category: mapFindingCategory(d.category as string),
        title: d.title,
        severity: d.severity,
        plainEnglishExplanation: redactPii(d.plainEnglishExplanation as string),
        supportingQuote: redactPii(d.supportingQuote as string),
        pageNumber: d.pageNumber,
        confidence: d.confidence,
        buyerImpact: redactOptional(d.buyerImpact as string | undefined),
        recommendedQuestion: redactOptional(
          d.recommendedQuestion as string | undefined,
        ),
        evidenceStrength: d.evidenceStrength,
      });
    })
    .sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 };
      return rank[a.severity] - rank[b.severity] || a.pageNumber - b.pageNumber;
    });

  return strataDocumentSchema.parse({
    id: docSnap.id,
    filename: doc.filename,
    pageCount: doc.pageCount ?? null,
    status: doc.status,
    processingStatus: doc.processingStatus,
    errorMessage: doc.errorMessage ?? null,
    findings: mappedFindings,
    summary: doc.summary
      ? redactStrataSummary(doc.summary as StrataReviewSummary)
      : null,
    sections: sectionsSnap.docs.map((s) => ({ id: s.id, ...s.data() })),
    extractionMethod: doc.extractionMethod,
    extractionCoverage: doc.extractionCoverage,
    createdAt: doc.createdAt,
  });
}

async function deleteSubcollection(
  db: Firestore,
  parent: DocumentReference,
  name: string,
) {
  const snap = await parent.collection(name).get();
  if (snap.empty) return;
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export async function updateStrataRetention(
  db: Firestore,
  documentId: string,
  policy: "7d" | "30d" | "keep",
): Promise<void> {
  await db.collection(COLLECTION).doc(documentId).update({
    retentionPolicy: policy,
    retentionExpiresAt: retentionExpiresAt(policy),
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteStrataDocument(
  db: Firestore,
  documentId: string,
): Promise<void> {
  const ref = db.collection(COLLECTION).doc(documentId);
  const snap = await ref.get();
  if (!snap.exists) return;

  const storagePath = snap.data()?.storagePath as string | undefined;

  for (const sub of ["pages", "sections", "chunks", "findings"]) {
    await deleteSubcollection(db, ref, sub);
  }

  await ref.delete();

  if (storagePath) {
    try {
      await deleteFromFirebaseStorage(storagePath);
    } catch {
      // Storage file may already be gone
    }
  }
}

export async function fetchDocumentChunksFirestore(
  db: Firestore,
  documentId: string,
) {
  const chunksSnap = await db
    .collection(COLLECTION)
    .doc(documentId)
    .collection("chunks")
    .get();

  return chunksSnap.docs
    .map((c) => {
      const d = c.data();
      return {
        id: c.id,
        pageNumber: d.pageNumber as number,
        chunkIndex: d.chunkIndex as number,
        content: redactPii(d.content as string),
      };
    })
    .sort((a, b) =>
      a.pageNumber !== b.pageNumber
        ? a.pageNumber - b.pageNumber
        : a.chunkIndex - b.chunkIndex,
    );
}
