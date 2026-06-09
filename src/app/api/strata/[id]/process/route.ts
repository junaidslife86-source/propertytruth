import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { advanceStrataPipeline } from "@/lib/strata/process-chunked";
import { verifyInternalProcessSecret } from "@/lib/auth/access";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!verifyInternalProcessSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = rateLimit(`strata-process:${(await params).id}`, 3, 300_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Processing rate limit reached" }, { status: 429 });
  }

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
    const result = await advanceStrataPipeline(db, id);
    return NextResponse.json({
      ok: true,
      status: result.status,
      done: result.done,
      continue: result.continue,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Processing failed";
    return NextResponse.json({ error: "Processing failed", status: "failed" }, { status: 422 });
  }
}
