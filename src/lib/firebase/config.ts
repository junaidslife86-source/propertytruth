export function getFirebaseClientConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !projectId || !appId) return null;

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

export function hasFirebaseAdminConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      (process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
        (process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
          process.env.FIREBASE_ADMIN_PRIVATE_KEY)),
  );
}

export function getAddressFinderCredentials() {
  const key = process.env.ADDRESSFINDER_API_KEY?.trim();
  const secret =
    process.env.ADDRESSFINDER_SECRET_KEY?.trim() ??
    process.env.AddressFinder_SECRET_KEY?.trim();
  if (!key || !secret) return null;
  return { key, secret };
}
