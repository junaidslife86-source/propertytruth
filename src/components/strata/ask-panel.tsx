"use client";

import { useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STRATA_DISCLAIMER } from "@/lib/strata/schemas";

interface AskPanelProps {
  documentId: string;
}

interface AskResult {
  answer: string;
  sources: { pageNumber: number; excerpt: string }[];
}

const SUGGESTED = [
  "Are there any special levies?",
  "What major works are planned?",
  "Are there water ingress or defect issues?",
];

export function StrataAskPanel({ documentId }: AskPanelProps) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAsk(q?: string) {
    const text = (q ?? question).trim();
    if (!text) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/strata/${documentId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not get answer");
      setResult(data);
      if (q) setQuestion(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-4 w-4 text-stone-500" />
          Ask questions about this strata report
        </CardTitle>
        <p className="text-sm text-stone-500">
          Answers use retrieved document excerpts only — not general knowledge.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Is the capital works fund adequate?"
            className="h-11"
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleAsk();
            }}
          />
          <Button onClick={() => handleAsk()} disabled={loading || !question.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleAsk(s)}
              className="rounded-full bg-stone-100 px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200"
            >
              {s}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {result && (
          <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50/50 p-4">
            <p className="text-sm leading-relaxed text-stone-800">{result.answer}</p>
            {result.sources.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                  Retrieved excerpts
                </p>
                {result.sources.map((s) => (
                  <p
                    key={`${s.pageNumber}-${s.excerpt.slice(0, 20)}`}
                    className="text-xs leading-relaxed text-stone-500"
                  >
                    <span className="font-medium text-stone-600">
                      Page {s.pageNumber}:
                    </span>{" "}
                    {s.excerpt}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-xs leading-relaxed text-stone-400">{STRATA_DISCLAIMER}</p>
      </CardContent>
    </Card>
  );
}
