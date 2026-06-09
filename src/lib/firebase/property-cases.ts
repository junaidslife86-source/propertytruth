import type { PropertyScanResult } from "@/lib/schemas";
import { getAdminDb } from "@/lib/firebase/admin";

export interface PropertyCaseRow {
  id: string;
  userId: string | null;
  address: string;
  formattedAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  propertyType: string | null;
  status: string;
  confidenceScore: number | null;
  confidenceLabel: string | null;
  scanSnapshot: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export async function createPropertyCase(
  scan: PropertyScanResult,
  userId?: string | null,
): Promise<PropertyCaseRow | null> {
  const db = getAdminDb();
  if (!db) return null;

  const ref = db.collection("property_cases").doc();
  const now = new Date().toISOString();
  const row = {
    userId: userId ?? null,
    address: scan.formattedAddress,
    formattedAddress: scan.formattedAddress,
    latitude: scan.lat,
    longitude: scan.lng,
    propertyType: null,
    status: "explore",
    confidenceScore: scan.confidenceScore.score,
    confidenceLabel: scan.confidenceScore.label,
    scanSnapshot: scan,
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(row);
  return { id: ref.id, ...row };
}

export async function getPropertyCase(
  id: string,
): Promise<PropertyCaseRow | null> {
  const db = getAdminDb();
  if (!db) return null;

  const snap = await db.collection("property_cases").doc(id).get();
  if (!snap.exists) return null;
  const d = snap.data()!;
  return {
    id: snap.id,
    userId: d.userId ?? null,
    address: d.address,
    formattedAddress: d.formattedAddress ?? null,
    latitude: d.latitude ?? null,
    longitude: d.longitude ?? null,
    propertyType: d.propertyType ?? null,
    status: d.status ?? "explore",
    confidenceScore: d.confidenceScore ?? null,
    confidenceLabel: d.confidenceLabel ?? null,
    scanSnapshot: d.scanSnapshot ?? {},
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

export async function listPropertyCases(
  userId: string,
): Promise<PropertyCaseRow[]> {
  const db = getAdminDb();
  if (!db) return [];

  const snap = await db
    .collection("property_cases")
    .where("userId", "==", userId)
    .get();

  return snap.docs
    .map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        userId: d.userId ?? null,
        address: d.address,
        formattedAddress: d.formattedAddress ?? null,
        latitude: d.latitude ?? null,
        longitude: d.longitude ?? null,
        propertyType: d.propertyType ?? null,
        status: d.status ?? "explore",
        confidenceScore: d.confidenceScore ?? null,
        confidenceLabel: d.confidenceLabel ?? null,
        scanSnapshot: d.scanSnapshot ?? {},
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export async function upsertRiskSignals(
  propertyCaseId: string,
  signals: PropertyScanResult["buyerRiskSignals"],
): Promise<void> {
  const db = getAdminDb();
  if (!db) return;

  const caseRef = db.collection("property_cases").doc(propertyCaseId);
  const signalsCol = caseRef.collection("risk_signals");
  const existing = await signalsCol.get();
  const batch = db.batch();
  existing.docs.forEach((d) => batch.delete(d.ref));

  for (const s of signals) {
    const ref = signalsCol.doc();
    batch.set(ref, {
      category: s.category,
      severity: s.severity,
      title: s.title,
      plainEnglishSummary: s.plainEnglishSummary,
      buyerImpact: s.buyerQuestion,
      recommendedAction: s.buyerQuestion,
      confidence: s.confidence === "high" ? 0.9 : s.confidence === "medium" ? 0.6 : 0.3,
      evidenceSources: [{ label: s.evidenceSource, sourceUrl: s.sourceUrl }],
      rawData: s,
      createdAt: new Date().toISOString(),
    });
  }
  await batch.commit();
}

export async function updatePropertyCase(
  id: string,
  userId: string,
  patch: Partial<{
    status: string;
    propertyType: string | null;
    linkedStrataDocumentIds: string[];
    linkedInspectionIds: string[];
  }>,
): Promise<PropertyCaseRow | null> {
  const db = getAdminDb();
  if (!db) return null;

  const ref = db.collection("property_cases").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  if (snap.data()?.userId !== userId) return null;

  await ref.update({
    ...patch,
    updatedAt: new Date().toISOString(),
  });
  return getPropertyCase(id);
}

export async function deleteUserPropertyCases(
  userId: string,
): Promise<number> {
  const db = getAdminDb();
  if (!db) return 0;

  const snap = await db
    .collection("property_cases")
    .where("userId", "==", userId)
    .get();
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return snap.size;
}

export async function updateConfidenceScore(
  propertyCaseId: string,
  score: number,
  label: string,
): Promise<void> {
  const db = getAdminDb();
  if (!db) return;

  await db.collection("property_cases").doc(propertyCaseId).update({
    confidenceScore: score,
    confidenceLabel: label,
    updatedAt: new Date().toISOString(),
  });
}
