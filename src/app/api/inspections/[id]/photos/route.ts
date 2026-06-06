import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { uploadInspectionPhotoFirestore } from "@/lib/firebase/inspections";
import {
  assertInspectionAccess,
  AccessDeniedError,
  resolveClientCaller,
  getRateLimitKey,
} from "@/lib/auth/access";
import { rateLimit } from "@/lib/rate-limit";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: inspectionId } = await params;

  const limited = rateLimit(getRateLimitKey(request, "inspection-photo"), 30);
  if (!limited.ok) {
    return NextResponse.json({ error: "Rate limit reached" }, { status: 429 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firebase not configured", code: "OFFLINE" },
      { status: 503 },
    );
  }

  try {
    const caller = await resolveClientCaller(request);
    await assertInspectionAccess(db, inspectionId, caller);
  } catch (err) {
    if (err instanceof AccessDeniedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const itemId = formData.get("itemId");
  const caption = (formData.get("caption") as string | null) ?? "";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 8 MB" }, { status: 400 });
  }

  const contentType = file.type || "image/jpeg";
  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }

  const ext =
    contentType === "image/png"
      ? "png"
      : contentType === "image/webp"
        ? "webp"
        : "jpg";
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const photo = await uploadInspectionPhotoFirestore(
      inspectionId,
      typeof itemId === "string" ? itemId : null,
      { buffer, contentType, ext },
      caption,
    );
    return NextResponse.json({ photo });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
