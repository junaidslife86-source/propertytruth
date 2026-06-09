import type { BuyerRiskSignal } from "@/lib/schemas";

export interface PlainEnglishIssue {
  whatThisMeans: string;
  whyItMatters: string;
  whatCanGoWrong: string;
  whoToAsk: string;
  whatDocument: string;
}

const CATEGORY_DEFAULTS: Record<
  string,
  Omit<PlainEnglishIssue, "whatThisMeans">
> = {
  planning: {
    whyItMatters: "Nearby change can affect light, noise, outlook, and long-term liveability.",
    whatCanGoWrong: "Construction disruption or altered street character after you move in.",
    whoToAsk: "Conveyancer and council planning counter.",
    whatDocument: "Council DA notices, Section 149 planning certificate, contract disclosures.",
  },
  flood: {
    whyItMatters: "Flood risk can affect insurance cost, lending, and future resale.",
    whatCanGoWrong: "Higher premiums, exclusions, or special levy-style repair costs after events.",
    whoToAsk: "Insurance provider and conveyancer.",
    whatDocument: "Flood planning certificate, insurer quote, SES flood data for the lot.",
  },
  bushfire: {
    whyItMatters: "Bushfire prone areas may need extra construction standards and insurance review.",
    whatCanGoWrong: "BAL ratings, maintenance obligations, or cover limitations.",
    whoToAsk: "Building inspector, insurer, and conveyancer.",
    whatDocument: "BAL certificate, insurance quote, contract vendor disclosures.",
  },
  noise: {
    whyItMatters: "Aircraft or road noise affects daily comfort and resale appeal.",
    whatCanGoWrong: "Sleep disruption, window upgrades, or buyer objections when you sell.",
    whoToAsk: "Conveyancer and selling agent.",
    whatDocument: "Contract disclosures, ANEF maps, council noise policies.",
  },
  strata: {
    whyItMatters: "Strata issues can mean special levies, defects, or governance problems.",
    whatCanGoWrong: "Unexpected bills, litigation, or inability to renovate as planned.",
    whoToAsk: "Conveyancer and strata manager.",
    whatDocument: "Strata report, AGM minutes, capital works plan, insurance certificate.",
  },
  inspection: {
    whyItMatters: "Building defects are often invisible at open homes.",
    whatCanGoWrong: "Major repair costs shortly after settlement.",
    whoToAsk: "Licensed building and pest inspector.",
    whatDocument: "Building and pest inspection report.",
  },
  ownership_cost: {
    whyItMatters: "Ongoing costs affect whether the home fits your household budget.",
    whatCanGoWrong: "Mortgage stress if levies, rates, or maintenance exceed expectations.",
    whoToAsk: "Broker and strata manager (if apartment).",
    whatDocument: "Levy notices, council rates estimate, insurance quote.",
  },
};

export function buildPlainEnglishIssue(signal: BuyerRiskSignal): PlainEnglishIssue {
  const defaults = CATEGORY_DEFAULTS[signal.category] ?? {
    whyItMatters: "Unresolved items can affect your offer decision and future costs.",
    whatCanGoWrong: "Surprises after exchange that professionals could have flagged earlier.",
    whoToAsk: "Your conveyancer or relevant licensed professional.",
    whatDocument: "Contract, searches, and any uploaded reports for this property.",
  };

  return {
    whatThisMeans: signal.plainEnglishSummary,
    whyItMatters: defaults.whyItMatters,
    whatCanGoWrong:
      signal.severity === "high"
        ? `${defaults.whatCanGoWrong} This signal is flagged as higher priority.`
        : defaults.whatCanGoWrong,
    whoToAsk: defaults.whoToAsk,
    whatDocument: defaults.whatDocument,
  };
}
