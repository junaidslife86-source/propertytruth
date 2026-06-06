import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  geminiFindingsResponseSchema,
  mapFindingCategory,
  type DocumentFinding,
  type StrataFindingCategory,
} from "@/lib/strata/schemas";
import type { TextChunk } from "@/lib/strata/chunk";

const FINDING_CATEGORIES: StrataFindingCategory[] = [
  "special_levies",
  "capital_works_fund",
  "water_ingress",
  "defects",
  "legal_disputes",
  "insurance_increases",
  "major_upcoming_works",
  "repeated_complaints",
  "by_law_issues",
];

const SYSTEM_PROMPT = `You are a strata report review assistant for Australian property buyers.
You ONLY extract findings explicitly supported by the supplied document excerpts.
Rules:
- Never invent facts not present in the text
- Every finding MUST include an exact supporting_quote copied verbatim from the excerpts
- pageNumber must match the [Page N] label where the quote appears
- Use plain English explanations — calm, non-alarmist tone
- severity: low (minor/note), medium (worth reviewing), high (significant buyer concern)
- confidence: low (implicit/unclear), medium (reasonably clear), high (explicit statement)
- If a category has no evidence, omit it — do not fabricate findings
- Return valid JSON only`;

function formatChunksForPrompt(chunks: TextChunk[]): string {
  return chunks
    .map(
      (c) =>
        `[Page ${c.pageNumber} | Chunk ${c.chunkIndex}]\n${c.content}`,
    )
    .join("\n\n---\n\n");
}

export async function analyzeStrataReport(
  chunks: TextChunk[],
): Promise<Omit<DocumentFinding, "id">[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return buildDemoFindingsFromChunks(chunks);
  }

  const limited = chunks.slice(0, 80);
  const prompt = `Review these strata report excerpts and identify buyer-relevant findings.

Categories to look for (only if evidence exists):
${FINDING_CATEGORIES.join(", ")}

Return JSON:
{
  "findings": [
    {
      "category": "special_levies",
      "title": "Short title",
      "severity": "medium",
      "plainEnglishExplanation": "Plain English for a buyer",
      "supportingQuote": "Exact quote from document",
      "pageNumber": 3,
      "confidence": "high"
    }
  ]
}

Document excerpts:
${formatChunksForPrompt(limited)}`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Failed to parse Gemini response");
    parsed = JSON.parse(match[0]);
  }

  const { findings } = geminiFindingsResponseSchema.parse(parsed);
  return findings.map((f) => ({
    ...f,
    category: mapFindingCategory(f.category),
  }));
}

function buildDemoFindingsFromChunks(
  chunks: TextChunk[],
): Omit<DocumentFinding, "id">[] {
  const fullText = chunks.map((c) => c.content).join(" ").toLowerCase();
  const findings: Omit<DocumentFinding, "id">[] = [];

  const rules: {
    category: StrataFindingCategory;
    keywords: string[];
    title: string;
    explanation: string;
    severity: "low" | "medium" | "high";
  }[] = [
    {
      category: "special_levies",
      keywords: ["special levy", "special contribution", "levy notice"],
      title: "Special levy mentioned",
      explanation:
        "The report references a special levy or one-off contribution. Confirm the amount, timing, and what works it funds.",
      severity: "high",
    },
    {
      category: "capital_works_fund",
      keywords: ["capital works", "sinking fund", "underfunded", "deficit"],
      title: "Capital works fund concern",
      explanation:
        "Language suggests the capital works or sinking fund may be under pressure. Review the 10-year plan and recent balances.",
      severity: "medium",
    },
    {
      category: "water_ingress",
      keywords: ["water ingress", "leak", "waterproofing", "moisture", "damp"],
      title: "Water ingress noted",
      explanation:
        "Water ingress or waterproofing issues are mentioned. These can be costly in strata — check repair status and liability.",
      severity: "high",
    },
    {
      category: "defects",
      keywords: ["defect", "rectification", "building work", "cladding"],
      title: "Building defects referenced",
      explanation:
        "Defects or rectification works appear in the report. Clarify scope, cost allocation, and completion timeline.",
      severity: "high",
    },
    {
      category: "legal_disputes",
      keywords: ["tribunal", "ncat", "litigation", "dispute", "legal action"],
      title: "Legal dispute mentioned",
      explanation:
        "A dispute or legal process is referenced. Ask for current status and potential cost exposure to owners.",
      severity: "medium",
    },
    {
      category: "insurance_increases",
      keywords: ["insurance premium", "premium increase", "insurance renewal"],
      title: "Insurance cost pressure",
      explanation:
        "Insurance premiums or renewals are discussed. Rising premiums can flow through to levies.",
      severity: "medium",
    },
    {
      category: "major_upcoming_works",
      keywords: ["major works", "facade", "lift replacement", "roof replacement"],
      title: "Major works planned",
      explanation:
        "Significant building works are flagged. Confirm funding source, timing, and impact on levies.",
      severity: "medium",
    },
    {
      category: "repeated_complaints",
      keywords: ["complaint", "recurring", "ongoing issue", "multiple notices"],
      title: "Repeated complaints",
      explanation:
        "Repeated or ongoing complaints appear. This may signal unresolved building or neighbour issues.",
      severity: "medium",
    },
    {
      category: "by_law_issues",
      keywords: ["by-law", "bylaw", "breach", "compliance notice"],
      title: "By-law issue noted",
      explanation:
        "By-law compliance or breaches are mentioned. Review whether they affect the lot you are buying.",
      severity: "low",
    },
  ];

  for (const rule of rules) {
    const hit = rule.keywords.find((kw) => fullText.includes(kw));
    if (!hit) continue;

    const sourceChunk = chunks.find((c) =>
      c.content.toLowerCase().includes(hit),
    );
    const quote = sourceChunk
      ? sourceChunk.content.slice(0, 200).trim() + "…"
      : `Reference to "${hit}" in report`;

    findings.push({
      category: rule.category,
      title: rule.title,
      severity: rule.severity,
      plainEnglishExplanation: rule.explanation,
      supportingQuote: quote,
      pageNumber: sourceChunk?.pageNumber ?? 1,
      confidence: "medium",
    });
  }

  if (!findings.length) {
    findings.push({
      category: "capital_works_fund",
      title: "No critical flags in demo scan",
      severity: "low",
      plainEnglishExplanation:
        "Keyword scan did not surface major concerns. A full AI review runs when Gemini API is configured.",
      supportingQuote: "Configure GEMINI_API_KEY for detailed analysis.",
      pageNumber: 1,
      confidence: "low",
    });
  }

  return findings;
}

export async function answerStrataQuestion(
  chunks: { pageNumber: number; content: string }[],
  question: string,
): Promise<{ answer: string; sources: { pageNumber: number; excerpt: string }[] }> {
  const apiKey = process.env.GEMINI_API_KEY;

  const context = chunks
    .map((c) => `[Page ${c.pageNumber}]\n${c.content}`)
    .join("\n\n---\n\n");

  const sources = chunks.map((c) => ({
    pageNumber: c.pageNumber,
    excerpt: c.content.slice(0, 220).trim() + (c.content.length > 220 ? "…" : ""),
  }));

  if (!apiKey) {
    return {
      answer:
        "Based on the retrieved excerpts only: configure GEMINI_API_KEY to enable AI answers. The excerpts above are the relevant sections for your question.",
      sources,
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: `You answer questions about a strata report using ONLY the provided excerpts.
If the excerpts do not contain enough information, say so clearly.
Never use outside knowledge. Cite page numbers. Keep answers under 150 words. Calm, buyer-friendly tone.`,
  });

  const result = await model.generateContent(
    `Question: ${question}\n\nRetrieved excerpts (only source of truth):\n${context}`,
  );

  return {
    answer: result.response.text().trim(),
    sources,
  };
}
