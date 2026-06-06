"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Droplets,
  Flame,
  Volume2,
  Building,
  ClipboardCheck,
  Wallet,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import type { BuyerRiskSignal, RiskCategory } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface BuyerRiskSignalCardProps {
  signal: BuyerRiskSignal;
  index?: number;
}

const categoryMeta: Record<
  RiskCategory,
  { icon: typeof Building2; label: string; accent: string }
> = {
  planning: {
    icon: Building2,
    label: "Planning",
    accent: "bg-sky-50 text-sky-700",
  },
  flood: {
    icon: Droplets,
    label: "Flood",
    accent: "bg-blue-50 text-blue-700",
  },
  bushfire: {
    icon: Flame,
    label: "Bushfire",
    accent: "bg-orange-50 text-orange-700",
  },
  noise: {
    icon: Volume2,
    label: "Noise",
    accent: "bg-violet-50 text-violet-700",
  },
  strata: {
    icon: Building,
    label: "Strata",
    accent: "bg-indigo-50 text-indigo-700",
  },
  inspection: {
    icon: ClipboardCheck,
    label: "Inspection",
    accent: "bg-teal-50 text-teal-700",
  },
  ownership_cost: {
    icon: Wallet,
    label: "Ownership",
    accent: "bg-stone-100 text-stone-700",
  },
};

const severityLabel: Record<BuyerRiskSignal["severity"], string> = {
  low: "Low concern",
  medium: "Worth reviewing",
  high: "Notable",
  unknown: "Data gap",
};

const severityBadge: Record<
  BuyerRiskSignal["severity"],
  "low" | "medium" | "high" | "default"
> = {
  low: "low",
  medium: "medium",
  high: "high",
  unknown: "default",
};

export function BuyerRiskSignalCard({ signal, index = 0 }: BuyerRiskSignalCardProps) {
  const meta = categoryMeta[signal.category];
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Card className="h-full overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.accent}`}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                  {meta.label}
                </p>
                <CardTitle className="text-base leading-snug">{signal.title}</CardTitle>
              </div>
            </div>
            <Badge variant={severityBadge[signal.severity]} className="shrink-0">
              {severityLabel[signal.severity]}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed text-stone-600">
            {signal.plainEnglishSummary}
          </p>

          <div className="rounded-xl bg-stone-50 px-3 py-2.5">
            <p className="flex items-start gap-2 text-sm text-stone-700">
              <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
              <span>
                <span className="font-medium">Ask yourself: </span>
                {signal.buyerQuestion}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-stone-400">
            <span>
              Source: {signal.evidenceSource}
              {signal.sourceUrl && (
                <a
                  href={signal.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1.5 inline-flex items-center gap-0.5 text-stone-500 underline-offset-2 hover:text-stone-700 hover:underline"
                >
                  View
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </span>
            <span>Updated {formatDate(signal.lastUpdated)}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
