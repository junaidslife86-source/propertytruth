"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { PropertyScanResult } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import {
  RiskLayerControl,
  type MapLayerId,
} from "@/components/map/risk-layer-control";

interface InteractiveMapProps {
  scan: PropertyScanResult;
  className?: string;
  compact?: boolean;
}

function mapStyleUrl(): string {
  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
  if (maptilerKey) {
    return `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`;
  }
  return (
    process.env.NEXT_PUBLIC_MAPLIBRE_STYLE_URL ??
    "https://demotiles.maplibre.org/style.json"
  );
}

function circleCoords(
  lng: number,
  lat: number,
  radiusM: number,
  points = 64,
): [number, number][] {
  const coords: [number, number][] = [];
  const r = radiusM / 111320;
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    coords.push([
      lng + (r * Math.cos(angle)) / Math.cos((lat * Math.PI) / 180),
      lat + r * Math.sin(angle),
    ]);
  }
  coords.push(coords[0]);
  return coords;
}

export function InteractiveMap({ scan, className, compact }: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [activeLayers, setActiveLayers] = useState<Set<MapLayerId>>(
    () => new Set(["developments", "flood", "bushfire"]),
  );

  function toggleLayer(layer: MapLayerId) {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  }

  useEffect(() => {
    if (!containerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyleUrl(),
      center: [scan.lng, scan.lat],
      zoom: compact ? 15 : 14,
      attributionControl: compact ? false : undefined,
    });

    mapRef.current = map;

    map.on("load", () => {
      new maplibregl.Marker({ color: "#1c1917" })
        .setLngLat([scan.lng, scan.lat])
        .addTo(map);

      map.addSource("scan-radius", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [circleCoords(scan.lng, scan.lat, scan.radiusMeters)],
          },
        },
      });
      map.addLayer({
        id: "scan-radius-fill",
        type: "fill",
        source: "scan-radius",
        paint: { "fill-color": "#78716c", "fill-opacity": 0.08 },
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
          properties: { title: d.development_type ?? "DA" },
          geometry: {
            type: "Point" as const,
            coordinates: [d.lng!, d.lat!],
          },
        }));

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

      const overlayColors: Record<string, string> = {
        flood: "#2563eb",
        bushfire: "#dc2626",
        heritage: "#9333ea",
        aircraft_noise: "#64748b",
        contamination: "#854d0e",
      };

      const overlayFeatures = scan.riskOverlays.map((o, i) => ({
        type: "Feature" as const,
        properties: {
          name: o.name,
          category: o.category,
          color: overlayColors[o.category] ?? "#78716c",
        },
        geometry: {
          type: "Polygon" as const,
          coordinates: [
            circleCoords(
              scan.lng + (i - 0.5) * 0.002,
              scan.lat + (i - 0.5) * 0.0015,
              120 + i * 40,
            ),
          ],
        },
      }));

      map.addSource("risk-overlays", {
        type: "geojson",
        data: { type: "FeatureCollection", features: overlayFeatures },
      });

      for (const cat of ["flood", "bushfire", "heritage", "noise"] as const) {
        const layerId = cat === "noise" ? "aircraft_noise" : cat;
        map.addLayer({
          id: `overlay-${cat}`,
          type: "fill",
          source: "risk-overlays",
          filter: ["==", ["get", "category"], layerId],
          paint: {
            "fill-color": ["get", "color"],
            "fill-opacity": 0.25,
          },
        });
        map.addLayer({
          id: `overlay-${cat}-line`,
          type: "line",
          source: "risk-overlays",
          filter: ["==", ["get", "category"], layerId],
          paint: {
            "line-color": ["get", "color"],
            "line-width": 2,
          },
        });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [scan, compact]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const layerMap: Record<MapLayerId, string[]> = {
      developments: ["developments-layer"],
      zoning: [],
      flood: ["overlay-flood", "overlay-flood-line"],
      bushfire: ["overlay-bushfire", "overlay-bushfire-line"],
      heritage: ["overlay-heritage", "overlay-heritage-line"],
      noise: ["overlay-noise", "overlay-noise-line"],
    };

    for (const [layer, ids] of Object.entries(layerMap)) {
      for (const id of ids) {
        if (!map.getLayer(id)) continue;
        map.setLayoutProperty(
          id,
          "visibility",
          activeLayers.has(layer as MapLayerId) ? "visible" : "none",
        );
      }
    }
  }, [activeLayers]);

  return (
    <div className="relative">
      {!compact && (
        <RiskLayerControl
          active={activeLayers}
          onToggle={toggleLayer}
          className="absolute left-3 top-3 z-10"
        />
      )}
      <div
        ref={containerRef}
        className={cn("w-full bg-stone-100", className ?? "h-[420px]")}
        role="img"
        aria-label="Map showing property, risk overlays and nearby developments"
      />
    </div>
  );
}
