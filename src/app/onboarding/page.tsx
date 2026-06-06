"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DEALBREAKER_LABELS,
  useBuyerProfileStore,
  type Dealbreaker,
} from "@/stores/buyer-profile-store";
import { cn } from "@/lib/utils";

const DEALBREAKERS = Object.keys(DEALBREAKER_LABELS) as Dealbreaker[];

export default function OnboardingPage() {
  const router = useRouter();
  const profile = useBuyerProfileStore((s) => s.profile);
  const updateProfile = useBuyerProfileStore((s) => s.updateProfile);

  const [budgetMax, setBudgetMax] = useState(
    profile.budgetMax?.toString() ?? "",
  );
  const [comfort, setComfort] = useState(
    profile.monthlyComfortPayment?.toString() ?? "",
  );
  const [dealbreakers, setDealbreakers] = useState<Dealbreaker[]>(
    profile.dealbreakers,
  );
  const [riskAppetite, setRiskAppetite] = useState(profile.riskAppetite);

  function toggleDealbreaker(d: Dealbreaker) {
    setDealbreakers((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  }

  function handleComplete() {
    updateProfile({
      budgetMax: budgetMax ? Number(budgetMax) : undefined,
      monthlyComfortPayment: comfort ? Number(comfort) : undefined,
      dealbreakers,
      riskAppetite,
      completedOnboarding: true,
    });
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-10 pb-24">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Skip for now
      </Link>

      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 text-white">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Your buyer profile
        </h1>
        <p className="text-sm text-stone-500">
          Personalise risk highlights and affordability checks. You can change
          this anytime.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">
              Max purchase budget (AUD)
            </label>
            <Input
              type="number"
              placeholder="e.g. 950000"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">
              Comfortable monthly repayment (AUD)
            </label>
            <Input
              type="number"
              placeholder="e.g. 4500"
              value={comfort}
              onChange={(e) => setComfort(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">
              Risk appetite
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["cautious", "balanced", "adventurous"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRiskAppetite(r)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm capitalize",
                    riskAppetite === r
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 text-stone-600",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-stone-700">
              Dealbreakers
            </label>
            <div className="flex flex-wrap gap-2">
              {DEALBREAKERS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDealbreaker(d)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm transition-colors",
                    dealbreakers.includes(d)
                      ? "bg-red-100 text-red-800 ring-1 ring-red-200"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200",
                  )}
                >
                  {DEALBREAKER_LABELS[d]}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={handleComplete}>
        Save & start scanning
      </Button>
    </div>
  );
}
