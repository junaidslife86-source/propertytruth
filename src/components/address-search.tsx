"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useScanStore } from "@/stores/scan-store";
import { cn } from "@/lib/utils";

type Suggestion = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

interface AddressSearchProps {
  className?: string;
  size?: "default" | "large";
}

export function AddressSearch({ className, size = "default" }: AddressSearchProps) {
  const router = useRouter();
  const { setIsScanning, setLastScan } = useScanStore();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/places/autocomplete?input=${encodeURIComponent(input)}`,
      );
      const data = await res.json();
      if (data.suggestions) setSuggestions(data.suggestions);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!selected) fetchSuggestions(query);
    }, 280);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions, selected]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleScan() {
    setScanning(true);
    setIsScanning(true);
    try {
      let body: { placeId?: string; address?: string };
      if (selected?.placeId) {
        body = { placeId: selected.placeId };
      } else if (query.trim().length >= 5) {
        body = { address: query.trim() };
      } else {
        return;
      }

      const geoRes = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const geo = await geoRes.json();
      if (!geoRes.ok) throw new Error(geo.error ?? "Geocoding failed");

      const scanRes = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formattedAddress: geo.formattedAddress,
          lat: geo.lat,
          lng: geo.lng,
          suburb: geo.suburb,
          postcode: geo.postcode,
        }),
      });
      const scan = await scanRes.json();
      if (!scanRes.ok) throw new Error(scan.error ?? "Scan failed");

      setLastScan(scan);
      sessionStorage.setItem(`scan:${scan.propertyId}`, JSON.stringify(scan));
      router.push(`/property/${encodeURIComponent(scan.propertyId)}`);
    } catch (err) {
      console.error(err);
      alert("We couldn't scan that address. Please try another Sydney property.");
    } finally {
      setScanning(false);
      setIsScanning(false);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-center",
          size === "large" && "gap-4",
        )}
      >
        <div className="relative flex-1">
          <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            value={query}
            onChange={(e) => {
              setSelected(null);
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Enter a Sydney property address"
            className={cn("pl-11", size === "large" && "h-14 text-base")}
            aria-label="Property address"
            aria-autocomplete="list"
            aria-expanded={open}
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-stone-400" />
          )}
        </div>
        <Button
          size={size === "large" ? "lg" : "default"}
          onClick={handleScan}
          disabled={scanning || (!selected && query.trim().length < 5)}
          className="shrink-0"
        >
          {scanning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning…
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Scan Area
            </>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg"
            role="listbox"
          >
            {suggestions.map((s) => (
              <li key={s.placeId} role="option">
                <button
                  type="button"
                  className="flex w-full flex-col px-4 py-3 text-left hover:bg-stone-50"
                  onClick={() => {
                    setSelected(s);
                    setQuery(s.description);
                    setOpen(false);
                  }}
                >
                  <span className="text-sm font-medium text-stone-900">{s.mainText}</span>
                  <span className="text-xs text-stone-500">{s.secondaryText}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
