import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

const saveSchema = z.object({
  propertyId: z.string().min(1),
  summary: z.record(z.string(), z.unknown()),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const limited = rateLimit(`saved:${ip}`, 20);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Auth not configured", code: "AUTH_REQUIRED" },
      { status: 401 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Sign in required", code: "AUTH_REQUIRED" },
      { status: 401 },
    );
  }

  const { error } = await supabase.from("saved_reports").insert({
    user_id: user.id,
    property_id: parsed.data.propertyId,
    summary: parsed.data.summary,
  });

  if (error) {
    return NextResponse.json({ error: "Could not save report" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
