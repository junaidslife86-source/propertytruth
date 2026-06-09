import { NextResponse } from "next/server";
import { getAdminDb, verifyAuthToken } from "@/lib/firebase/admin";
import {
  createPropertyCase,
  listPropertyCases,
  upsertRiskSignals,
} from "@/lib/firebase/property-cases";
import { propertyScanResultSchema } from "@/lib/schemas";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json(
    { error: "Sign in required", code: "AUTH_REQUIRED" },
    { status: 401 },
  );
}

export async function GET(request: Request) {
  const identity = await verifyAuthToken(request.headers.get("authorization"));
  if (!identity) return unauthorized();

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const cases = await listPropertyCases(identity.uid);
  return NextResponse.json({ cases });
}

export async function POST(request: Request) {
  const limited = rateLimit(
    `property-case-create:${request.headers.get("x-forwarded-for") ?? "anon"}`,
    30,
  );
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const identity = await verifyAuthToken(request.headers.get("authorization"));
  if (!identity) return unauthorized();

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

  const scanParsed = propertyScanResultSchema.safeParse(
    (body as { scan?: unknown })?.scan ?? body,
  );
  if (!scanParsed.success) {
    return NextResponse.json({ error: "Invalid scan payload" }, { status: 400 });
  }

  const row = await createPropertyCase(scanParsed.data, identity.uid);
  if (!row) {
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 });
  }

  await upsertRiskSignals(row.id, scanParsed.data.buyerRiskSignals);
  return NextResponse.json(row, { status: 201 });
}
