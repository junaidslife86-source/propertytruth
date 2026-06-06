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

function ringToWkt(coords: number[][]): string {
  return coords.map(([lng, lat]) => `${lng} ${lat}`).join(", ");
}

function polygonToWkt(coords: number[][][]): string | null {
  const rings = coords
    .map((ring) => `(${ringToWkt(ring)})`)
    .filter(Boolean);
  if (!rings.length) return null;
  return `POLYGON(${rings.join(", ")})`;
}

/** Convert GeoJSON geometry to EWKT for PostGIS GEOGRAPHY columns */
export function geoJsonToEwkt(
  geometry: GeoJSON.Geometry | null | undefined,
): string | null {
  if (!geometry) return null;

  switch (geometry.type) {
    case "Point": {
      const [lng, lat] = geometry.coordinates;
      return isValidLngLat(lng, lat) ? toWktPoint(lng, lat) : null;
    }
    case "Polygon": {
      const wkt = polygonToWkt(geometry.coordinates);
      return wkt ? `SRID=4326;${wkt}` : null;
    }
    case "MultiPolygon": {
      const polys = geometry.coordinates
        .map((poly) => {
          const wkt = polygonToWkt(poly);
          return wkt ? wkt.replace("POLYGON", "") : null;
        })
        .filter(Boolean);
      if (!polys.length) return null;
      return `SRID=4326;MULTIPOLYGON(${polys.join(", ")})`;
    }
    default:
      return null;
  }
}
