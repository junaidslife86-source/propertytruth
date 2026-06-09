import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { seedNswFirestore } from "@/lib/firebase/seed-nsw-data";

export const runtime = "nodejs";
export const maxDuration = 60;

function verifySeedSecret(request: Request): boolean {
  const secret =
    process.env.SEED_SECRET?.trim() ??
    process.env.CRON_SECRET?.trim() ??
    process.env.INTERNAL_PROCESS_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV === "development";
  const header =
    request.headers.get("x-seed-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header === secret;
}

export async function POST(request: Request) {
  if (!verifySeedSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  try {
    const result = await seedNswFirestore(db);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Seed failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
