import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

function verifyCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV === "development";
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}` || request.headers.get("x-cron-secret") === secret;
}

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const now = new Date().toISOString();
  const snap = await db
    .collection("strata_documents")
    .where("retentionExpiresAt", "<=", now)
    .limit(50)
    .get();

  let deleted = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.retentionPolicy === "keep") continue;

    for (const sub of ["pages", "sections", "chunks", "findings"]) {
      const subSnap = await doc.ref.collection(sub).get();
      const batch = db.batch();
      subSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    await doc.ref.delete();
    deleted += 1;
  }

  return NextResponse.json({ ok: true, deleted, checkedAt: now });
}
