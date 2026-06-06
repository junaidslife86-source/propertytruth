"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { strataRequestHeaders } from "@/lib/auth/api-headers";
import { NO_TRAINING_STATEMENT } from "@/lib/compliance/copy";
import { toast } from "sonner";

interface StrataDocumentSettingsProps {
  documentId: string;
}

export function StrataDocumentSettings({ documentId }: StrataDocumentSettingsProps) {
  const router = useRouter();
  const [retention, setRetention] = useState<"7d" | "30d" | "keep">("30d");
  const [busy, setBusy] = useState(false);

  async function saveRetention() {
    setBusy(true);
    try {
      const res = await fetch(`/api/strata/${documentId}`, {
        method: "PATCH",
        headers: {
          ...(await strataRequestHeaders()),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ retentionPolicy: retention }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update retention");
      }
      toast.success("Retention preference saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteDocument() {
    if (
      !confirm(
        "Delete this document and all extracted analysis? This cannot be undone.",
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/strata/${documentId}`, {
        method: "DELETE",
        headers: await strataRequestHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Delete failed");
      }
      toast.success("Document deleted");
      router.push("/strata/upload");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-outline-variant/30 bg-white p-5">
      <h3 className="font-[family-name:var(--font-manrope)] text-lg font-semibold">
        Data &amp; retention
      </h3>
      <p className="mt-2 text-sm text-on-surface-variant">{NO_TRAINING_STATEMENT}</p>

      <div className="mt-4 space-y-2">
        <label className="font-label-caps text-on-surface-variant">
          Auto-delete after
        </label>
        <select
          value={retention}
          onChange={(e) =>
            setRetention(e.target.value as "7d" | "30d" | "keep")
          }
          className="w-full rounded-lg border border-outline-variant/40 bg-white px-3 py-2 text-sm"
        >
          <option value="7d">7 days</option>
          <option value="30d">30 days (default)</option>
          <option value="keep">Keep in my session</option>
        </select>
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => void saveRetention()}
        >
          Save retention preference
        </Button>
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={busy}
        className="mt-6 text-evidence-issue"
        onClick={() => void deleteDocument()}
      >
        <Trash2 className="h-4 w-4" />
        Delete document and extracted analysis
      </Button>
    </section>
  );
}
