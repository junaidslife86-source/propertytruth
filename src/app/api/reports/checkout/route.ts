import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { getPropertyCase } from "@/lib/firebase/property-cases";
import { isTestingMode } from "@/lib/config/app-mode";

const bodySchema = z.object({
  propertyCaseId: z.string().min(1),
});

/**
 * Stripe checkout stub — returns report URL in testing mode.
 */
export async function POST(request: Request) {
  const identity = await verifyAuthToken(request.headers.get("authorization"));
  if (!identity) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const row = await getPropertyCase(parsed.data.propertyCaseId);
  if (!row || row.userId !== identity.uid) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeKey || isTestingMode()) {
    return NextResponse.json({
      mode: "testing",
      message: "Checkout skipped in testing — download preview report instead.",
      reportUrl: `/api/reports/${parsed.data.propertyCaseId}`,
    });
  }

  return NextResponse.json(
    {
      error: "Stripe checkout not wired yet",
      code: "CHECKOUT_NOT_CONFIGURED",
    },
    { status: 501 },
  );
}
