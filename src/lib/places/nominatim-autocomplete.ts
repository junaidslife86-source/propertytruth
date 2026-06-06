import type { PlaceSuggestion } from "@/lib/places/types";

export async function nominatimAutocomplete(
  input: string,
): Promise<PlaceSuggestion[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", `${input}, Sydney, NSW, Australia`);
  url.searchParams.set("format", "json");
  url.searchParams.set("countrycodes", "au");
  url.searchParams.set("limit", "6");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("viewbox", "150.5,-34.2,151.5,-33.4");
  url.searchParams.set("bounded", "1");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "PropertyTruth/1.0 (https://github.com/junaidslife86-source/propertytruth)",
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    const data = (await res.json()) as Array<{
      place_id: number;
      display_name: string;
      name?: string;
      lat: string;
      lon: string;
      address?: {
        suburb?: string;
        city?: string;
        postcode?: string;
      };
    }>;

    return data.map((item) => {
      const parts = item.display_name.split(",");
      const mainText =
        item.name?.trim() ||
        parts[0]?.trim() ||
        item.display_name.split(",")[0]?.trim() ||
        item.display_name;
      const secondaryText = parts.slice(1).join(",").trim();

      return {
        placeId: `osm-${item.place_id}`,
        description: item.display_name,
        mainText,
        secondaryText,
        lat: Number(item.lat),
        lng: Number(item.lon),
      };
    });
  } catch {
    return [];
  }
}
