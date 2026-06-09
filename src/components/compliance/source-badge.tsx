import { Badge } from "@/components/ui/badge";
import {
  SOURCE_LABEL_DISPLAY,
  type SourceLabel,
} from "@/lib/sources/types";
import { cn } from "@/lib/utils";

const VARIANT: Record<SourceLabel, "default" | "medium" | "low" | "high"> = {
  public_record: "low",
  seeded_sample: "medium",
  demo_sample: "high",
  uploaded_document: "low",
  buyer_note: "default",
  ai_assisted: "medium",
  unknown: "default",
  needs_verification: "high",
};

export function SourceBadge({
  source,
  className,
}: {
  source: SourceLabel;
  className?: string;
}) {
  return (
    <Badge variant={VARIANT[source]} className={cn("font-label-caps", className)}>
      {SOURCE_LABEL_DISPLAY[source]}
    </Badge>
  );
}
