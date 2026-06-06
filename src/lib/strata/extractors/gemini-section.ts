import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ClassifiedPage } from "@/lib/strata/page-types";
import type { RawFinding } from "@/lib/strata/evidence";

const MAX_SECTION_CHARS = 48_000;

function sectionText(pages: ClassifiedPage[]): string {
  return pages
    .map((p) => `[Page ${p.pageNumber}]\n${p.text}`)
    .join("\n\n---\n\n")
    .slice(0, MAX_SECTION_CHARS);
}

export async function extractFindingsWithGemini(
  sectionLabel: string,
  categories: string[],
  pages: ClassifiedPage[],
): Promise<RawFinding[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !pages.length) return [];

  const prompt = `You are reviewing the "${sectionLabel}" section of an Australian strata report bundle for property buyers.

Rules:
- ONLY extract findings explicitly supported by the text below
- Every finding MUST include supportingQuote copied verbatim from the text
- pageNumber must match the [Page N] label
- If no evidence for a category, omit it
- Use calm, non-alarmist plain English
- Include buyerImpact and recommendedQuestion for each finding
- Return JSON only

Categories to consider: ${categories.join(", ")}

Return:
{
  "findings": [
    {
      "category": "defects",
      "severity": "high",
      "title": "Short title",
      "plainEnglishExplanation": "...",
      "buyerImpact": "...",
      "supportingQuote": "exact quote",
      "pageNumber": 12,
      "confidence": "high",
      "recommendedQuestion": "Ask your conveyancer..."
    }
  ]
}

Section text:
${sectionText(pages)}`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? raw) as {
      findings?: RawFinding[];
    };
    return parsed.findings ?? [];
  } catch {
    return [];
  }
}
