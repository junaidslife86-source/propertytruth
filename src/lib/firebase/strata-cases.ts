import { getAdminDb } from "@/lib/firebase/admin";
import type { StrataReviewSummary } from "@/lib/strata/summary";

export interface LinkedStrataDocument {
  id: string;
  filename: string;
  processingStatus: string;
  status: string;
  findingCount: number;
  highSeverityCount: number;
  summary: StrataReviewSummary | null;
}

export async function listStrataByPropertyCase(
  propertyCaseId: string,
  userId: string,
): Promise<LinkedStrataDocument[]> {
  const db = getAdminDb();
  if (!db) return [];

  const snap = await db
    .collection("strata_documents")
    .where("propertyCaseId", "==", propertyCaseId)
    .where("userId", "==", userId)
    .get();

  return snap.docs
    .map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        filename: (d.filename as string) ?? "Strata report",
        processingStatus: (d.processingStatus as string) ?? "queued",
        status: (d.status as string) ?? "uploaded",
        findingCount: (d.findingCount as number) ?? 0,
        highSeverityCount: (d.highSeverityCount as number) ?? 0,
        summary: (d.summary as StrataReviewSummary | null) ?? null,
      };
    })
    .sort(
      (a, b) =>
        (b.summary ? 1 : 0) - (a.summary ? 1 : 0) ||
        b.findingCount - a.findingCount,
    );
}
