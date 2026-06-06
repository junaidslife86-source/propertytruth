"use client";

import { useMemo, useState } from "react";
import {
  calculateOwnershipCost,
  type OwnershipCostInput,
} from "@/lib/finance/ownership-cost";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "lucide-react";

interface OwnershipCostSimulatorProps {
  defaultPrice?: number;
}

export function OwnershipCostSimulator({
  defaultPrice = 950_000,
}: OwnershipCostSimulatorProps) {
  const [input, setInput] = useState<OwnershipCostInput>({
    purchasePrice: defaultPrice,
    deposit: 190_000,
    interestRate: 6.2,
    loanTermYears: 30,
    repaymentType: "principal_interest",
    strataPerQuarter: 1800,
    councilRatesPerQuarter: 600,
    waterPerQuarter: 200,
    insurancePerYear: 1800,
    maintenancePerYear: 3000,
    monthlyComfortPayment: 5500,
  });

  const output = useMemo(() => calculateOwnershipCost(input), [input]);

  const affordColor = {
    comfortable: "low" as const,
    stretch: "medium" as const,
    danger: "high" as const,
    unknown: "default" as const,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="h-4 w-4" />
          True ownership cost
        </CardTitle>
        <p className="text-sm text-stone-500">
          Estimates only — confirm with broker, lender and insurer.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-stone-600">Purchase price</span>
            <input
              type="range"
              min={400000}
              max={2500000}
              step={10000}
              value={input.purchasePrice}
              onChange={(e) =>
                setInput({ ...input, purchasePrice: Number(e.target.value) })
              }
              className="w-full"
            />
            <span className="font-medium tabular-nums">
              ${input.purchasePrice.toLocaleString()}
            </span>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-stone-600">Interest rate %</span>
            <input
              type="range"
              min={4}
              max={10}
              step={0.1}
              value={input.interestRate}
              onChange={(e) =>
                setInput({ ...input, interestRate: Number(e.target.value) })
              }
              className="w-full"
            />
            <span className="font-medium">{input.interestRate}%</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Monthly repayment", value: `$${output.monthlyRepayment.toLocaleString()}` },
            { label: "Monthly total", value: `$${output.monthlyOwnershipCost.toLocaleString()}` },
            { label: "Annual cost", value: `$${output.annualOwnershipCost.toLocaleString()}` },
            { label: "5-year holding", value: `$${output.fiveYearHoldingCost.toLocaleString()}` },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-center"
            >
              <p className="text-[11px] uppercase text-stone-400">{m.label}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-stone-900">
                {m.value}
              </p>
            </div>
          ))}
        </div>

        {output.affordability !== "unknown" && (
          <Badge variant={affordColor[output.affordability]}>
            {output.affordability === "comfortable"
              ? "Within comfort zone"
              : output.affordability === "stretch"
                ? "Stretch budget"
                : "Above comfort payment"}
          </Badge>
        )}

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-stone-400">
            Stress test (+rate)
          </p>
          <div className="flex flex-wrap gap-2">
            {output.stressTests.map((s) => (
              <span
                key={s.rateIncrease}
                className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600"
              >
                +{s.rateIncrease}% → ${s.monthlyRepayment.toLocaleString()}/mo
              </span>
            ))}
          </div>
        </div>
        <p className="mt-4 text-xs text-on-surface-variant">
          Educational estimates only. Not financial, tax, credit or investment advice.
          Confirm affordability with a licensed broker or financial adviser.
        </p>
      </CardContent>
    </Card>
  );
}
