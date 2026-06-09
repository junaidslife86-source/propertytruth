import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { getPropertyCase } from "@/lib/firebase/property-cases";
import { propertyScanResultSchema } from "@/lib/schemas";
import { calculateDueDiligenceCoverage } from "@/lib/due-diligence/coverage";
import { getUserWorkspace } from "@/lib/firebase/workspace";
import { isTestingMode } from "@/lib/config/app-mode";

export const runtime = "nodejs";

/**
 * One-off buyer report payload (JSON stub — PDF generation later).
 * Stripe checkout wires here in a follow-up; testing returns preview JSON.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const { caseId } = await params;
  const identity = await verifyAuthToken(request.headers.get("authorization"));
  if (!identity) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const row = await getPropertyCase(caseId);
  if (!row || row.userId !== identity.uid) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const scanParsed = propertyScanResultSchema.safeParse(row.scanSnapshot);
  if (!scanParsed.success) {
    return NextResponse.json({ error: "Scan data unavailable" }, { status: 422 });
  }

  const workspace = await getUserWorkspace(identity.uid);
  const ddItems = workspace.dueDiligence[caseId] ?? [];
  const coverage = calculateDueDiligenceCoverage(scanParsed.data, ddItems, {
    hasInspection: false,
    hasStrataScan: false,
  });

  return NextResponse.json({
    reportType: "buyer_report_v1",
    priceAud: 29,
    testingMode: isTestingMode(),
    paymentRequired: false,
    generatedAt: new Date().toISOString(),
    property: {
      address: row.formattedAddress ?? row.address,
      caseId,
      confidence: scanParsed.data.confidenceScore,
    },
    scan: scanParsed.data,
    dueDiligence: {
      items: ddItems,
      coverage,
    },
    disclaimer:
      "This report summarises labelled sample and uploaded data for buyer education. It is not legal, financial, or building advice.",
  });
}
