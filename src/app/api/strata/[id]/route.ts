import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { fetchStrataDocumentFirestore } from "@/lib/firebase/strata";
import { DEMO_STRATA_ID, getDemoStrataDocument } from "@/lib/strata/demo";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (id === DEMO_STRATA_ID) {
    return NextResponse.json(getDemoStrataDocument());
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firebase not configured" },
      { status: 503 },
    );
  }

  const document = await fetchStrataDocumentFirestore(db, id);
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(document);
}
