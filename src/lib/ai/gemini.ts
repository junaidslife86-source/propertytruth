import { GoogleGenerativeAI } from "@google/generative-ai";
import { AI_DISCLAIMER } from "@/lib/constants";
import type { PropertyScanResult } from "@/lib/schemas";
import { aiInsightResponseSchema } from "@/lib/schemas";

const SYSTEM_PROMPT = `You are a calm planning-information assistant for Sydney property buyers.
You ONLY summarise factual nearby planning data provided by the user.
Rules:
- Never predict property prices or investment returns
- Never give legal advice or guarantee outcomes
- Never speculate beyond the supplied data
- Explain planning jargon in plain English
- Acknowledge uncertainty
- Keep tone reassuring and neutral
- Maximum 120 words for summary`;

export async function generateAreaInsight(scan: PropertyScanResult) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return aiInsightResponseSchema.parse({
      summary:
        "Several medium-density and mixed-use applications appear nearby in our records. Neighbourhood density may change gradually as applications are assessed — check individual DA details for scale and status.",
      confidence: "medium" as const,
      sources: scan.developments.slice(0, 3).map((d) => d.application_number),
      disclaimer: AI_DISCLAIMER,
    });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const context = {
    address: scan.formattedAddress,
    radius_meters: scan.radiusMeters,
    developments: scan.developments.map((d) => ({
      type: d.development_type,
      storeys: d.storeys,
      status: d.status,
      distance_m: d.distance_meters,
      ref: d.application_number,
    })),
    infrastructure: scan.infrastructure.map((i) => ({
      title: i.title,
      type: i.type,
      status: i.status,
      distance_m: i.distance_meters,
    })),
    zoning: scan.zoning.map((z) => z.zoning_type),
    risk_indicators: scan.riskIndicators,
  };

  const result = await model.generateContent(
    `Summarise what these nearby changes could mean for a buyer. Cite application numbers where relevant.\n\nData:\n${JSON.stringify(context, null, 2)}`,
  );

  const text = result.response.text().trim();
  const confidence =
    scan.developments.length >= 3 ? "high" : scan.developments.length ? "medium" : "low";

  return aiInsightResponseSchema.parse({
    summary: text,
    confidence,
    sources: [
      ...scan.developments.map((d) => `${d.council} ${d.application_number}`),
      ...scan.infrastructure.map((i) => i.source ?? i.title),
    ].filter(Boolean),
    disclaimer: AI_DISCLAIMER,
  });
}
