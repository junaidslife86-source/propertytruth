"use client";

const STRATA_SESSION_KEY = "strata-session";
const INSPECTION_SESSION_KEY = "inspection-session";

function getOrCreate(key: string): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function getStrataSessionId(): string {
  return getOrCreate(STRATA_SESSION_KEY);
}

export function getInspectionSessionId(): string {
  return getOrCreate(INSPECTION_SESSION_KEY);
}

export function strataSessionHeaders(
  extra: Record<string, string> = {},
): HeadersInit {
  return {
    ...extra,
    "x-strata-session": getStrataSessionId(),
  };
}

export function inspectionSessionHeaders(
  extra: Record<string, string> = {},
): HeadersInit {
  return {
    ...extra,
    "x-inspection-session": getInspectionSessionId(),
  };
}
