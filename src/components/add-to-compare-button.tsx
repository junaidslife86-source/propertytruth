"use client";

import Link from "next/link";
import { GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { PropertyScanResult } from "@/lib/schemas";
import {
  MAX_COMPARE_PROPERTIES,
  useCompareStore,
} from "@/stores/compare-store";

interface AddToCompareButtonProps {
  scan: PropertyScanResult;
}

export function AddToCompareButton({ scan }: AddToCompareButtonProps) {
  const addProperty = useCompareStore((s) => s.addProperty);
  const isInCompare = useCompareStore((s) => s.isInCompare(scan.propertyId));
  const count = useCompareStore((s) => s.properties.length);

  function handleAdd() {
    const result = addProperty(scan);

    if (!result.ok) {
      toast.message("Compare list is full", {
        description: `Remove a property to add another — up to ${MAX_COMPARE_PROPERTIES} at a time.`,
        action: {
          label: "View compare",
          onClick: () => {
            window.location.href = "/compare";
          },
        },
      });
      return;
    }

    if (result.action === "updated") {
      toast.success("Compare list updated");
      return;
    }

    toast.success("Added to compare", {
      description: `${count + 1} of ${MAX_COMPARE_PROPERTIES} properties selected.`,
      action: {
        label: "View compare",
        onClick: () => {
          window.location.href = "/compare";
        },
      },
    });
  }

  if (isInCompare) {
    return (
      <Button variant="secondary" asChild>
        <Link href="/compare">
          <GitCompareArrows className="h-4 w-4" />
          In compare ({count})
        </Link>
      </Button>
    );
  }

  return (
    <Button variant="outline" onClick={handleAdd}>
      <GitCompareArrows className="h-4 w-4" />
      Add to compare
    </Button>
  );
}
