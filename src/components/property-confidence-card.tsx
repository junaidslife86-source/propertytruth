"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Shield } from "lucide-react";
import type { PropertyConfidenceScore } from "@/lib/schemas";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PropertyConfidenceCardProps {
  address: string;
  confidence: PropertyConfidenceScore;
  className?: string;
}

const labelConfig: Record<
  PropertyConfidenceScore["label"],
  { badge: "low" | "medium" | "high" | "default"; display: string; ring: string }
> = {
  strong: {
    badge: "low",
    display: "Strong confidence",
    ring: "from-emerald-50 to-white",
  },
  cautious: {
    badge: "medium",
    display: "Proceed with caution",
    ring: "from-amber-50 to-white",
  },
  risky: {
    badge: "high",
    display: "Notable concerns",
    ring: "from-orange-50 to-white",
  },
  incomplete: {
    badge: "default",
    display: "Snapshot incomplete",
    ring: "from-stone-100 to-white",
  },
};

export function PropertyConfidenceCard({
  address,
  confidence,
  className,
}: PropertyConfidenceCardProps) {
  const config = labelConfig[confidence.label];
  const scoreAngle = (confidence.score / 100) * 360;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="confidence-heading"
      className={className}
    >
      <Card
        className={cn(
          "overflow-hidden border-stone-200/80 bg-gradient-to-br shadow-[0_4px_32px_rgba(0,0,0,0.06)]",
          config.ring,
        )}
      >
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Shield className="h-5 w-5 text-stone-500" aria-hidden />
                <p className="text-sm font-medium uppercase tracking-wide text-stone-500">
                  Property Risk Snapshot
                </p>
                <Badge variant={config.badge}>{config.display}</Badge>
              </div>

              <div>
                <h1
                  id="confidence-heading"
                  className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl"
                >
                  {address}
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-stone-600">
                  {confidence.summary}
                </p>
              </div>
            </div>

            <div
              className="relative mx-auto flex h-40 w-40 shrink-0 items-center justify-center lg:mx-0"
              aria-label={`Confidence score ${confidence.score} out of 100`}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(#57534e ${scoreAngle}deg, #e7e5e4 ${scoreAngle}deg)`,
                }}
              />
              <div className="absolute inset-2 flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
                <span className="text-4xl font-semibold tabular-nums text-stone-900">
                  {confidence.score}
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-stone-400">
                  out of 100
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 border-t border-stone-200/80 pt-8 md:grid-cols-2">
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Positives
              </h2>
              <ul className="space-y-2">
                {confidence.positives.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm leading-relaxed text-stone-600"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-900">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Caution items
              </h2>
              <ul className="space-y-2">
                {confidence.cautionItems.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm leading-relaxed text-stone-600"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-6 border-t border-stone-200/60 pt-4 text-xs leading-relaxed text-stone-400">
            Not a valuation or professional advice. This snapshot is based on
            available public data and is intended to help you ask better
            questions — not to replace conveyancing, building, or financial
            advice.
          </p>
        </CardContent>
      </Card>
    </motion.section>
  );
}
