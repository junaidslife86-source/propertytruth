import { NextResponse } from "next/server";
import { getAdminDb, verifyAuthToken } from "@/lib/firebase/admin";
import {
  ensureUserDocument,
  getUserDocument,
  syncAuthProfileFields,
  updateUserDocument,
} from "@/lib/firebase/users";
import { userUpdateSchema } from "@/lib/auth/user-schema";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json(
    { error: "Sign in required", code: "AUTH_REQUIRED" },
    { status: 401 },
  );
}

export async function GET(request: Request) {
  const limited = rateLimit(
    `user-read:${request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon"}`,
    60,
  );
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      {
        error:
          "Firebase Admin is not configured on the server. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_ADMIN_* in Vercel.",
        code: "FIREBASE_ADMIN_MISSING",
      },
      { status: 503 },
    );
  }

  const identity = await verifyAuthToken(request.headers.get("authorization"));
  if (!identity) return unauthorized();

  try {
    let doc = await getUserDocument(db, identity.uid);
    if (!doc) {
      doc = await ensureUserDocument(db, identity);
    } else {
      doc = await syncAuthProfileFields(db, identity);
    }
    return NextResponse.json(doc);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const limited = rateLimit(
    `user-write:${request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon"}`,
    30,
  );
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      {
        error:
          "Firebase Admin is not configured on the server. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_ADMIN_* in Vercel.",
        code: "FIREBASE_ADMIN_MISSING",
      },
      { status: 503 },
    );
  }

  const identity = await verifyAuthToken(request.headers.get("authorization"));
  if (!identity) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid update", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    await ensureUserDocument(db, identity);
    const doc = await updateUserDocument(db, identity.uid, parsed.data, identity);
    return NextResponse.json(doc);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
