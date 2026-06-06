import { NextResponse } from "next/server";
import { getAdminDb, verifyAuthToken } from "@/lib/firebase/admin";
import { createInspectionFirestore } from "@/lib/firebase/inspections";
import { createInspectionRequestSchema } from "@/lib/inspection/schemas";
import { buildRoomChecklists } from "@/lib/inspection/checklists";
import { getRateLimitKey } from "@/lib/auth/access";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(getRateLimitKey(request, "inspection-create"), 10);
  if (!limited.ok) {
    return NextResponse.json({ error: "Rate limit reached" }, { status: 429 });
  }

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

  const sessionId = request.headers.get("x-inspection-session");
  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing inspection session" },
      { status: 401 },
    );
  }

  const identity = await verifyAuthToken(request.headers.get("authorization"));

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
      userId: identity?.uid ?? null,
      checklist,
    });
    return NextResponse.json({ id });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create inspection" }, { status: 500 });
  }
}
