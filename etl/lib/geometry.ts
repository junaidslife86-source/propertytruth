export type LngLat = [number, number];

export function isValidLngLat(lng: number, lat: number): boolean {
  return (
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}

/** Extract point from GeoJSON Feature geometry */
export function pointFromFeature(
  geometry: GeoJSON.Geometry | null | undefined,
): LngLat | null {
  if (!geometry) return null;
  if (geometry.type === "Point") {
    const [lng, lat] = geometry.coordinates;
    return isValidLngLat(lng, lat) ? [lng, lat] : null;
  }
  if (geometry.type === "Polygon" && geometry.coordinates[0]?.[0]) {
    const [lng, lat] = geometry.coordinates[0][0];
    return isValidLngLat(lng, lat) ? [lng, lat] : null;
  }
  return null;
}

export function toWktPoint(lng: number, lat: number): string {
  return `SRID=4326;POINT(${lng} ${lat})`;
}
