import type { Firestore } from "firebase-admin/firestore";
import {
  DEFAULT_USER_BUYER_PROFILE,
  DEFAULT_USER_PREFERENCES,
  userDocumentSchema,
  type UserDocument,
  type UserUpdateInput,
} from "@/lib/auth/user-schema";

const COLLECTION = "users";

export interface AuthIdentity {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

export async function getUserDocument(
  db: Firestore,
  uid: string,
): Promise<UserDocument | null> {
  const snap = await db.collection(COLLECTION).doc(uid).get();
  if (!snap.exists) return null;
  return userDocumentSchema.parse({ uid, ...snap.data() });
}

export async function ensureUserDocument(
  db: Firestore,
  identity: AuthIdentity,
): Promise<UserDocument> {
  const existing = await getUserDocument(db, identity.uid);
  if (existing) return existing;

  const now = new Date().toISOString();
  const doc: UserDocument = {
    uid: identity.uid,
    email: identity.email ?? "",
    displayName: identity.displayName ?? identity.email?.split("@")[0] ?? "Buyer",
    photoURL: identity.photoURL ?? null,
    phone: null,
    createdAt: now,
    updatedAt: now,
    preferences: DEFAULT_USER_PREFERENCES,
    buyerProfile: DEFAULT_USER_BUYER_PROFILE,
    onboardingCompleted: false,
  };

  await db.collection(COLLECTION).doc(identity.uid).set(doc);
  return doc;
}

export async function updateUserDocument(
  db: Firestore,
  uid: string,
  patch: UserUpdateInput,
): Promise<UserDocument> {
  const ref = db.collection(COLLECTION).doc(uid);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new Error("User profile not found");
  }

  const current = userDocumentSchema.parse({ uid, ...snap.data() });
  const now = new Date().toISOString();

  const next: UserDocument = {
    ...current,
    displayName: patch.displayName ?? current.displayName,
    phone: patch.phone !== undefined ? patch.phone : current.phone,
    onboardingCompleted:
      patch.onboardingCompleted ?? current.onboardingCompleted,
    preferences: patch.preferences
      ? { ...current.preferences, ...patch.preferences }
      : current.preferences,
    buyerProfile: patch.buyerProfile
      ? { ...current.buyerProfile, ...patch.buyerProfile }
      : current.buyerProfile,
    updatedAt: now,
  };

  await ref.set(next, { merge: true });
  return next;
}

export async function syncAuthProfileFields(
  db: Firestore,
  identity: AuthIdentity,
): Promise<UserDocument> {
  const ref = db.collection(COLLECTION).doc(identity.uid);
  const snap = await ref.get();
  if (!snap.exists) {
    return ensureUserDocument(db, identity);
  }

  const current = userDocumentSchema.parse({ uid: identity.uid, ...snap.data() });
  const updates: Partial<UserDocument> = {
    updatedAt: new Date().toISOString(),
  };

  if (identity.email && identity.email !== current.email) {
    updates.email = identity.email;
  }
  if (identity.photoURL && identity.photoURL !== current.photoURL) {
    updates.photoURL = identity.photoURL;
  }
  if (
    identity.displayName &&
    !current.displayName &&
    identity.displayName !== current.displayName
  ) {
    updates.displayName = identity.displayName;
  }

  if (Object.keys(updates).length > 1) {
    await ref.set(updates, { merge: true });
    return userDocumentSchema.parse({ ...current, ...updates });
  }

  return current;
}

export async function linkAnonymousSessions(
  db: Firestore,
  uid: string,
  input: { strataSessionId?: string | null; inspectionSessionId?: string | null },
): Promise<{ strataLinked: number; inspectionsLinked: number }> {
  let strataLinked = 0;
  let inspectionsLinked = 0;

  if (input.strataSessionId) {
    const strataSnap = await db
      .collection("strata_documents")
      .where("clientSessionId", "==", input.strataSessionId)
      .get();
    const batch = db.batch();
    for (const doc of strataSnap.docs) {
      const data = doc.data();
      if (!data.userId) {
        batch.update(doc.ref, { userId: uid, updatedAt: new Date().toISOString() });
        strataLinked += 1;
      }
    }
    if (strataLinked > 0) await batch.commit();
  }

  if (input.inspectionSessionId) {
    const inspectionSnap = await db
      .collection("inspections")
      .where("clientSessionId", "==", input.inspectionSessionId)
      .get();
    const batch = db.batch();
    for (const doc of inspectionSnap.docs) {
      const data = doc.data();
      if (!data.userId) {
        batch.update(doc.ref, { userId: uid, updatedAt: new Date().toISOString() });
        inspectionsLinked += 1;
      }
    }
    if (inspectionsLinked > 0) await batch.commit();
  }

  return { strataLinked, inspectionsLinked };
}
