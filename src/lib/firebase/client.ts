"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from "firebase/auth";
import { getFirebaseClientConfig } from "@/lib/firebase/config";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function isFirebaseClientConfigured(): boolean {
  return getFirebaseClientConfig() !== null;
}

export function getFirebaseApp(): FirebaseApp | null {
  if (app) return app;
  const config = getFirebaseClientConfig();
  if (!config) return null;
  app = getApps()[0] ?? initializeApp(config);
  return app;
}

export function getFirebaseAuth(): Auth | null {
  if (auth) return auth;
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  auth = getAuth(firebaseApp);
  return auth;
}

export function subscribeAuthState(
  callback: (user: User | null) => void,
): () => void {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(firebaseAuth, callback);
}

export async function signInWithGoogle(): Promise<string | null> {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) return null;
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(firebaseAuth, provider);
  return result.user.getIdToken();
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<string | null> {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) return null;
  const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
  return result.user.getIdToken();
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<string | null> {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) return null;
  const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  if (displayName?.trim()) {
    await updateProfile(result.user, { displayName: displayName.trim() });
  }
  return result.user.getIdToken(true);
}

export async function signOutUser(): Promise<void> {
  const firebaseAuth = getFirebaseAuth();
  if (firebaseAuth) await signOut(firebaseAuth);
}

export async function getCurrentIdToken(forceRefresh = false): Promise<string | null> {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth?.currentUser) return null;
  return firebaseAuth.currentUser.getIdToken(forceRefresh);
}

export function getCurrentUser(): User | null {
  return getFirebaseAuth()?.currentUser ?? null;
}

export async function updateAuthDisplayName(displayName: string): Promise<void> {
  const user = getFirebaseAuth()?.currentUser;
  if (!user) throw new Error("Not signed in");
  await updateProfile(user, { displayName: displayName.trim() });
}
