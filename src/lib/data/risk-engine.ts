import type {
  Development,
  Infrastructure,
  RiskIndicator,
} from "@/lib/schemas";

type ZoningRow = { id: string; zoning_type: string; council?: string | null };

export function computeRiskIndicators(
  developments: Development[],
  infrastructure: Infrastructure[],
  zoning: ZoningRow[],
): RiskIndicator[] {
  const indicators: RiskIndicator[] = [];

  const tallDa = developments.find((d) => (d.storeys ?? 0) >= 10);
  if (tallDa) {
    indicators.push({
      id: "high-rise-da",
      severity: "high",
      title: "Nearby high-rise DA",
      description: `A ${tallDa.storeys}-storey ${tallDa.development_type ?? "development"} application (${tallDa.application_number}) is recorded ~${tallDa.distance_meters}m away.`,
      source: tallDa.application_number,
    });
  }

  const activeCount = developments.filter(
    (d) => d.status?.toLowerCase().includes("assessment") || d.status?.toLowerCase().includes("lodged"),
  ).length;

  if (developments.length >= 2) {
    indicators.push({
      id: "construction-activity",
      severity: activeCount >= 2 ? "medium" : "low",
      title: "Construction activity nearby",
      description: `${developments.length} development application(s) found within the search radius.`,
      source: "Development applications",
    });
  }

  const rezoning = zoning.find((z) =>
    /rezon|spot|amendment/i.test(z.zoning_type),
  );
  if (rezoning) {
    indicators.push({
      id: "rezoning",
      severity: "medium",
      title: "Rezoning context nearby",
      description: `Zoning overlay "${rezoning.zoning_type}" applies in this area.`,
      source: rezoning.council ?? "Council zoning",
    });
  }

  const transport = infrastructure.filter((i) => /transport|metro|rail/i.test(i.type));
  if (transport.length) {
    indicators.push({
      id: "transport",
      severity: "medium",
      title: "Transport upgrades planned",
      description: transport.map((t) => t.title).join("; "),
      source: transport[0]?.source ?? "Infrastructure dataset",
    });
  }

  const heritage = zoning.find((z) => /heritage/i.test(z.zoning_type));
  if (heritage) {
    indicators.push({
      id: "heritage",
      severity: "low",
      title: "Heritage overlay nearby",
      description: `${heritage.zoning_type} may influence local development character.`,
      source: heritage.council ?? "Zoning overlay",
    });
  }

  if (!indicators.length) {
    indicators.push({
      id: "quiet",
      severity: "low",
      title: "Limited recorded activity",
      description:
        "No major applications were found in our current dataset for this radius. This does not guarantee no future change.",
      source: "Scan results",
    });
  }

  return indicators;
}

export function buildQuickSummary(indicators: RiskIndicator[]): string {
  const high = indicators.filter((i) => i.severity === "high");
  const medium = indicators.filter((i) => i.severity === "medium");

  if (high.length) {
    return `Notable items include ${high[0].title.toLowerCase()}. ${medium.length ? "Additional medium-level signals are also present." : ""} Review nearby applications for specifics.`;
  }
  if (medium.length) {
    return `Some medium-level neighbourhood change signals were detected, including ${medium[0].title.toLowerCase()}.`;
  }
  return "Limited planning activity was detected in the current dataset for this search area.";
}
