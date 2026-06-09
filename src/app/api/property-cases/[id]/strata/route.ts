import { NextResponse } from "next/server";
import { getAdminDb, verifyAuthToken } from "@/lib/firebase/admin";
import { getPropertyCase } from "@/lib/firebase/property-cases";
import { listStrataByPropertyCase } from "@/lib/firebase/strata-cases";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const identity = await verifyAuthToken(request.headers.get("authorization"));
  if (!identity) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const row = await getPropertyCase(id);
  if (!row || row.userId !== identity.uid) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const documents = await listStrataByPropertyCase(id, identity.uid);
  return NextResponse.json({ documents });
}
