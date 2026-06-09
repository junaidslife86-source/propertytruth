import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuthToken, getAdminDb } from "@/lib/firebase/admin";
import { getUserWorkspace, saveUserWorkspace } from "@/lib/firebase/workspace";
import { rateLimit } from "@/lib/rate-limit";

const dueDiligenceItemSchema = z.object({
  id: z.string(),
  category: z.enum([
    "finance",
    "contract",
    "building_inspection",
    "pest_inspection",
    "strata",
    "insurance",
    "council_planning",
    "conveyancer",
    "offer",
    "settlement",
  ]),
  label: z.string(),
  status: z.enum([
    "not_started",
    "in_progress",
    "concern_found",
    "cleared",
    "not_applicable",
  ]),
  required: z.boolean(),
  notes: z.string(),
});

const syncSchema = z.object({
  shortlistIds: z.array(z.string()).max(50).optional(),
  compareIds: z.array(z.string()).max(4).optional(),
  dueDiligence: z.record(z.string(), z.array(dueDiligenceItemSchema)).optional(),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  const identity = await verifyAuthToken(request.headers.get("authorization"));
  if (!identity) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const workspace = await getUserWorkspace(identity.uid);
  return NextResponse.json(workspace);
}

export async function POST(request: Request) {
  const limited = rateLimit(
    `workspace-sync:${request.headers.get("x-forwarded-for") ?? "anon"}`,
    60,
  );
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const identity = await verifyAuthToken(request.headers.get("authorization"));
  if (!identity) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

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

  const parsed = syncSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid workspace payload" }, { status: 400 });
  }

  const workspace = await saveUserWorkspace(identity.uid, parsed.data);
  return NextResponse.json(workspace);
}
