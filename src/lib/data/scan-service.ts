import { buildDemoScanResult } from "@/lib/data/demo-data";
import { scanPropertyWithFirebase } from "@/lib/firebase/scan";
import { hasFirebaseAdminConfig } from "@/lib/firebase/config";
import { isDemoDataAllowed } from "@/lib/config/app-mode";
import type { PropertyScanResult } from "@/lib/schemas";

export class ScanUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScanUnavailableError";
  }
}

export async function scanPropertyArea(input: {
  formattedAddress: string;
  lat: number;
  lng: number;
  suburb?: string | null;
  postcode?: string | null;
  radiusMeters: number;
  userId?: string | null;
}): Promise<PropertyScanResult> {
  if (hasFirebaseAdminConfig()) {
    try {
      const result = await scanPropertyWithFirebase(input);
      if (result) return result;
    } catch (err) {
      console.error("[scan] Firebase scan failed", err);
      if (!isDemoDataAllowed()) {
        throw new ScanUnavailableError(
          "Planning data is temporarily unavailable. Please try again later.",
        );
      }
    }
  }

  if (!isDemoDataAllowed()) {
    throw new ScanUnavailableError(
      "Planning data is not configured for this environment.",
    );
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
