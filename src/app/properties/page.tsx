"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { authHeaders } from "@/lib/auth/api-headers";
import { parseJsonResponse } from "@/lib/api/parse-response";
import type { PropertyCaseRow } from "@/lib/firebase/property-cases";
import { SourceBadge } from "@/components/compliance/source-badge";
import { isTestingModeClient } from "@/lib/config/app-mode";

export default function PropertiesHubPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [cases, setCases] = useState<PropertyCaseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?next=/properties");
      return;
    }

    async function load() {
      try {
        const res = await fetch("/api/property-cases", {
          headers: await authHeaders(),
        });
        const data = await parseJsonResponse<{ cases: PropertyCaseRow[] }>(res);
        if (res.ok) setCases(data.cases);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-on-surface-variant" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Your properties</h1>
        {isTestingModeClient() && <SourceBadge source="seeded_sample" />}
      </div>
      <p className="mt-2 text-sm text-on-surface-variant">
        Saved scans and due diligence workspaces across NSW.
      </p>

      {cases.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-outline-variant/50 p-10 text-center">
          <Home className="mx-auto h-8 w-8 text-on-surface-variant" />
          <p className="mt-4 text-sm text-on-surface-variant">
            No saved properties yet. Search an NSW address from the home page.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Start a scan
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {cases.map((c) => (
            <li key={c.id}>
              <Link
                href={`/properties/${c.id}`}
                className="block rounded-xl border border-outline-variant/30 bg-white p-4 hover:border-primary/30"
              >
                <p className="font-medium">{c.formattedAddress ?? c.address}</p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {c.status} · {c.confidenceLabel ?? "incomplete"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
