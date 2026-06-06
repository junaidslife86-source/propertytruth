import { buildDemoScanResult } from "@/lib/data/demo-data";
import { scanPropertyWithFirebase } from "@/lib/firebase/scan";
import { hasFirebaseAdminConfig } from "@/lib/firebase/config";
import type { PropertyScanResult } from "@/lib/schemas";

export async function scanPropertyArea(input: {
  formattedAddress: string;
  lat: number;
  lng: number;
  suburb?: string | null;
  postcode?: string | null;
  radiusMeters: number;
}): Promise<PropertyScanResult> {
  if (hasFirebaseAdminConfig()) {
    try {
      const result = await scanPropertyWithFirebase(input);
      if (result) return result;
    } catch (err) {
      console.error("[scan] Firebase scan failed, using demo", err);
    }
  }

  return buildDemoScanResult(
    input.formattedAddress,
    input.lat,
    input.lng,
    input.suburb,
    input.postcode,
    input.radiusMeters,
  );
}
