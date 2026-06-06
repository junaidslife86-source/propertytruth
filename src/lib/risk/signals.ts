import type {
  BuyerRiskSignal,
  Development,
  Infrastructure,
  RiskCategory,
  RiskOverlay,
  RiskSeverity,
} from "@/lib/schemas";
import { calculatePropertyConfidenceScore } from "@/lib/risk/score";
import type { PropertyConfidenceScore } from "@/lib/schemas";

type ZoningRow = { id: string; zoning_type: string; council?: string | null };

const CATEGORY_LABELS: Record<RiskCategory, string> = {
  planning: "Planning & development",
  flood: "Flood exposure",
  bushfire: "Bushfire exposure",
  noise: "Noise & disruption",
  strata: "Strata & shared ownership",
  inspection: "Building condition",
  ownership_cost: "Ongoing ownership costs",
};

function signal(
  partial: Omit<BuyerRiskSignal, "lastUpdated"> & { lastUpdated?: string },
): BuyerRiskSignal {
  return {
    ...partial,
    lastUpdated: partial.lastUpdated ?? new Date().toISOString(),
  };
}

function planningSignals(
  developments: Development[],
  zoning: ZoningRow[],
): BuyerRiskSignal[] {
  const signals: BuyerRiskSignal[] = [];

  const tallDa = developments.find((d) => (d.storeys ?? 0) >= 10);
  if (tallDa) {
    signals.push(
      signal({
        id: "planning-high-rise",
        category: "planning",
        severity: "high",
        title: "Large development proposed nearby",
        plainEnglishSummary: `A ${tallDa.storeys}-storey ${tallDa.development_type ?? "development"} is recorded about ${tallDa.distance_meters}m away. This could change views, traffic, and neighbourhood feel over time.`,
        buyerQuestion:
          "How might a tall building nearby affect light, outlook, and resale appeal?",
        evidenceSource: tallDa.application_number,
        confidence: "high",
      }),
    );
  }

  const activeCount = developments.filter(
    (d) =>
      d.status?.toLowerCase().includes("assessment") ||
      d.status?.toLowerCase().includes("lodged"),
  ).length;

  if (developments.length >= 2) {
    signals.push(
      signal({
        id: "planning-activity",
        category: "planning",
        severity: activeCount >= 2 ? "medium" : "low",
        title: "Construction activity in the area",
        plainEnglishSummary: `${developments.length} development application(s) were found within your search radius. The streetscape may evolve gradually.`,
        buyerQuestion:
          "Are you comfortable with ongoing construction and changing street character nearby?",
        evidenceSource: "NSW development applications",
        confidence: "high",
      }),
    );
  }

  const rezoning = zoning.find((z) =>
    /rezon|spot|amendment/i.test(z.zoning_type),
  );
  if (rezoning) {
    signals.push(
      signal({
        id: "planning-rezoning",
        category: "planning",
        severity: "medium",
        title: "Rezoning context nearby",
        plainEnglishSummary: `A "${rezoning.zoning_type}" overlay applies in this area, which may influence what can be built nearby.`,
        buyerQuestion:
          "Could future rezoning allow denser or different uses on neighbouring lots?",
        evidenceSource: rezoning.council ?? "Council zoning records",
        confidence: "medium",
      }),
    );
  }

  const heritage = zoning.find((z) => /heritage/i.test(z.zoning_type));
  if (heritage) {
    signals.push(
      signal({
        id: "planning-heritage",
        category: "planning",
        severity: "low",
        title: "Heritage overlay nearby",
        plainEnglishSummary: `${heritage.zoning_type} may help preserve local character, though renovation rules on neighbouring properties can be stricter.`,
        buyerQuestion:
          "Will heritage controls affect any renovations you plan to make?",
        evidenceSource: heritage.council ?? "Council zoning records",
        confidence: "medium",
      }),
    );
  }

  if (!signals.length) {
    signals.push(
      signal({
        id: "planning-quiet",
        category: "planning",
        severity: "low",
        title: "Limited planning activity recorded",
        plainEnglishSummary:
          "No major development applications were found in our current dataset for this radius. Future change is still possible.",
        buyerQuestion:
          "Has your solicitor or buyer's agent checked for recent council notices?",
        evidenceSource: "Development application scan",
        confidence: "medium",
      }),
    );
  }

  return signals;
}

function noiseSignals(infrastructure: Infrastructure[]): BuyerRiskSignal[] {
  const transport = infrastructure.filter((i) =>
    /transport|metro|rail|road/i.test(i.type),
  );

  if (transport.length) {
    return [
      signal({
        id: "noise-transport",
        category: "noise",
        severity: "medium",
        title: "Transport works planned nearby",
        plainEnglishSummary: `${transport.map((t) => t.title).join("; ")}. Works may bring temporary noise, access changes, or busier periods.`,
        buyerQuestion:
          "How would construction noise and changed traffic patterns affect day-to-day living?",
        evidenceSource: transport[0]?.source ?? "Infrastructure dataset",
        confidence: "medium",
      }),
    ];
  }

  return [
    signal({
      id: "noise-none-recorded",
      category: "noise",
      severity: "low",
      title: "No major transport works recorded",
      plainEnglishSummary:
        "We did not find transport upgrade projects in our current dataset for this radius.",
      buyerQuestion:
        "Have you visited at different times of day to gauge ambient noise?",
      evidenceSource: "Infrastructure dataset",
      confidence: "low",
    }),
  ];
}

function strataSignals(developments: Development[]): BuyerRiskSignal[] {
  const nearbyApartments = developments.filter(
    (d) =>
      /residential|mixed|apartment|unit/i.test(
        `${d.development_type ?? ""} ${d.description ?? ""}`,
      ) && (d.storeys ?? 0) >= 4,
  );

  if (nearbyApartments.length) {
    return [
      signal({
        id: "strata-nearby-density",
        category: "strata",
        severity: "medium",
        title: "Higher-density housing nearby",
        plainEnglishSummary:
          "Apartment or mixed-use projects are active nearby. If you are buying into a strata scheme, building management and levy health matter.",
        buyerQuestion:
          "If this is a strata property, have you reviewed the owners corporation financials and meeting minutes?",
        evidenceSource: "Nearby development applications",
        confidence: "medium",
      }),
    ];
  }

  return [
    signal({
      id: "strata-unknown",
      category: "strata",
      severity: "unknown",
      title: CATEGORY_LABELS.strata,
      plainEnglishSummary:
        "We have not yet verified whether this property is part of a strata or community title scheme.",
      buyerQuestion:
        "Is the property torrens, strata, or community title — and what are the ongoing levies?",
      evidenceSource: "Not yet checked",
      confidence: "low",
    }),
  ];
}

function ownershipCostSignals(zoning: ZoningRow[]): BuyerRiskSignal[] {
  const heritage = zoning.find((z) => /heritage/i.test(z.zoning_type));

  if (heritage) {
    return [
      signal({
        id: "ownership-heritage",
        category: "ownership_cost",
        severity: "medium",
        title: "Heritage may affect upkeep costs",
        plainEnglishSummary:
          "Properties in or near heritage areas can carry higher maintenance and approval costs for alterations.",
        buyerQuestion:
          "Have you budgeted for heritage-compliant repairs or council approval fees?",
        evidenceSource: heritage.council ?? "Council zoning records",
        confidence: "medium",
      }),
    ];
  }

  return [
    signal({
      id: "ownership-general",
      category: "ownership_cost",
      severity: "low",
      title: "Standard ownership cost checks apply",
      plainEnglishSummary:
        "Based on available public data, no unusual ownership cost signals were identified. Rates, insurance, and maintenance still need your own review.",
      buyerQuestion:
        "Have you estimated council rates, insurance, and annual maintenance for this property type?",
      evidenceSource: "Property scan",
      confidence: "low",
    }),
  ];
}

const OVERLAY_SEVERITY_RANK: Record<RiskOverlay["severity"], number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const OVERLAY_BUYER_QUESTIONS: Record<"flood" | "bushfire", string> = {
  flood:
    "Is the property on a flood plain or subject to overland flow — and how would that affect insurance and building approvals?",
  bushfire:
    "Does a bushfire assessment apply, and are there construction standards or insurance implications?",
};

function mapOverlaySeverity(severity: RiskOverlay["severity"]): RiskSeverity {
  return severity;
}

function overlayCategorySignal(
  category: "flood" | "bushfire",
  overlays: RiskOverlay[],
): BuyerRiskSignal {
  const matching = overlays.filter((o) => o.category === category);

  if (matching.length) {
    const worst = [...matching].sort(
      (a, b) =>
        OVERLAY_SEVERITY_RANK[b.severity] - OVERLAY_SEVERITY_RANK[a.severity],
    )[0];

    const others =
      matching.length > 1
        ? ` ${matching.length - 1} additional overlay(s) also intersect this location.`
        : "";

    return signal({
      id: `${category}-overlay`,
      category,
      severity: mapOverlaySeverity(worst.severity),
      title: worst.name,
      plainEnglishSummary: `Based on available public data, this property intersects the "${worst.name}" overlay (${worst.severity} severity).${others}`,
      buyerQuestion: OVERLAY_BUYER_QUESTIONS[category],
      evidenceSource: worst.source,
      sourceUrl: worst.source_url ?? undefined,
      confidence: "high",
      lastUpdated: worst.last_updated,
    });
  }

  return signal({
    id: `${category}-no-overlay`,
    category,
    severity: "unknown",
    title: CATEGORY_LABELS[category],
    plainEnglishSummary:
      "No matching public overlay found for this property location in our current dataset. This does not confirm the property is free from flood or bushfire exposure — further checks with council and insurers are recommended.",
    buyerQuestion: OVERLAY_BUYER_QUESTIONS[category],
    evidenceSource: "NSW public overlay datasets",
    confidence: "medium",
  });
}

function dataGapSignal(
  id: string,
  category: RiskCategory,
  title: string,
  summary: string,
  question: string,
): BuyerRiskSignal {
  return signal({
    id,
    category,
    severity: "unknown",
    title,
    plainEnglishSummary: summary,
    buyerQuestion: question,
    evidenceSource: "Not yet checked",
    confidence: "low",
  });
}

export function buildBuyerRiskSignals(
  developments: Development[],
  infrastructure: Infrastructure[],
  zoning: ZoningRow[],
  riskOverlays: RiskOverlay[] = [],
): BuyerRiskSignal[] {
  return [
    ...planningSignals(developments, zoning),
    overlayCategorySignal("flood", riskOverlays),
    overlayCategorySignal("bushfire", riskOverlays),
    ...noiseSignals(infrastructure),
    ...strataSignals(developments),
    dataGapSignal(
      "inspection-unknown",
      "inspection",
      CATEGORY_LABELS.inspection,
      "A building and pest inspection has not been completed as part of this scan.",
      "When did you last arrange an independent building and pest inspection?",
    ),
    ...ownershipCostSignals(zoning),
  ];
}

export function buildBuyerRiskSnapshot(
  developments: Development[],
  infrastructure: Infrastructure[],
  zoning: ZoningRow[],
  riskOverlays: RiskOverlay[] = [],
): {
  buyerRiskSignals: BuyerRiskSignal[];
  confidenceScore: PropertyConfidenceScore;
} {
  const buyerRiskSignals = buildBuyerRiskSignals(
    developments,
    infrastructure,
    zoning,
    riskOverlays,
  );
  const confidenceScore = calculatePropertyConfidenceScore(buyerRiskSignals);

  return { buyerRiskSignals, confidenceScore };
}
