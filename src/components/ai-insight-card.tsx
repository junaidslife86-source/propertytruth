"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { PropertyScanResult } from "@/lib/schemas";
import { AI_DISCLAIMER } from "@/lib/constants";
import { SourceBadge } from "@/components/compliance/source-badge";
import { dataSourceToLabel } from "@/lib/sources/types";

interface AIInsightCardProps {
  scan: PropertyScanResult;
}

export function AIInsightCard({ scan }: AIInsightCardProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["insights", scan.propertyId],
    queryFn: async () => {
      const res = await fetch(`/api/property/${scan.propertyId}/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scan }),
      });
      if (!res.ok) throw new Error("Failed to load insights");
      return res.json();
    },
    staleTime: 300_000,
  });

  return (
    <section aria-labelledby="ai-insight-heading">
      <h2 id="ai-insight-heading" className="mb-4 text-xl font-semibold tracking-tight text-stone-900">
        What this could mean
      </h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-stone-500" />
            Plain-language summary
            <SourceBadge source="ai_assisted" />
            <SourceBadge
              source={dataSourceToLabel(scan.dataSource, scan.dataSource === "database")}
            />
          </CardTitle>
          <CardDescription>
            Generated from nearby planning records — not legal or financial advice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}
          {isError && (
            <p className="text-sm text-stone-600">
              We couldn&apos;t generate a summary right now. Review the development feed and map for details.
            </p>
          )}
          {data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <p className="text-sm leading-relaxed text-stone-700">{data.summary}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Confidence: {data.confidence}</Badge>
              </div>
              {data.sources?.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium text-stone-500">Sources cited</p>
                  <ul className="list-inside list-disc text-xs text-stone-500">
                    {data.sources.slice(0, 5).map((s: string) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs leading-relaxed text-stone-400">
                {data.disclaimer ?? AI_DISCLAIMER}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
