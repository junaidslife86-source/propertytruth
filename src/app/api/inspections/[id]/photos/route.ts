import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { uploadInspectionPhotoFirestore } from "@/lib/firebase/inspections";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: inspectionId } = await params;
  const db = getAdminDb();

  if (!db) {
    return NextResponse.json(
      {
        error: "Firebase not configured",
        code: "OFFLINE",
        message: "Photo saved locally on this device only.",
      },
      { status: 503 },
    );
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

  const ext = file.name.split(".").pop() ?? "jpg";
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const photo = await uploadInspectionPhotoFirestore(
      inspectionId,
      typeof itemId === "string" ? itemId : null,
      { buffer, contentType: file.type || "image/jpeg", ext },
      caption,
    );
    return NextResponse.json({ photo });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
