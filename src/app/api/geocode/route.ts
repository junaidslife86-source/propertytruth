import { NextRequest, NextResponse } from "next/server";
import { geocodeRequestSchema } from "@/lib/schemas";
import { rateLimit } from "@/lib/rate-limit";
import { SYDNEY_BOUNDS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const limited = rateLimit(`geocode:${ip}`, 20);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 },
    );
  }

  const body = await request.json();
  const parsed = geocodeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid geocode request" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (parsed.data.placeId?.startsWith("demo-") || !apiKey) {
    return NextResponse.json(demoGeocode(parsed.data.placeId, parsed.data.address));
  }

  let url: URL;
  if (parsed.data.placeId) {
    url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("place_id", parsed.data.placeId);
    url.searchParams.set("key", apiKey);
  } else {
    url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("address", `${parsed.data.address}, Sydney NSW, Australia`);
    url.searchParams.set("key", apiKey);
  }

  const res = await fetch(url.toString());
  const data = await res.json();
  const result = data.results?.[0];

  if (!result) {
    return NextResponse.json(
      { error: "We couldn't find that address. Try a Sydney property." },
      { status: 404 },
    );
  }

  const { lat, lng } = result.geometry.location;
  if (!isInSydney(lat, lng)) {
    return NextResponse.json(
      { error: "Please enter a property within greater Sydney." },
      { status: 400 },
    );
  }

  const components = result.address_components as Array<{
    types: string[];
    long_name: string;
    short_name: string;
  }>;

  return NextResponse.json({
    formattedAddress: result.formatted_address,
    lat: Number(lat),
    lng: Number(lng),
    suburb: findComponent(components, "locality") ?? findComponent(components, "sublocality") ?? undefined,
    postcode: findComponent(components, "postal_code") ?? undefined,
    placeId: result.place_id,
  });
}

function findComponent(
  components: Array<{ types: string[]; long_name: string }>,
  type: string,
) {
  return components.find((c) => c.types.includes(type))?.long_name;
}

function isInSydney(lat: number, lng: number) {
  return (
    lat >= SYDNEY_BOUNDS.minLat &&
    lat <= SYDNEY_BOUNDS.maxLat &&
    lng >= SYDNEY_BOUNDS.minLng &&
    lng <= SYDNEY_BOUNDS.maxLng
  );
}

function demoGeocode(placeId?: string, address?: string) {
  if (placeId === "demo-newtown" || address?.toLowerCase().includes("newtown")) {
    return {
      formattedAddress: "88 King Street, Newtown NSW 2042, Australia",
      lat: -33.8915,
      lng: 151.1795,
      suburb: "Newtown",
      postcode: "2042",
      placeId: "demo-newtown",
    };
  }
  return {
    formattedAddress: "123 George Street, Sydney NSW 2000, Australia",
    lat: -33.8688,
    lng: 151.2093,
    suburb: "Sydney",
    postcode: "2000",
    placeId: "demo-sydney-cbd",
  };
}
