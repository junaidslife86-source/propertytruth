import { NextRequest, NextResponse } from "next/server";
import { scanRequestSchema } from "@/lib/schemas";
import { scanPropertyArea } from "@/lib/data/scan-service";
import { rateLimit } from "@/lib/rate-limit";
import { DEFAULT_SCAN_RADIUS_METERS } from "@/lib/constants";

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

  try {
    const result = await scanPropertyArea(parsed.data);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "We couldn't complete the area scan. Please try again." },
      { status: 500 },
    );
  }
}
