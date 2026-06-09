import { NextRequest, NextResponse } from "next/server";
import { scanRequestSchema } from "@/lib/schemas";
import { ScanUnavailableError, scanPropertyArea } from "@/lib/data/scan-service";
import { rateLimit } from "@/lib/rate-limit";
import { DEFAULT_SCAN_RADIUS_METERS } from "@/lib/constants";
import { verifyAuthToken } from "@/lib/firebase/admin";
import {
  createPropertyCase,
  upsertRiskSignals,
} from "@/lib/firebase/property-cases";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const limited = rateLimit(`scan:${ip}`, 15);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many scans. Please wait a moment." },
      { status: 429 },
    );
  }

  const body = await request.json();
  const parsed = scanRequestSchema.safeParse({
    ...body,
    radiusMeters: body.radiusMeters ?? DEFAULT_SCAN_RADIUS_METERS,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid scan request" }, { status: 400 });
  }

  const identity = await verifyAuthToken(request.headers.get("authorization"));

  try {
    const result = await scanPropertyArea({
      ...parsed.data,
      userId: identity?.uid ?? null,
    });

    let propertyCaseId: string | undefined;
    if (identity) {
      const row = await createPropertyCase(result, identity.uid);
      if (row) {
        propertyCaseId = row.id;
        await upsertRiskSignals(row.id, result.buyerRiskSignals);
      }
    }

    return NextResponse.json(
      { ...result, propertyCaseId },
      {
        headers: {
          "Cache-Control": "private, max-age=300",
        },
      },
    );
  } catch (err) {
    if (err instanceof ScanUnavailableError) {
      return NextResponse.json({ error: err.message, code: "SCAN_UNAVAILABLE" }, { status: 503 });
    }
    return NextResponse.json(
      { error: "We couldn't complete the area scan. Please try again." },
      { status: 500 },
    );
  }
}
