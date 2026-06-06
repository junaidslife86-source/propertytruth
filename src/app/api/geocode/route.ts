import { NextRequest, NextResponse } from "next/server";
import { geocodeRequestSchema } from "@/lib/schemas";
import { rateLimit } from "@/lib/rate-limit";
import { demoGeocode } from "@/lib/places/demo-suggestions";
import {
  addressfinderGeocode,
  ADDRESSFINDER_PLACE_PREFIX,
} from "@/lib/places/addressfinder";
import {
  geocodeFromCoordinates,
  geocodeWithGoogle,
  geocodeWithNominatim,
} from "@/lib/places/geocode";

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

  const { placeId, address, lat, lng } = parsed.data;

  if (placeId?.startsWith(ADDRESSFINDER_PLACE_PREFIX)) {
    const af = await addressfinderGeocode(placeId);
    if (af) return NextResponse.json(af);
  }

  if (placeId?.startsWith("demo-")) {
    const demo = demoGeocode(placeId, address);
    if (demo) return NextResponse.json(demo);
  }

  if (
    lat != null &&
    lng != null &&
    (placeId?.startsWith("osm-") || address)
  ) {
    const fromCoords = geocodeFromCoordinates(
      lat,
      lng,
      address ?? `${lat}, ${lng}`,
      placeId,
    );
    if (fromCoords) return NextResponse.json(fromCoords);
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();

  if (apiKey && placeId && !placeId.startsWith("osm-")) {
    const google = await geocodeWithGoogle(apiKey, { placeId, address });
    if (google) return NextResponse.json(google);
  }

  if (apiKey && address) {
    const google = await geocodeWithGoogle(apiKey, { address });
    if (google) return NextResponse.json(google);
  }

  if (address) {
    const osm = await geocodeWithNominatim(address);
    if (osm) return NextResponse.json(osm);
  }

  const demo = demoGeocode(placeId, address);
  if (demo) return NextResponse.json(demo);

  return NextResponse.json(
    { error: "We couldn't find that address. Try a Sydney property." },
    { status: 404 },
  );
}
