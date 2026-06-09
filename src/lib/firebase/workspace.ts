import type { DueDiligenceItem } from "@/lib/due-diligence/types";
import { getAdminDb } from "@/lib/firebase/admin";

export interface UserWorkspace {
  shortlistIds: string[];
  compareIds: string[];
  dueDiligence: Record<string, DueDiligenceItem[]>;
  updatedAt: string;
}

const EMPTY_WORKSPACE: UserWorkspace = {
  shortlistIds: [],
  compareIds: [],
  dueDiligence: {},
  updatedAt: new Date().toISOString(),
};

export async function getUserWorkspace(userId: string): Promise<UserWorkspace> {
  const db = getAdminDb();
  if (!db) return EMPTY_WORKSPACE;

  const snap = await db.collection("users").doc(userId).get();
  const ws = snap.data()?.workspace as UserWorkspace | undefined;
  return ws ?? EMPTY_WORKSPACE;
}

export async function saveUserWorkspace(
  userId: string,
  patch: Partial<UserWorkspace>,
): Promise<UserWorkspace> {
  const db = getAdminDb();
  if (!db) return { ...EMPTY_WORKSPACE, ...patch };

  const ref = db.collection("users").doc(userId);
  const current = await getUserWorkspace(userId);
  const next: UserWorkspace = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await ref.set({ workspace: next }, { merge: true });
  return next;
}
