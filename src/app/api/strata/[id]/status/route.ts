import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getStrataDocumentStatus } from "@/lib/firebase/strata";
import { advanceStrataPipeline } from "@/lib/strata/process-chunked";
import {
  assertStrataDocumentAccess,
  AccessDeniedError,
  resolveClientCaller,
  getRateLimitKey,
} from "@/lib/auth/access";
import { rateLimit } from "@/lib/rate-limit";
import { DEMO_STRATA_ID } from "@/lib/strata/demo";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (id === DEMO_STRATA_ID) {
    return NextResponse.json({
      processingStatus: "complete",
      status: "ready",
      ready: true,
    });
  }

  const limited = rateLimit(getRateLimitKey(request, "strata-status"), 120);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  try {
    const caller = await resolveClientCaller(request);
    await assertStrataDocumentAccess(db, id, caller);
    let status = await getStrataDocumentStatus(db, id);
    if (!status) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (
      status.processingStatus !== "complete" &&
      status.processingStatus !== "failed"
    ) {
      try {
        await advanceStrataPipeline(db, id);
        status = (await getStrataDocumentStatus(db, id)) ?? status;
      } catch (err) {
        console.error("[strata-status] pipeline advance failed", err);
      }
    }

    return NextResponse.json({
      ...status,
      ready: status.processingStatus === "complete",
    });
  } catch (err) {
    if (err instanceof AccessDeniedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Status unavailable" }, { status: 500 });
  }
}
