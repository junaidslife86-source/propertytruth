import type { BuyerRiskSignal, PropertyConfidenceScore } from "@/lib/schemas";

const SEVERITY_PENALTY: Record<BuyerRiskSignal["severity"], number> = {
  high: 22,
  medium: 9,
  low: 3,
  unknown: 5,
};

const LABEL_COPY: Record<
  PropertyConfidenceScore["label"],
  { headline: string; tone: string }
> = {
  strong: {
    headline: "Strong confidence",
    tone: "Based on available public data, no major buyer concerns stood out in the categories we could check.",
  },
  cautious: {
    headline: "Proceed with caution",
    tone: "Based on available public data, some items deserve a closer look before you commit.",
  },
  risky: {
    headline: "Notable concerns flagged",
    tone: "Based on available public data, several signals may affect your purchase decision. Review each item carefully.",
  },
  incomplete: {
    headline: "Snapshot incomplete",
    tone: "Based on available public data, important categories have not been checked yet. Treat this as a starting point, not a full picture.",
  },
};

function derivePositives(signals: BuyerRiskSignal[]): string[] {
  const positives: string[] = [];

  const planning = signals.find((s) => s.category === "planning");
  if (planning?.severity === "low") {
    positives.push(planning.plainEnglishSummary);
  }

  const heritage = signals.find(
    (s) => s.category === "planning" && /heritage/i.test(s.title),
  );
  if (heritage && heritage.severity === "low") {
    positives.push("Heritage controls nearby may help preserve local character.");
  }

  const quietPlanning = signals.filter(
    (s) => s.category === "planning" && s.severity === "low",
  );
  if (quietPlanning.length && !positives.length) {
    positives.push(quietPlanning[0].plainEnglishSummary);
  }

  const lowNoise = signals.find(
    (s) => s.category === "noise" && s.severity === "low",
  );
  if (lowNoise) positives.push(lowNoise.plainEnglishSummary);

  const verifiedCategories = new Set(
    signals.filter((s) => s.severity !== "unknown").map((s) => s.category),
  );
  if (verifiedCategories.size >= 3) {
    positives.push(
      `${verifiedCategories.size} risk categories were reviewed using public records.`,
    );
  }

  if (!positives.length) {
    positives.push(
      "No high-severity signals were identified in the categories we could check.",
    );
  }

  return positives.slice(0, 3);
}

function deriveCautionItems(signals: BuyerRiskSignal[]): string[] {
  const ordered = [...signals].sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2, unknown: 3 };
    return rank[a.severity] - rank[b.severity];
  });

  const items = ordered
    .filter((s) => s.severity === "high" || s.severity === "medium")
    .map((s) => s.title);

  if (items.length < 3) {
    const unknowns = ordered
      .filter((s) => s.severity === "unknown")
      .map((s) => `${s.title} — data not yet available`);
    items.push(...unknowns);
  }

  if (!items.length) {
    items.push("Review all signals below before making an offer.");
  }

  return items.slice(0, 3);
}

function deriveBlockers(signals: BuyerRiskSignal[]): string[] {
  return signals
    .filter((s) => s.severity === "high")
    .map((s) => s.title);
}

function resolveLabel(
  score: number,
  signals: BuyerRiskSignal[],
): PropertyConfidenceScore["label"] {
  const unknownCount = signals.filter((s) => s.severity === "unknown").length;
  const unknownRatio = signals.length ? unknownCount / signals.length : 1;

  if (unknownCount >= 3 || unknownRatio >= 0.45) {
    return "incomplete";
  }
  if (score >= 75) return "strong";
  if (score >= 50) return "cautious";
  return "risky";
}

export function calculatePropertyConfidenceScore(
  signals: BuyerRiskSignal[],
): PropertyConfidenceScore {
  const baseScore = 100;
  const penalty = signals.reduce(
    (sum, signal) => sum + SEVERITY_PENALTY[signal.severity],
    0,
  );
  const score = Math.max(0, Math.min(100, baseScore - penalty));
  const label = resolveLabel(score, signals);
  const copy = LABEL_COPY[label];

  const blockers = deriveBlockers(signals);
  const cautionItems = deriveCautionItems(signals);
  const positives = derivePositives(signals);

  let summary = copy.tone;
  if (blockers.length) {
    summary += ` Key items to review: ${blockers.slice(0, 2).join(", ")}.`;
  }

  return {
    score,
    label,
    summary,
    blockers,
    cautionItems,
    positives,
  };
}
