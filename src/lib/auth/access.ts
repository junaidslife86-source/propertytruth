import type { DocumentData, Firestore } from "firebase-admin/firestore";
import { verifyAuthToken } from "@/lib/firebase/admin";

export class AccessDeniedError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AccessDeniedError";
  }
}

export interface ClientCaller {
  sessionId: string | null;
  userId: string | null;
}

export async function resolveClientCaller(request: Request): Promise<ClientCaller> {
  const user = await verifyAuthToken(request.headers.get("authorization"));
  return {
    sessionId:
      request.headers.get("x-strata-session") ??
      request.headers.get("x-inspection-session"),
    userId: user?.uid ?? null,
  };
}

export function getRateLimitKey(request: Request, prefix: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "anonymous";
  const session =
    request.headers.get("x-strata-session") ??
    request.headers.get("x-inspection-session");
  return session ? `${prefix}:session:${session}` : `${prefix}:ip:${ip}`;
}

export function verifyInternalProcessSecret(request: Request): boolean {
  const secret = process.env.INTERNAL_PROCESS_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV === "development";
  }
  return request.headers.get("x-internal-process-secret") === secret;
}

function matchesCaller(
  doc: DocumentData,
  caller: ClientCaller,
): boolean {
  if (caller.userId && doc.userId === caller.userId) return true;
  if (
    caller.sessionId &&
    doc.clientSessionId &&
    doc.clientSessionId === caller.sessionId
  ) {
    return true;
  }
  return false;
}

export async function assertStrataDocumentAccess(
  db: Firestore,
  documentId: string,
  caller: ClientCaller,
): Promise<DocumentData> {
  const snap = await db.collection("strata_documents").doc(documentId).get();
  if (!snap.exists) {
    throw new AccessDeniedError("Document not found", 404);
  }
  const doc = snap.data()!;
  if (!matchesCaller(doc, caller)) {
    throw new AccessDeniedError("You do not have access to this document", 403);
  }
  return doc;
}

export async function assertInspectionAccess(
  db: Firestore,
  inspectionId: string,
  caller: ClientCaller,
): Promise<DocumentData> {
  const snap = await db.collection("inspections").doc(inspectionId).get();
  if (!snap.exists) {
    throw new AccessDeniedError("Inspection not found", 404);
  }
  const doc = snap.data()!;
  if (!matchesCaller(doc, caller)) {
    throw new AccessDeniedError("You do not have access to this inspection", 403);
  }
  return doc;
}

export function requireClientSession(request: Request): string {
  const sessionId = request.headers.get("x-strata-session");
  if (!sessionId || sessionId.length < 8) {
    throw new AccessDeniedError(
      "Missing or invalid session. Refresh the page and try again.",
      401,
    );
  }
  return sessionId;
}
