import { getCurrentIdToken } from "@/lib/firebase/client";
import {
  getInspectionSessionId,
  getStrataSessionId,
} from "@/lib/auth/client-session";

export async function authHeaders(
  extra: Record<string, string> = {},
): Promise<HeadersInit> {
  const headers: Record<string, string> = { ...extra };
  const token = await getCurrentIdToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function strataRequestHeaders(
  extra: Record<string, string> = {},
): Promise<HeadersInit> {
  return {
    ...(await authHeaders()),
    "x-strata-session": getStrataSessionId(),
    ...extra,
  };
}

export async function inspectionRequestHeaders(
  extra: Record<string, string> = {},
): Promise<HeadersInit> {
  return {
    ...(await authHeaders()),
    "x-inspection-session": getInspectionSessionId(),
    ...extra,
  };
}
