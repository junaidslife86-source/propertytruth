import type { GeocodeResult, PlaceSuggestion } from "@/lib/places/types";

export const DEMO_PLACES: PlaceSuggestion[] = [
  {
    placeId: "demo-sydney-cbd",
    description: "123 George Street, Sydney NSW 2000, Australia",
    mainText: "123 George Street",
    secondaryText: "Sydney NSW 2000, Australia",
    lat: -33.8688,
    lng: 151.2093,
  },
  {
    placeId: "demo-newtown",
    description: "88 King Street, Newtown NSW 2042, Australia",
    mainText: "88 King Street",
    secondaryText: "Newtown NSW 2042, Australia",
    lat: -33.8915,
    lng: 151.1795,
  },
  {
    placeId: "demo-parramatta",
    description: "42 George Street, Parramatta NSW 2150, Australia",
    mainText: "42 George Street",
    secondaryText: "Parramatta NSW 2150, Australia",
    lat: -33.815,
    lng: 151.001,
  },
  {
    placeId: "demo-bondi",
    description: "128 Campbell Parade, Bondi Beach NSW 2026, Australia",
    mainText: "128 Campbell Parade",
    secondaryText: "Bondi Beach NSW 2026, Australia",
    lat: -33.8915,
    lng: 151.2767,
  },
  {
    placeId: "demo-chatswood",
    description: "435 Victoria Avenue, Chatswood NSW 2067, Australia",
    mainText: "435 Victoria Avenue",
    secondaryText: "Chatswood NSW 2067, Australia",
    lat: -33.7969,
    lng: 151.183,
  },
  {
    placeId: "demo-surray-hills",
    description: "50 Crown Street, Surry Hills NSW 2010, Australia",
    mainText: "50 Crown Street",
    secondaryText: "Surry Hills NSW 2010, Australia",
    lat: -33.8847,
    lng: 151.2123,
  },
];

function scoreMatch(input: string, place: PlaceSuggestion): number {
  const q = input.toLowerCase().trim();
  const hay = `${place.description} ${place.mainText} ${place.secondaryText}`.toLowerCase();
  if (hay.includes(q)) return 100;
  const tokens = q.split(/\s+/).filter((t) => t.length > 1);
  if (!tokens.length) return 0;
  const matched = tokens.filter((t) => hay.includes(t)).length;
  return (matched / tokens.length) * 80;
}

export function demoSuggestions(input: string): PlaceSuggestion[] {
  const scored = DEMO_PLACES.map((place) => ({
    place,
    score: scoreMatch(input, place),
  }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length) {
    return scored.map((s) => s.place);
  }

  if (input.trim().length >= 2) {
    return DEMO_PLACES.slice(0, 4);
  }

  return [];
}

export function demoGeocode(
  placeId?: string,
  address?: string,
): GeocodeResult | null {
  const byId = DEMO_PLACES.find((p) => p.placeId === placeId);
  if (byId?.lat != null && byId.lng != null) {
    return {
      formattedAddress: byId.description,
      lat: byId.lat,
      lng: byId.lng,
      suburb: byId.secondaryText.split(",")[0]?.trim(),
      postcode: byId.secondaryText.match(/\d{4}/)?.[0],
      placeId: byId.placeId,
    };
  }

  const q = (address ?? "").toLowerCase();
  const match = DEMO_PLACES.find(
    (p) =>
      p.description.toLowerCase().includes(q) ||
      p.mainText.toLowerCase().includes(q),
  );
  if (match?.lat != null && match.lng != null) {
    return {
      formattedAddress: match.description,
      lat: match.lat,
      lng: match.lng,
      suburb: match.secondaryText.split(",")[0]?.trim(),
      postcode: match.secondaryText.match(/\d{4}/)?.[0],
      placeId: match.placeId,
    };
  }

  return null;
}
