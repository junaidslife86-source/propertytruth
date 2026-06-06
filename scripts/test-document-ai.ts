/**
 * Test Google Document AI credentials.
 * Run: npx tsx scripts/test-document-ai.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { GoogleAuth } from "google-auth-library";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  try {
    const content = readFileSync(path, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  } catch {
    console.warn("Could not read .env.local");
  }
}

loadEnvLocal();

const projectId = process.env.GOOGLE_DOCUMENT_AI_PROJECT_ID?.trim();
const processorId = process.env.GOOGLE_DOCUMENT_AI_PROCESSOR_ID?.trim();
const location = process.env.GOOGLE_DOCUMENT_AI_LOCATION?.trim();
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();

async function getAccessToken(): Promise<string> {
  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing FIREBASE_ADMIN_CLIENT_EMAIL or FIREBASE_ADMIN_PRIVATE_KEY",
    );
  }
  const auth = new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token.token) throw new Error("Failed to obtain access token");
  return token.token;
}

async function fetchProcessor(
  token: string,
  pid: string,
  loc: string,
  procId: string,
) {
  const url = `https://${loc}-documentai.googleapis.com/v1/projects/${pid}/locations/${loc}/processors/${procId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    json = body;
  }
  return { ok: res.ok, status: res.status, url, json };
}

async function main() {
  console.log("Document AI credential test\n");
  console.log("Configured:");
  console.log(`  GOOGLE_DOCUMENT_AI_PROJECT_ID = ${projectId ?? "(missing)"}`);
  console.log(`  GOOGLE_DOCUMENT_AI_PROCESSOR_ID = ${processorId ?? "(missing)"}`);
  console.log(`  GOOGLE_DOCUMENT_AI_LOCATION = ${location ?? "(missing)"}`);
  console.log(`  Service account = ${clientEmail ?? "(missing)"}`);
  console.log(`  Firebase project (reference) = ${firebaseProjectId ?? "(missing)"}`);
  console.log();

  if (!projectId || !processorId || !location) {
    console.error("FAIL: Set GOOGLE_DOCUMENT_AI_PROJECT_ID, PROCESSOR_ID, and LOCATION in .env.local");
    process.exit(1);
  }

  let token: string;
  try {
    token = await getAccessToken();
    console.log("OK: Service account access token obtained");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("FAIL: Auth error —", msg);
    if (msg.includes("Invalid JWT Signature") || msg.includes("invalid_grant")) {
      console.error(
        "\nThe FIREBASE_ADMIN_PRIVATE_KEY does not match FIREBASE_ADMIN_CLIENT_EMAIL.",
      );
      console.error(
        "Download a new key from Firebase Console → propertytruth → Project settings → Service accounts → Generate new private key.",
      );
    }
    process.exit(1);
  }

  const projectCandidates = [
    projectId,
    ...(firebaseProjectId && firebaseProjectId !== projectId
      ? [firebaseProjectId]
      : []),
  ];

  for (const pid of projectCandidates) {
    console.log(`\nTrying processor lookup (project: ${pid})...`);
    const result = await fetchProcessor(token, pid, location, processorId);
    if (result.ok) {
      const proc = result.json as {
        name?: string;
        displayName?: string;
        type?: string;
        state?: string;
      };
      console.log("OK: Document AI processor found");
      console.log(`  Name: ${proc.displayName ?? proc.name ?? "—"}`);
      console.log(`  Type: ${proc.type ?? "—"}`);
      console.log(`  State: ${proc.state ?? "—"}`);
      if (pid !== projectId) {
        console.log(
          `\nNOTE: Processor works with project "${pid}", not "${projectId}".`,
        );
        console.log(
          `Update .env.local: GOOGLE_DOCUMENT_AI_PROJECT_ID=${pid}`,
        );
      }
      console.log("\nDocument AI credentials are working.");
      process.exit(0);
    }

    const err = result.json as { error?: { message?: string; status?: string } };
    console.log(`FAIL (${result.status}): ${err?.error?.message ?? JSON.stringify(result.json)}`);
  }

  console.log("\n--- Troubleshooting ---");
  console.log("1. GOOGLE_DOCUMENT_AI_PROJECT_ID must be your GCP project ID (e.g. photographerbuddy-db49c),");
  console.log("   not the processor display name.");
  console.log("2. Grant the service account role: Document AI API User");
  console.log("3. Enable Cloud Document AI API in that GCP project");
  console.log("4. Processor region must match GOOGLE_DOCUMENT_AI_LOCATION exactly");
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
