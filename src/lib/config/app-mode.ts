/**
 * Testing-phase configuration.
 * Production promotion should set APP_ENV=production and seed real NSW datasets.
 */
export function isTestingMode(): boolean {
  const env =
    process.env.APP_ENV ??
    process.env.NEXT_PUBLIC_APP_ENV ??
    "testing";
  return env !== "production";
}

/** Client-safe testing flag */
export function isTestingModeClient(): boolean {
  if (typeof window !== "undefined") {
    return (process.env.NEXT_PUBLIC_APP_ENV ?? "testing") !== "production";
  }
  return isTestingMode();
}

export function isDemoDataAllowedClient(): boolean {
  if (process.env.NEXT_PUBLIC_ALLOW_DEMO_DATA === "false") return false;
  if (process.env.NEXT_PUBLIC_ALLOW_DEMO_DATA === "true") return true;
  return isTestingModeClient();
}

/** Explicit demo/sample data is allowed (always labelled in UI). */
export function isDemoDataAllowed(): boolean {
  if (process.env.ALLOW_DEMO_DATA === "false") return false;
  return isTestingMode() || process.env.ALLOW_DEMO_DATA === "true";
}

export function getAppPhaseLabel(): string {
  return isTestingMode() ? "Testing — sample & seeded data" : "Live data";
}
