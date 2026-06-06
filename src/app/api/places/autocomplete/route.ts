import { NextRequest, NextResponse } from "next/server";
import { placesAutocompleteSchema } from "@/lib/schemas";
import { rateLimit } from "@/lib/rate-limit";
import { fetchPlaceSuggestions } from "@/lib/places/autocomplete";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const limited = rateLimit(`places:${ip}`, 40);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 },
    );
  }

  const input = request.nextUrl.searchParams.get("input") ?? "";
  const parsed = placesAutocompleteSchema.safeParse({ input });
  if (!parsed.success) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const { suggestions, source } = await fetchPlaceSuggestions(parsed.data.input);
    return NextResponse.json({ suggestions, source });
  } catch (err) {
    console.error("[places/autocomplete]", err);
    return NextResponse.json({ suggestions: [], error: "Autocomplete unavailable" });
  }
}
