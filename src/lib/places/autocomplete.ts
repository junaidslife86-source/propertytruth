import type { PlaceSuggestion } from "@/lib/places/types";
import { demoSuggestions } from "@/lib/places/demo-suggestions";
import { addressfinderAutocomplete } from "@/lib/places/addressfinder";
import {
  googleAutocomplete,
  legacyGoogleAutocomplete,
} from "@/lib/places/google-autocomplete";
import { nominatimAutocomplete } from "@/lib/places/nominatim-autocomplete";
import { getAddressFinderCredentials } from "@/lib/firebase/config";

export async function fetchPlaceSuggestions(
  input: string,
): Promise<{ suggestions: PlaceSuggestion[]; source: string }> {
  if (getAddressFinderCredentials()) {
    const af = await addressfinderAutocomplete(input);
    if (af.length) {
      return { suggestions: af, source: "addressfinder" };
    }
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();

  if (apiKey) {
    const modern = await googleAutocomplete(input, apiKey);
    if (modern?.length) {
      return { suggestions: modern, source: "google-places-new" };
    }

    const legacy = await legacyGoogleAutocomplete(input, apiKey);
    if (legacy?.length) {
      return { suggestions: legacy, source: "google-places-legacy" };
    }
  }

  const osm = await nominatimAutocomplete(input);
  if (osm.length) {
    return { suggestions: osm, source: "nominatim" };
  }

  return { suggestions: demoSuggestions(input), source: "demo" };
}
