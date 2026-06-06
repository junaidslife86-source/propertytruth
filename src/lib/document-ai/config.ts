import { hasFirebaseAdminConfig } from "@/lib/firebase/config";

export function getDocumentAiConfig() {
  const projectId =
    process.env.GOOGLE_DOCUMENT_AI_PROJECT_ID?.trim() ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const processorId = process.env.GOOGLE_DOCUMENT_AI_PROCESSOR_ID?.trim();
  const location = process.env.GOOGLE_DOCUMENT_AI_LOCATION?.trim();

  if (!projectId || !processorId || !location || !hasFirebaseAdminConfig()) {
    return null;
  }

  return { projectId, processorId, location };
}

export function isDocumentAiConfigured(): boolean {
  return getDocumentAiConfig() !== null;
}
