import { NextResponse } from "next/server";

/** Firebase Auth uses client-side sign-in; this route is kept for legacy redirects. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/";
  return NextResponse.redirect(`${origin}${next}`);
}
