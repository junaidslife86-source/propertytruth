import type { GeocodeResult, PlaceSuggestion } from "@/lib/places/types";
import { getAddressFinderCredentials } from "@/lib/firebase/config";

const AUTocomplete_URL =
  "https://api.addressfinder.io/api/au/address/autocomplete";
const METADATA_URL = "https://api.addressfinder.io/api/au/address/metadata";

export const ADDRESSFINDER_PLACE_PREFIX = "af-";

interface AutocompleteCompletion {
  id?: string;
  a?: string;
  full_address?: string;
  address?: string;
}

interface AutocompleteResponse {
  success?: boolean;
  completions?: AutocompleteCompletion[];
  message?: string;
}

interface MetadataResponse {
  success?: boolean;
  full_address?: string;
  latitude?: string;
  longitude?: string;
  locality_name?: string;
  postcode?: string;
  id?: string;
  message?: string;
}

function authHeaders(secret: string) {
  return { Authorization: secret };
}

export async function addressfinderAutocomplete(
  input: string,
): Promise<PlaceSuggestion[]> {
  const creds = getAddressFinderCredentials();
  if (!creds) return [];

  const url = new URL(AUTocomplete_URL);
  url.searchParams.set("key", creds.key);
  url.searchParams.set("q", input);
  url.searchParams.set("format", "json");
  url.searchParams.set("max", "8");
  url.searchParams.set("source", "GNAF,PAF");

  const res = await fetch(url.toString(), {
    headers: authHeaders(creds.secret),
    cache: "no-store",
  });

  if (!res.ok) return [];

  const data = (await res.json()) as AutocompleteResponse;
  if (!data.success || !data.completions?.length) return [];

  return data.completions
    .filter((c) => c.id && (c.a || c.full_address || c.address))
    .map((c) => {
      const full = c.a ?? c.full_address ?? c.address ?? "";
      const parts = full.split(",").map((p) => p.trim());
      const mainText = parts[0] ?? full;
      const secondaryText = parts.slice(1).join(", ");
      return {
        placeId: `${ADDRESSFINDER_PLACE_PREFIX}${c.id}`,
        description: full,
        mainText,
        secondaryText,
      };
    });
}

export async function addressfinderGeocode(
  placeId: string,
): Promise<GeocodeResult | null> {
  const creds = getAddressFinderCredentials();
  if (!creds) return null;

  const id = placeId.startsWith(ADDRESSFINDER_PLACE_PREFIX)
    ? placeId.slice(ADDRESSFINDER_PLACE_PREFIX.length)
    : placeId;

  const url = new URL(METADATA_URL);
  url.searchParams.set("key", creds.key);
  url.searchParams.set("id", id);
  url.searchParams.set("format", "json");
  url.searchParams.set("gps", "1");
  url.searchParams.set("source", "GNAF,PAF");

  const res = await fetch(url.toString(), {
    headers: authHeaders(creds.secret),
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = (await res.json()) as MetadataResponse;
  if (!data.success || !data.full_address) return null;

  const lat = data.latitude ? parseFloat(data.latitude) : NaN;
  const lng = data.longitude ? parseFloat(data.longitude) : NaN;
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  return {
    formattedAddress: data.full_address,
    lat,
    lng,
    suburb: data.locality_name ?? undefined,
    postcode: data.postcode ?? undefined,
    placeId: `${ADDRESSFINDER_PLACE_PREFIX}${data.id ?? id}`,
  };
}
