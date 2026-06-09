"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "firebase/auth";
import {
  getCurrentIdToken,
  isFirebaseClientConfigured,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
  subscribeAuthState,
  updateAuthDisplayName,
} from "@/lib/firebase/client";
import {
  getInspectionSessionId,
  getStrataSessionId,
} from "@/lib/auth/client-session";
import type { UserDocument, UserUpdateInput } from "@/lib/auth/user-schema";
import { parseJsonResponse } from "@/lib/api/parse-response";
import { useBuyerProfileStore } from "@/stores/buyer-profile-store";
import { pullWorkspace } from "@/lib/workspace/sync-client";
import { useDueDiligenceStore } from "@/stores/due-diligence-store";

interface AuthContextValue {
  user: User | null;
  profile: UserDocument | null;
  loading: boolean;
  configured: boolean;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<UserDocument | null>;
  updateUser: (patch: UserUpdateInput) => Promise<UserDocument | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(): Promise<UserDocument | null> {
  const token = await getCurrentIdToken(true);
  if (!token) return null;

  const res = await fetch("/api/user", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return parseJsonResponse<UserDocument>(res);
}

async function linkAnonymousSessions(): Promise<void> {
  const token = await getCurrentIdToken();
  if (!token) return;

  await fetch("/api/user/link-session", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      strataSessionId: getStrataSessionId(),
      inspectionSessionId: getInspectionSessionId(),
    }),
  });
}

function hydrateBuyerProfile(profile: UserDocument) {
  if (profile.buyerProfile) {
    useBuyerProfileStore.getState().updateProfile(profile.buyerProfile);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseClientConfigured();

  const loadUserData = useCallback(async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setProfile(null);
      return;
    }

    await linkAnonymousSessions();
    const doc = await fetchProfile();
    if (doc) {
      setProfile(doc);
      hydrateBuyerProfile(doc);
    }

    const workspace = await pullWorkspace();
    if (workspace?.dueDiligence) {
      useDueDiligenceStore.setState((state) => ({
        byProperty: { ...state.byProperty, ...workspace.dueDiligence },
      }));
    }
  }, []);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    return subscribeAuthState((firebaseUser) => {
      setUser(firebaseUser);
      void loadUserData(firebaseUser).finally(() => setLoading(false));
    });
  }, [configured, loadUserData]);

  const refreshProfile = useCallback(async () => {
    const doc = await fetchProfile();
    if (doc) {
      setProfile(doc);
      hydrateBuyerProfile(doc);
    }
    return doc;
  }, []);

  const updateUser = useCallback(
    async (patch: UserUpdateInput) => {
      const token = await getCurrentIdToken(true);
      if (!token) throw new Error("Sign in required");

      if (patch.displayName) {
        await updateAuthDisplayName(patch.displayName);
      }

      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      });
      const data = await parseJsonResponse<UserDocument & { error?: string }>(res);
      if (!res.ok) {
        throw new Error(data.error ?? "Update failed");
      }

      setProfile(data as UserDocument);
      hydrateBuyerProfile(data as UserDocument);
      return data as UserDocument;
    },
    [],
  );

  const signInGoogle = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const signInEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmail(email, password);
  }, []);

  const signUpEmail = useCallback(
    async (email: string, password: string, displayName?: string) => {
      await signUpWithEmail(email, password, displayName);
    },
    [],
  );

  const signOut = useCallback(async () => {
    await signOutUser();
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      configured,
      signInGoogle,
      signInEmail,
      signUpEmail,
      signOut,
      refreshProfile,
      updateUser,
    }),
    [
      user,
      profile,
      loading,
      configured,
      signInGoogle,
      signInEmail,
      signUpEmail,
      signOut,
      refreshProfile,
      updateUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}
