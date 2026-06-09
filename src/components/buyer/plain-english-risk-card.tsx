"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { BuyerRiskSignal } from "@/lib/schemas";
import { buildPlainEnglishIssue } from "@/lib/issues/plain-english";
import { SourceBadge } from "@/components/compliance/source-badge";
import type { SourceLabel } from "@/lib/sources/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function signalSourceLabel(signal: BuyerRiskSignal): SourceLabel {
  if (signal.severity === "unknown") return "unknown";
  if (signal.evidenceSource.toLowerCase().includes("demo")) return "demo_sample";
  if (signal.evidenceSource.toLowerCase().includes("seed")) return "seeded_sample";
  return "public_record";
}

const severityBadge = {
  low: "low",
  medium: "medium",
  high: "high",
  unknown: "default",
} as const;

interface PlainEnglishRiskCardProps {
  signal: BuyerRiskSignal;
  index?: number;
}

export function PlainEnglishRiskCard({ signal, index = 0 }: PlainEnglishRiskCardProps) {
  const [open, setOpen] = useState(false);
  const plain = buildPlainEnglishIssue(signal);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="cursor-pointer pb-3" onClick={() => setOpen(!open)}>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <SourceBadge source={signalSourceLabel(signal)} />
                <Badge variant={severityBadge[signal.severity]}>
                  {signal.severity === "unknown" ? "Data gap" : signal.severity}
                </Badge>
              </div>
              <CardTitle className="text-base leading-snug">{signal.title}</CardTitle>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 text-on-surface-variant transition-transform",
                open && "rotate-180",
              )}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <p className="text-sm text-on-surface-variant">{plain.whatThisMeans}</p>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3 overflow-hidden border-t border-outline-variant/20 pt-3"
              >
                <Section title="Why it matters" text={plain.whyItMatters} />
                <Section title="What can go wrong" text={plain.whatCanGoWrong} />
                <Section title="Who to ask" text={plain.whoToAsk} />
                <Section title="What document confirms it" text={plain.whatDocument} />
                {signal.buyerQuestion && (
                  <div className="rounded-lg bg-surface-container-low px-3 py-2 text-sm">
                    <p className="font-label-caps text-on-surface-variant">Suggested question</p>
                    <p className="mt-1 text-foreground">{signal.buyerQuestion}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="font-label-caps text-on-surface-variant">{title}</p>
      <p className="mt-1 text-sm text-foreground">{text}</p>
    </div>
  );
}
