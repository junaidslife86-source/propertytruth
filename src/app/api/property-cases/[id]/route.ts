import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb, verifyAuthToken } from "@/lib/firebase/admin";
import { getPropertyCase, updatePropertyCase } from "@/lib/firebase/property-cases";
import { propertyScanResultSchema } from "@/lib/schemas";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const patchSchema = z.object({
  status: z.enum(["explore", "shortlist", "comparing", "archived"]).optional(),
  propertyType: z.string().nullable().optional(),
  linkedStrataDocumentIds: z.array(z.string()).optional(),
  linkedInspectionIds: z.array(z.string()).optional(),
});

function unauthorized() {
  return NextResponse.json(
    { error: "Sign in required", code: "AUTH_REQUIRED" },
    { status: 401 },
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const identity = await verifyAuthToken(request.headers.get("authorization"));

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const row = await getPropertyCase(id);
  if (!row) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  if (row.userId && identity?.uid !== row.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const scanParsed = propertyScanResultSchema.safeParse(row.scanSnapshot);
  return NextResponse.json({
    case: row,
    scan: scanParsed.success ? scanParsed.data : null,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const limited = rateLimit(`property-case-patch:${id}`, 60);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const identity = await verifyAuthToken(request.headers.get("authorization"));
  if (!identity) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }

  const updated = await updatePropertyCase(id, identity.uid, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
