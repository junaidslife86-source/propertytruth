"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import type { RiskIndicator } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RiskSummaryCardProps {
  indicators: RiskIndicator[];
}

const severityLabel = {
  low: "Low",
  medium: "Medium",
  high: "Notable",
} as const;

export function RiskSummaryCard({ indicators }: RiskSummaryCardProps) {
  return (
    <section aria-labelledby="risk-summary-heading">
      <h2 id="risk-summary-heading" className="mb-4 text-xl font-semibold tracking-tight text-stone-900">
        Change risk summary
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {indicators.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <Badge variant={item.severity}>{severityLabel[item.severity]}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-stone-600">{item.description}</p>
                {item.source && (
                  <p className="mt-3 flex items-center gap-1 text-xs text-stone-400">
                    <AlertCircle className="h-3 w-3" />
                    Source: {item.source}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
