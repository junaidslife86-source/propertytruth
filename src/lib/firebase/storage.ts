import { getAdminStorage } from "@/lib/firebase/admin";

const STORAGE_SETUP_MESSAGE =
  "Firebase Storage is not set up for this project. In Firebase Console → Storage → Get started, enable Cloud Storage and copy the bucket name into NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in .env.local. Billing must be enabled on the Google Cloud project (Blaze plan).";

async function getWritableBucket() {
  const storage = getAdminStorage();
  if (!storage) throw new Error("Firebase Storage not configured");

  const configured = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const candidates = [
    configured,
    projectId ? `${projectId}.firebasestorage.app` : undefined,
    projectId ? `${projectId}.appspot.com` : undefined,
  ].filter(Boolean) as string[];

  for (const name of [...new Set(candidates)]) {
    const bucket = storage.bucket(name);
    const [exists] = await bucket.exists();
    if (exists) return bucket;
  }

  throw new Error(STORAGE_SETUP_MESSAGE);
}

export async function uploadToFirebaseStorage(
  bucketPath: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const bucket = await getWritableBucket();
  const file = bucket.file(bucketPath);
  try {
    await file.save(buffer, {
      contentType,
      resumable: false,
      metadata: { cacheControl: "private, max-age=3600" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/bucket does not exist|404/i.test(message)) {
      throw new Error(STORAGE_SETUP_MESSAGE);
    }
    throw err;
  }
  return bucketPath;
}

export async function downloadFromFirebaseStorage(
  bucketPath: string,
): Promise<Buffer> {
  const bucket = await getWritableBucket();
  const [buffer] = await bucket.file(bucketPath).download();
  return buffer;
}
