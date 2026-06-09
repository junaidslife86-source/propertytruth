/**
 * CLI: npx tsx scripts/seed-firestore-nsw.ts
 * Requires FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON.
 */
import { getAdminDb } from "../src/lib/firebase/admin";
import { seedNswFirestore } from "../src/lib/firebase/seed-nsw-data";

async function main() {
  const db = getAdminDb();
  if (!db) {
    console.error("Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT_* env vars.");
    process.exit(1);
  }

  const result = await seedNswFirestore(db);
  console.log("NSW Firestore seed complete:", result);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
