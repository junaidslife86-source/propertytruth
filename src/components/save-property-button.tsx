"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { PropertyScanResult } from "@/lib/schemas";
import { authHeaders } from "@/lib/auth/api-headers";
import { useAuth } from "@/providers/auth-provider";

interface SavePropertyButtonProps {
  scan: PropertyScanResult;
}

export function SavePropertyButton({ scan }: SavePropertyButtonProps) {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    setBusy(true);
    try {
      if (!user) {
        router.push("/login?next=" + encodeURIComponent(window.location.pathname));
        return;
      }

      const res = await fetch("/api/saved", {
        method: "POST",
        headers: {
          ...(await authHeaders()),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId: scan.propertyId,
          summary: {
            address: scan.formattedAddress,
            quickSummary: scan.quickSummary,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "AUTH_REQUIRED") {
          toast.message("Sign in to save properties");
          router.push("/login?next=" + encodeURIComponent(window.location.pathname));
          return;
        }
        throw new Error(data.error);
      }
      setSaved(true);
      toast.success("Property saved to your reports");
    } catch {
      toast.error("Could not save this property right now");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="outline" onClick={() => void handleSave()} disabled={saved || busy}>
      <Bookmark className={saved ? "fill-stone-800" : ""} />
      {saved ? "Saved" : "Save report"}
    </Button>
  );
}
