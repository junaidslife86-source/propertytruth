import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  createStrataDocument,
  queueStrataDocument,
  updateStrataDocumentPath,
  uploadStrataPdf,
} from "@/lib/firebase/strata";
import { retentionExpiresAt } from "@/lib/strata/document-utils";
import {
  requireClientSession,
  getRateLimitKey,
  verifyInternalProcessSecret,
} from "@/lib/auth/access";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 50 * 1024 * 1024;
const MAX_PAGES_HINT = 500;

export async function POST(request: Request) {
  const limited = rateLimit(getRateLimitKey(request, "strata-upload"), 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Upload rate limit reached" }, { status: 429 });
  }

  const ipLimited = rateLimit(
    `strata-upload-ip:${request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon"}`,
    10,
    60_000,
  );
  if (!ipLimited.ok) {
    return NextResponse.json({ error: "Upload rate limit reached" }, { status: 429 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firebase not configured", code: "OFFLINE" },
      { status: 503 },
    );
  }

  let sessionId: string;
  try {
    sessionId = requireClientSession(request);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return NextResponse.json({ error: message }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be under 50 MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const propertyCaseId = formData.get("propertyCaseId");
  const retentionRaw = formData.get("retentionPolicy");
  const retentionPolicy =
    retentionRaw === "7d" || retentionRaw === "keep" ? retentionRaw : "30d";

  const identity = await verifyAuthToken(request.headers.get("authorization"));

  let documentId: string;
  try {
    documentId = await createStrataDocument(db, {
      filename: file.name,
      clientSessionId: sessionId,
      userId: identity?.uid ?? null,
      propertyCaseId:
        typeof propertyCaseId === "string" ? propertyCaseId : null,
    });
    await db.collection("strata_documents").doc(documentId).update({
      retentionPolicy,
      retentionExpiresAt: retentionExpiresAt(retentionPolicy),
    });
    const storagePath = await uploadStrataPdf(documentId, file.name, buffer);
    await updateStrataDocumentPath(db, documentId, storagePath);
    await queueStrataDocument(db, documentId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const origin = new URL(request.url).origin;
  const processHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const secret = process.env.INTERNAL_PROCESS_SECRET?.trim();
  if (secret) {
    processHeaders["x-internal-process-secret"] = secret;
  }

  void fetch(`${origin}/api/strata/${documentId}/process`, {
    method: "POST",
    headers: processHeaders,
  }).catch((err) => console.error("[strata] failed to trigger process", err));

  return NextResponse.json({
    id: documentId,
    status: "queued",
    processingStatus: "queued",
    message: `Processing started. Large bundles (${MAX_PAGES_HINT}+ pages) may take several minutes.`,
  });
}
