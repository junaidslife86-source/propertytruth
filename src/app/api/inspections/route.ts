import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { createInspectionFirestore } from "@/lib/firebase/inspections";
import { createInspectionRequestSchema } from "@/lib/inspection/schemas";
import { buildRoomChecklists } from "@/lib/inspection/checklists";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createInspectionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firebase not configured", code: "OFFLINE" },
      { status: 503 },
    );
  }

  const sessionId = request.headers.get("x-inspection-session") ?? null;
  const checklist = buildRoomChecklists(
    parsed.data.propertyType,
    parsed.data.selectedRooms,
  );

  try {
    const id = await createInspectionFirestore(db, {
      propertyAddress: parsed.data.propertyAddress,
      propertyType: parsed.data.propertyType,
      selectedRooms: parsed.data.selectedRooms,
      clientSessionId: sessionId,
      checklist,
    });
    return NextResponse.json({ id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create inspection";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
