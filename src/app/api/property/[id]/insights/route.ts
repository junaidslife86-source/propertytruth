import { NextRequest, NextResponse } from "next/server";
import { propertyScanResultSchema } from "@/lib/schemas";
import { generateAreaInsight } from "@/lib/ai/gemini";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const limited = rateLimit(`insights:${ip}`, 10);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429 },
    );
  }

  const body = await request.json();
  const scan = propertyScanResultSchema.safeParse(body.scan);
  if (!scan.success || scan.data.propertyId !== decodeURIComponent(id)) {
    return NextResponse.json({ error: "Invalid insight request" }, { status: 400 });
  }

  try {
    const insight = await generateAreaInsight(scan.data);
    return NextResponse.json(insight, {
      headers: { "Cache-Control": "private, max-age=600" },
    });
  } catch {
    return NextResponse.json(
      { error: "Summary unavailable right now." },
      { status: 500 },
    );
  }
}
