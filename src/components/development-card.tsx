"use client";

import type { Development } from "@/lib/schemas";
import { formatDate, formatDistance } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DevelopmentCardProps {
  development: Development;
}

export function DevelopmentCard({ development }: DevelopmentCardProps) {
  const scale =
    development.storeys && development.storeys >= 10
      ? "Large scale"
      : development.storeys && development.storeys >= 5
        ? "Medium scale"
        : "Smaller scale";

  const headline = development.storeys
    ? `${development.storeys}-storey ${development.development_type ?? "development"} proposed ${formatDistance(development.distance_meters)} away`
    : `${development.development_type ?? "Development"} proposed ${formatDistance(development.distance_meters)} away`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">{development.status ?? "Unknown status"}</Badge>
          <Badge variant="medium">{scale}</Badge>
        </div>
        <CardTitle className="text-base leading-snug">{headline}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-stone-600">
        {development.address && <p>{development.address}</p>}
        {development.description && (
          <p className="leading-relaxed">{development.description}</p>
        )}
        <p className="text-xs text-stone-400">
          {development.council} · {development.application_number} · Lodged{" "}
          {formatDate(development.lodged_date)}
        </p>
      </CardContent>
    </Card>
  );
}
