type AnalyticsEvent =
  | "address_searched"
  | "property_scan_completed"
  | "property_saved"
  | "property_added_to_compare"
  | "inspection_started";

export function track(event: AnalyticsEvent, properties?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  // PostHog stub — wire when NEXT_PUBLIC_POSTHOG_KEY is set
  console.debug("[analytics]", event, properties);
}
