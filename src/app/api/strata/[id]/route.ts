import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  assertStrataDocumentAccess,
  AccessDeniedError,
  resolveClientCaller,
  getRateLimitKey,
} from "@/lib/auth/access";
import {
  deleteStrataDocument,
  fetchStrataDocumentFirestore,
  updateStrataRetention,
} from "@/lib/firebase/strata";
import { rateLimit } from "@/lib/rate-limit";
import { DEMO_STRATA_ID, getDemoStrataDocument } from "@/lib/strata/demo";

const retentionSchema = z.object({
  retentionPolicy: z.enum(["7d", "30d", "keep"]),
});

function accessErrorResponse(err: unknown) {
  if (err instanceof AccessDeniedError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  const message = err instanceof Error ? err.message : "Request failed";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (id === DEMO_STRATA_ID) {
    return NextResponse.json(getDemoStrataDocument());
  }

  const limited = rateLimit(getRateLimitKey(request, "strata-read"), 60);
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
    const document = await fetchStrataDocumentFirestore(db, id);
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    return NextResponse.json(document);
  } catch (err) {
    return accessErrorResponse(err);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = retentionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid retention policy" }, { status: 400 });
  }

  try {
    const caller = await resolveClientCaller(request);
    await assertStrataDocumentAccess(db, id, caller);
    await updateStrataRetention(db, id, parsed.data.retentionPolicy);
    return NextResponse.json({ ok: true, retentionPolicy: parsed.data.retentionPolicy });
  } catch (err) {
    return accessErrorResponse(err);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (id === DEMO_STRATA_ID) {
    return NextResponse.json({ error: "Demo document cannot be deleted" }, { status: 400 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  try {
    const caller = await resolveClientCaller(request);
    await assertStrataDocumentAccess(db, id, caller);
    await deleteStrataDocument(db, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return accessErrorResponse(err);
  }
}
