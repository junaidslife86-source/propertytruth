import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb, verifyAuthToken } from "@/lib/firebase/admin";
import { ensureUserDocument, linkAnonymousSessions } from "@/lib/firebase/users";
import { rateLimit } from "@/lib/rate-limit";

const linkSchema = z.object({
  strataSessionId: z.string().min(8).optional(),
  inspectionSessionId: z.string().min(8).optional(),
});

export async function POST(request: Request) {
  const limited = rateLimit(
    `user-link:${request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon"}`,
    10,
  );
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const identity = await verifyAuthToken(request.headers.get("authorization"));
  if (!identity) {
    return NextResponse.json(
      { error: "Sign in required", code: "AUTH_REQUIRED" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = linkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid session payload" }, { status: 400 });
  }

  try {
    await ensureUserDocument(db, identity);
    const result = await linkAnonymousSessions(db, identity.uid, parsed.data);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Link failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
