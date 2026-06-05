import { NextRequest, NextResponse } from "next/server";
import { placesAutocompleteSchema } from "@/lib/schemas";
import { rateLimit } from "@/lib/rate-limit";

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

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      suggestions: demoSuggestions(parsed.data.input),
    });
  }

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/autocomplete/json",
  );
  url.searchParams.set("input", parsed.data.input);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("components", "country:au");
  url.searchParams.set("types", "address");

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  const data = await res.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    return NextResponse.json({ suggestions: demoSuggestions(parsed.data.input) });
  }

  const suggestions = (data.predictions ?? []).map(
    (p: {
      place_id: string;
      description: string;
      structured_formatting: { main_text: string; secondary_text: string };
    }) => ({
      placeId: p.place_id,
      description: p.description,
      mainText: p.structured_formatting.main_text,
      secondaryText: p.structured_formatting.secondary_text,
    }),
  );

  return NextResponse.json({ suggestions });
}

function demoSuggestions(input: string) {
  const base = [
    {
      placeId: "demo-sydney-cbd",
      description: "123 George Street, Sydney NSW 2000, Australia",
      mainText: "123 George Street",
      secondaryText: "Sydney NSW, Australia",
    },
    {
      placeId: "demo-newtown",
      description: "88 King Street, Newtown NSW 2042, Australia",
      mainText: "88 King Street",
      secondaryText: "Newtown NSW, Australia",
    },
  ];
  return base.filter((s) =>
    s.description.toLowerCase().includes(input.toLowerCase()),
  );
}
