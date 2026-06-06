import { readFileSync, writeFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

function loadEnv() {
  const env = readFileSync(".env.local", "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    process.env[m[1]] = val.replace(/\\n/g, "\n");
  }
}

loadEnv();

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

initializeApp({
  credential: cert({
    projectId,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  }),
  storageBucket: bucketName,
});

console.log("Checking bucket:", bucketName);
const [exists] = await getStorage().bucket(bucketName).exists();
console.log("Bucket exists:", exists);
if (!exists) process.exit(1);

// Minimal valid PDF with selectable text for extraction test
const pdf = `%PDF-1.4
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj
4 0 obj<< /Length 120 >>stream
BT /F1 12 Tf 72 720 Td (Strata test: special levy approved at AGM. Admin fund deficit noted.) Tj ET
endstream endobj
5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000438 00000 n 
trailer<< /Size 6 /Root 1 0 R >>
startxref
515
%%EOF`;

const pdfPath = "/tmp/propertytruth-strata-test.pdf";
writeFileSync(pdfPath, pdf);

console.log("Uploading via API...");
const form = new FormData();
form.append("file", new Blob([pdf], { type: "application/pdf" }), "strata-test.pdf");

const uploadRes = await fetch("http://localhost:3000/api/strata/upload", {
  method: "POST",
  headers: { "x-strata-session": "test-session-" + Date.now() },
  body: form,
});
const uploadBody = await uploadRes.json();
console.log("Upload status:", uploadRes.status);
console.log("Upload body:", JSON.stringify(uploadBody, null, 2));

if (!uploadRes.ok) process.exit(1);

const docId = uploadBody.id;
console.log("Polling status for", docId);

for (let i = 0; i < 60; i++) {
  await new Promise((r) => setTimeout(r, 3000));
  const statusRes = await fetch(`http://localhost:3000/api/strata/${docId}/status`);
  const status = await statusRes.json();
  console.log(`[${i + 1}] processingStatus=${status.processingStatus} status=${status.status}`);
  if (status.processingStatus === "complete" || status.status === "ready") {
    const docRes = await fetch(`http://localhost:3000/api/strata/${docId}`);
    const doc = await docRes.json();
    console.log("Complete. Findings:", doc.findings?.length ?? 0);
    console.log("Summary:", doc.summary?.headline ?? "(none)");
    console.log("View:", `http://localhost:3000/strata/${docId}`);
    process.exit(0);
  }
  if (status.processingStatus === "failed" || status.status === "failed") {
    console.error("Processing failed:", status.errorMessage);
    process.exit(1);
  }
}

console.error("Timed out waiting for processing");
process.exit(1);
