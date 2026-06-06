"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { PropertyScanResult } from "@/lib/schemas";
import { useShortlistStore } from "@/stores/shortlist-store";

interface ShortlistButtonProps {
  scan: PropertyScanResult;
}

export function ShortlistButton({ scan }: ShortlistButtonProps) {
  const has = useShortlistStore((s) => s.has(scan.propertyId));
  const add = useShortlistStore((s) => s.add);
  const remove = useShortlistStore((s) => s.remove);

  function toggle() {
    if (has) {
      remove(scan.propertyId);
      toast.message("Removed from shortlist");
    } else {
      add(scan);
      toast.success("Saved to shortlist");
    }
  }

  return (
    <Button variant="outline" onClick={toggle}>
      {has ? (
        <>
          <BookmarkCheck className="h-4 w-4 fill-stone-800" />
          Shortlisted
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          Save to shortlist
        </>
      )}
    </Button>
  );
}
