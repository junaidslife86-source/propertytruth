import type { Firestore } from "firebase-admin/firestore";
import type { PropertyType, RoomType } from "@/lib/inspection/schemas";
import { uploadToFirebaseStorage } from "@/lib/firebase/storage";

export async function createInspectionFirestore(
  db: Firestore,
  input: {
    propertyAddress: string;
    propertyType: PropertyType;
    selectedRooms: RoomType[];
    clientSessionId: string | null;
    userId?: string | null;
    checklist: { roomType: RoomType; key: string; label: string }[];
  },
): Promise<string> {
  const ref = db.collection("inspections").doc();
  const now = new Date().toISOString();

  await ref.set({
    propertyAddress: input.propertyAddress,
    propertyType: input.propertyType,
    clientSessionId: input.clientSessionId,
    userId: input.userId ?? null,
    status: "in_progress",
    createdAt: now,
    updatedAt: now,
  });

  for (let i = 0; i < input.selectedRooms.length; i++) {
    const roomType = input.selectedRooms[i];
    const roomRef = ref.collection("rooms").doc();
    await roomRef.set({ roomType, sortOrder: i });

    const roomItems = input.checklist.filter((c) => c.roomType === roomType);
    const batch = db.batch();
    roomItems.forEach((item, idx) => {
      const itemRef = roomRef.collection("items").doc();
      batch.set(itemRef, {
        checklistKey: item.key,
        label: item.label,
        sortOrder: idx,
        severity: "not_checked",
        notes: "",
      });
    });
    await batch.commit();
  }

  return ref.id;
}

export async function uploadInspectionPhotoFirestore(
  inspectionId: string,
  itemId: string | null,
  file: { buffer: Buffer; contentType: string; ext: string },
  caption: string,
): Promise<{ id: string; storagePath: string; caption: string; createdAt: string }> {
  const photoId = crypto.randomUUID();
  const storagePath = `inspection-photos/${inspectionId}/${photoId}.${file.ext}`;
  await uploadToFirebaseStorage(storagePath, file.buffer, file.contentType);

  const { getAdminDb } = await import("@/lib/firebase/admin");
  const db = getAdminDb();
  if (!db) throw new Error("Firestore not configured");

  const createdAt = new Date().toISOString();
  const photoRef = db
    .collection("inspections")
    .doc(inspectionId)
    .collection("photos")
    .doc(photoId);

  await photoRef.set({
    itemId,
    storagePath,
    caption,
    createdAt,
  });

  return { id: photoId, storagePath, caption, createdAt };
}
