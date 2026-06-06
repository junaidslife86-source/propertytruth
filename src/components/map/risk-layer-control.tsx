"use client";

import { cn } from "@/lib/utils";

export type MapLayerId =
  | "developments"
  | "zoning"
  | "flood"
  | "bushfire"
  | "heritage"
  | "noise";

const LAYERS: { id: MapLayerId; label: string; color: string }[] = [
  { id: "developments", label: "DAs", color: "#ea580c" },
  { id: "flood", label: "Flood", color: "#2563eb" },
  { id: "bushfire", label: "Bushfire", color: "#dc2626" },
  { id: "heritage", label: "Heritage", color: "#9333ea" },
  { id: "noise", label: "Noise", color: "#64748b" },
];

interface RiskLayerControlProps {
  active: Set<MapLayerId>;
  onToggle: (layer: MapLayerId) => void;
  className?: string;
}

export function RiskLayerControl({
  active,
  onToggle,
  className,
}: RiskLayerControlProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 rounded-xl border border-stone-200/80 bg-white/95 p-2 shadow-sm backdrop-blur",
        className,
      )}
    >
      {LAYERS.map((layer) => {
        const on = active.has(layer.id);
        return (
          <button
            key={layer.id}
            type="button"
            onClick={() => onToggle(layer.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              on
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200",
            )}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: layer.color }}
            />
            {layer.label}
          </button>
        );
      })}
    </div>
  );
}

export { LAYERS };
