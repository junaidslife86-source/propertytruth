import { basename } from "path";

export type RetentionPolicy = "7d" | "30d" | "keep";

export function sanitizeUploadFilename(filename: string): string {
  const base = basename(filename.replace(/\\/g, "/"));
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return cleaned.toLowerCase().endsWith(".pdf") ? cleaned : `${cleaned}.pdf`;
}

export function retentionExpiresAt(policy: RetentionPolicy): string | null {
  if (policy === "keep") return null;
  const days = policy === "7d" ? 7 : 30;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
