import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { downloadFromFirebaseStorage } from "@/lib/firebase/storage";
import { runStrataProcessingPipeline } from "@/lib/strata/process-pipeline";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const docSnap = await db.collection("strata_documents").doc(id).get();
  if (!docSnap.exists) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const doc = docSnap.data()!;
  if (doc.processingStatus === "complete") {
    return NextResponse.json({ ok: true, status: "complete" });
  }

  if (!doc.storagePath) {
    return NextResponse.json({ error: "PDF not found in storage" }, { status: 400 });
  }

  try {
    const buffer = await downloadFromFirebaseStorage(doc.storagePath as string);
    await runStrataProcessingPipeline(db, id, buffer);
    return NextResponse.json({ ok: true, status: "complete" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Processing failed";
    return NextResponse.json({ error: message, status: "failed" }, { status: 422 });
  }
}
