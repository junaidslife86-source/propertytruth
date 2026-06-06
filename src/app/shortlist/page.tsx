"use client";

import Link from "next/link";
import { ArrowLeft, Search, GitCompareArrows, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useShortlistStore } from "@/stores/shortlist-store";
import { AddToCompareButton } from "@/components/add-to-compare-button";

export default function ShortlistPage() {
  const properties = useShortlistStore((s) => s.properties);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Buyer shortlist
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Properties you&apos;re actively considering — saved on this device.
        </p>
      </div>

      {properties.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <Search className="h-8 w-8 text-stone-300" />
            <p className="text-lg font-medium text-stone-900">
              Scan a property to start building your buyer shortlist.
            </p>
            <Button asChild>
              <Link href="/">Search an address</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {properties.map((scan) => {
            const topRisks = scan.buyerRiskSignals
              .filter((s) => s.severity === "high" || s.severity === "medium")
              .slice(0, 2);
            return (
              <Card key={scan.propertyId}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <Link
                      href={`/property/${encodeURIComponent(scan.propertyId)}`}
                      className="font-semibold text-stone-900 hover:underline"
                    >
                      {scan.formattedAddress}
                    </Link>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default">
                        Score {scan.confidenceScore.score}
                      </Badge>
                      <Badge variant="medium">
                        {scan.confidenceScore.label}
                      </Badge>
                    </div>
                    {topRisks.length > 0 && (
                      <ul className="text-xs text-stone-500">
                        {topRisks.map((r) => (
                          <li key={r.id}>• {r.title}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" asChild>
                      <Link
                        href={`/property/${encodeURIComponent(scan.propertyId)}`}
                      >
                        View report
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/compare">
                        <GitCompareArrows className="h-3.5 w-3.5" />
                        Compare
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/inspection/new">
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        Inspect
                      </Link>
                    </Button>
                    <AddToCompareButton scan={scan} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
