import type { GeocodeResult } from "@/lib/places/types";
import { SYDNEY_BOUNDS } from "@/lib/constants";

function isInSydney(lat: number, lng: number) {
  return (
    lat >= SYDNEY_BOUNDS.minLat &&
    lat <= SYDNEY_BOUNDS.maxLat &&
    lng >= SYDNEY_BOUNDS.minLng &&
    lng <= SYDNEY_BOUNDS.maxLng
  );
}

function findComponent(
  components: Array<{ types: string[]; long_name: string }>,
  type: string,
) {
  return components.find((c) => c.types.includes(type))?.long_name;
}

export async function geocodeWithGoogle(
  apiKey: string,
  opts: { placeId?: string; address?: string },
): Promise<GeocodeResult | null> {
  if (opts.placeId && !opts.placeId.startsWith("demo-") && !opts.placeId.startsWith("osm-")) {
    const placeRes = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(opts.placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "id,formattedAddress,location,addressComponents",
        },
      },
    );

    if (placeRes.ok) {
      const place = (await placeRes.json()) as {
        formattedAddress?: string;
        location?: { latitude: number; longitude: number };
        addressComponents?: Array<{
          types: string[];
          longText: string;
          shortText: string;
        }>;
      };

      const lat = place.location?.latitude;
      const lng = place.location?.longitude;
      if (lat != null && lng != null && isInSydney(lat, lng)) {
        const components =
          place.addressComponents?.map((c) => ({
            types: c.types,
            long_name: c.longText,
            short_name: c.shortText,
          })) ?? [];

        return {
          formattedAddress: place.formattedAddress ?? opts.address ?? "",
          lat,
          lng,
          suburb:
            findComponent(components, "locality") ??
            findComponent(components, "sublocality"),
          postcode: findComponent(components, "postal_code"),
          placeId: opts.placeId,
        };
      }
    }
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  if (opts.placeId) {
    url.searchParams.set("place_id", opts.placeId);
  } else if (opts.address) {
    url.searchParams.set("address", `${opts.address}, Sydney NSW, Australia`);
  } else {
    return null;
  }
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = await res.json();
  const result = data.results?.[0];
  if (!result) return null;

  const { lat, lng } = result.geometry.location;
  if (!isInSydney(Number(lat), Number(lng))) return null;

  const components = result.address_components as Array<{
    types: string[];
    long_name: string;
  }>;

  return {
    formattedAddress: result.formatted_address,
    lat: Number(lat),
    lng: Number(lng),
    suburb:
      findComponent(components, "locality") ??
      findComponent(components, "sublocality"),
    postcode: findComponent(components, "postal_code"),
    placeId: result.place_id,
  };
}

export async function geocodeWithNominatim(
  address: string,
): Promise<GeocodeResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", `${address}, Sydney, NSW, Australia`);
  url.searchParams.set("format", "json");
  url.searchParams.set("countrycodes", "au");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "PropertyTruth/1.0 (https://github.com/junaidslife86-source/propertytruth)",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = (await res.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
    place_id: number;
    address?: { suburb?: string; city?: string; postcode?: string };
  }>;

  const hit = data[0];
  if (!hit) return null;

  const lat = Number(hit.lat);
  const lng = Number(hit.lon);
  if (!isInSydney(lat, lng)) return null;

  return {
    formattedAddress: hit.display_name,
    lat,
    lng,
    suburb: hit.address?.suburb ?? hit.address?.city,
    postcode: hit.address?.postcode,
    placeId: `osm-${hit.place_id}`,
  };
}

export function geocodeFromCoordinates(
  lat: number,
  lng: number,
  formattedAddress: string,
  placeId?: string,
): GeocodeResult | null {
  if (!isInSydney(lat, lng)) return null;
  return { formattedAddress, lat, lng, placeId };
}

export { isInSydney };
