import type { PlaceSuggestion } from "@/lib/places/types";

const SYDNEY_BIAS = {
  latitude: -33.8688,
  longitude: 151.2093,
};

export async function googleAutocomplete(
  input: string,
  apiKey: string,
): Promise<PlaceSuggestion[] | null> {
  const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
    },
    body: JSON.stringify({
      input,
      includedRegionCodes: ["au"],
      includedPrimaryTypes: ["street_address", "premise", "subpremise", "route"],
      locationBias: {
        circle: {
          center: SYDNEY_BIAS,
          radius: 50_000,
        },
      },
    }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    suggestions?: Array<{
      placePrediction?: {
        placeId?: string;
        text?: { text?: string };
        structuredFormat?: {
          mainText?: { text?: string };
          secondaryText?: { text?: string };
        };
      };
    }>;
    error?: { message?: string };
  };

  if (data.error) return null;

  const suggestions = (data.suggestions ?? [])
    .map((s) => s.placePrediction)
    .filter(Boolean)
    .map((p) => ({
      placeId: p!.placeId ?? "",
      description: p!.text?.text ?? "",
      mainText: p!.structuredFormat?.mainText?.text ?? p!.text?.text ?? "",
      secondaryText: p!.structuredFormat?.secondaryText?.text ?? "",
    }))
    .filter((s) => s.placeId && s.description);

  return suggestions.length ? suggestions : null;
}

export async function legacyGoogleAutocomplete(
  input: string,
  apiKey: string,
): Promise<PlaceSuggestion[] | null> {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/autocomplete/json",
  );
  url.searchParams.set("input", input);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("components", "country:au");
  url.searchParams.set("types", "address");

  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = await res.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    return null;
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

  return suggestions.length ? suggestions : [];
}
