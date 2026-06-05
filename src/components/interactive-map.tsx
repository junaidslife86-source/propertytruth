"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { PropertyScanResult } from "@/lib/schemas";
import { cn } from "@/lib/utils";
interface InteractiveMapProps {
  scan: PropertyScanResult;
  className?: string;
  compact?: boolean;
}

export function InteractiveMap({ scan, className, compact }: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const style =
      process.env.NEXT_PUBLIC_MAPLIBRE_STYLE_URL ??
      "https://demotiles.maplibre.org/style.json";

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: [scan.lng, scan.lat],
      zoom: compact ? 15 : 14,
      attributionControl: compact ? false : undefined,
    });

    mapRef.current = map;

    map.on("load", () => {
      // Property marker
      new maplibregl.Marker({ color: "#1c1917" })
        .setLngLat([scan.lng, scan.lat])
        .addTo(map);

      // Radius circle (approximate via GeoJSON circle)
      const points = 64;
      const coords: [number, number][] = [];
      const r = scan.radiusMeters / 111320;
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * 2 * Math.PI;
        coords.push([
          scan.lng + r * Math.cos(angle) / Math.cos((scan.lat * Math.PI) / 180),
          scan.lat + r * Math.sin(angle),
        ]);
      }
      coords.push(coords[0]);

      map.addSource("scan-radius", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: [coords] },
        },
      });
      map.addLayer({
        id: "scan-radius-fill",
        type: "fill",
        source: "scan-radius",
        paint: {
          "fill-color": "#78716c",
          "fill-opacity": 0.08,
        },
      });
      map.addLayer({
        id: "scan-radius-line",
        type: "line",
        source: "scan-radius",
        paint: {
          "line-color": "#a8a29e",
          "line-width": 1.5,
          "line-dasharray": [2, 2],
        },
      });

      const daFeatures = scan.developments
        .filter((d) => d.lat != null && d.lng != null)
        .map((d) => ({
          type: "Feature" as const,
          properties: {
            title: d.development_type ?? "DA",
            ref: d.application_number,
          },
          geometry: {
            type: "Point" as const,
            coordinates: [d.lng!, d.lat!],
          },
        }));

      if (daFeatures.length) {
        map.addSource("developments", {
          type: "geojson",
          data: { type: "FeatureCollection", features: daFeatures },
        });
        map.addLayer({
          id: "developments-layer",
          type: "circle",
          source: "developments",
          paint: {
            "circle-radius": 8,
            "circle-color": "#ea580c",
            "circle-opacity": 0.85,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
          },
        });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [scan, compact]);

  return (
    <div
      ref={containerRef}
      className={cn("w-full bg-stone-100", className ?? "h-[420px]")}
      role="img"
      aria-label="Map showing property and nearby developments"
    />
  );
}
