"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
} from "firebase/auth";
import { getFirebaseClientConfig } from "@/lib/firebase/config";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

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

export async function signInWithGoogle(): Promise<string | null> {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) return null;
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(firebaseAuth, provider);
  return result.user.getIdToken();
}

export async function getCurrentIdToken(): Promise<string | null> {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth?.currentUser) return null;
  return firebaseAuth.currentUser.getIdToken();
}
