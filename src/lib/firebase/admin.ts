import { readFileSync } from "fs";
import { resolve } from "path";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { hasFirebaseAdminConfig } from "@/lib/firebase/config";

let adminApp: App | null | undefined;

function normalizePrivateKey(raw: string): string {
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  return key.includes("\\n") ? key.replace(/\\n/g, "\n") : key;
}

function loadAdminCredentials(): {
  projectId: string;
  clientEmail: string;
  privateKey: string;
} {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) {
    const json = JSON.parse(
      readFileSync(resolve(process.cwd(), serviceAccountPath), "utf8"),
    ) as { project_id: string; client_email: string; private_key: string };
    return {
      projectId: json.project_id,
      clientEmail: json.client_email,
      privateKey: json.private_key,
    };
  }

  const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!privateKeyRaw) {
    throw new Error("Missing FIREBASE_ADMIN_PRIVATE_KEY or FIREBASE_SERVICE_ACCOUNT_PATH");
  }

  return {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    privateKey: normalizePrivateKey(privateKeyRaw),
  };
}

function initAdminApp(): App | null {
  if (adminApp !== undefined) return adminApp;
  if (!hasFirebaseAdminConfig()) {
    adminApp = null;
    return null;
  }

  const existing = getApps()[0];
  if (existing) {
    adminApp = existing;
    return existing;
  }

  const { projectId, clientEmail, privateKey } = loadAdminCredentials();

  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  return adminApp;
}

export function getAdminApp() {
  return initAdminApp();
}

export function getAdminDb() {
  const app = initAdminApp();
  return app ? getFirestore(app) : null;
}

export function getAdminAuth() {
  const app = initAdminApp();
  return app ? getAuth(app) : null;
}

export function getAdminStorage() {
  const app = initAdminApp();
  return app ? getStorage(app) : null;
}

export interface VerifiedUser {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
}

export async function verifyAuthToken(
  authorization: string | null,
): Promise<VerifiedUser | null> {
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length);
  const auth = getAdminAuth();
  if (!auth) return null;
  try {
    const decoded = await auth.verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email,
      displayName: decoded.name,
      photoURL: decoded.picture,
    };
  } catch {
    return null;
  }
}
