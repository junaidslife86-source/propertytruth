"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { PropertyScanResult } from "@/lib/schemas";

interface SavePropertyButtonProps {
  scan: PropertyScanResult;
}

export function SavePropertyButton({ scan }: SavePropertyButtonProps) {
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          toast.message("Sign in to save properties", {
            description: "Email or Google login via Supabase Auth.",
          });
          return;
        }
        throw new Error(data.error);
      }
      setSaved(true);
      toast.success("Property saved to your reports");
    } catch {
      toast.error("Could not save this property right now");
    }
  }

  return (
    <Button variant="outline" onClick={handleSave} disabled={saved}>
      <Bookmark className={saved ? "fill-stone-800" : ""} />
      {saved ? "Saved" : "Save report"}
    </Button>
  );
}
