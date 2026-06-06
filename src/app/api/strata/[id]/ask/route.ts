import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { fetchDocumentChunksFirestore } from "@/lib/firebase/strata";
import { answerStrataQuestion } from "@/lib/strata/analyze";
import { retrieveRelevantChunks } from "@/lib/strata/retrieve";
import {
  STRATA_DISCLAIMER,
  strataAskRequestSchema,
  strataAskResponseSchema,
} from "@/lib/strata/schemas";
import { DEMO_STRATA_ID, DEMO_STRATA_TEXT } from "@/lib/strata/demo";
import { chunkPages } from "@/lib/strata/chunk";
import { redactPii } from "@/lib/compliance/redact";
import {
  assertStrataDocumentAccess,
  AccessDeniedError,
  resolveClientCaller,
  getRateLimitKey,
} from "@/lib/auth/access";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const limited = rateLimit(getRateLimitKey(request, "strata-ask"), 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many questions" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = strataAskRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid question" }, { status: 400 });
  }

  let chunks: { id: string; pageNumber: number; chunkIndex: number; content: string }[];

  if (id === DEMO_STRATA_ID) {
    const demoPages = DEMO_STRATA_TEXT.split(/Page \d+/)
      .filter(Boolean)
      .map((text, i) => ({
        pageNumber: i + 1,
        text: text.trim(),
      }));
    chunks = chunkPages(demoPages).map((c, i) => ({
      id: `demo-chunk-${i}`,
      ...c,
    }));
  } else {
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
    }

    try {
      const caller = await resolveClientCaller(request);
      await assertStrataDocumentAccess(db, id, caller);
    } catch (err) {
      if (err instanceof AccessDeniedError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    chunks = await fetchDocumentChunksFirestore(db, id);
    if (!chunks.length) {
      return NextResponse.json({ error: "No document text available" }, { status: 404 });
    }
  }

  const relevant = retrieveRelevantChunks(chunks, parsed.data.question, 8);
  const { answer, sources } = await answerStrataQuestion(
    relevant.map((c) => ({ pageNumber: c.pageNumber, content: c.content })),
    parsed.data.question,
  );

  return NextResponse.json(
    strataAskResponseSchema.parse({
      answer: redactPii(answer),
      sources: sources.map((s) => ({
        ...s,
        excerpt: redactPii(s.excerpt),
      })),
      disclaimer: STRATA_DISCLAIMER,
    }),
  );
}
