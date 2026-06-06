import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getStrataDocumentStatus } from "@/lib/firebase/strata";
import { PROCESSING_STATUS_LABELS } from "@/lib/strata/processing-status";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const status = await getStrataDocumentStatus(db, id);
  if (!status) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...status,
    processingLabel: PROCESSING_STATUS_LABELS[status.processingStatus],
    ready: status.processingStatus === "complete",
  });
}
