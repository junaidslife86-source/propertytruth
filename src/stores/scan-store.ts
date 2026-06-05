import { create } from "zustand";
import type { PropertyScanResult } from "@/lib/schemas";

interface ScanState {
  lastScan: PropertyScanResult | null;
  isScanning: boolean;
  setLastScan: (scan: PropertyScanResult | null) => void;
  setIsScanning: (v: boolean) => void;
}

export const useScanStore = create<ScanState>((set) => ({
  lastScan: null,
  isScanning: false,
  setLastScan: (lastScan) => set({ lastScan }),
  setIsScanning: (isScanning) => set({ isScanning }),
}));
