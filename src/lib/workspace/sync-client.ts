import { getCurrentIdToken } from "@/lib/firebase/client";
import type { DueDiligenceItem } from "@/lib/due-diligence/types";

let timer: ReturnType<typeof setTimeout> | null = null;

export function scheduleWorkspaceSync(input: {
  shortlistIds?: string[];
  compareIds?: string[];
  dueDiligence?: Record<string, DueDiligenceItem[]>;
}) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    void pushWorkspace(input);
  }, 600);
}

async function pushWorkspace(input: {
  shortlistIds?: string[];
  compareIds?: string[];
  dueDiligence?: Record<string, DueDiligenceItem[]>;
}) {
  const token = await getCurrentIdToken();
  if (!token) return;

  await fetch("/api/workspace", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function pullWorkspace(): Promise<{
  shortlistIds: string[];
  compareIds: string[];
  dueDiligence: Record<string, DueDiligenceItem[]>;
} | null> {
  const token = await getCurrentIdToken();
  if (!token) return null;

  const res = await fetch("/api/workspace", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}
