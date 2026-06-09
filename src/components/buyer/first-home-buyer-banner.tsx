"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { useBuyerProfileStore } from "@/stores/buyer-profile-store";

export function FirstHomeBuyerBanner() {
  const profile = useBuyerProfileStore((s) => s.profile);
  const isFirstHome =
    profile.firstHomeBuyer || profile.buyerJourneyType === "first_home";

  if (!isFirstHome) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-secondary/30 bg-secondary-container/30 px-4 py-3 text-sm">
      <Home className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
      <div>
        <p className="font-medium text-foreground">First home buyer mode</p>
        <p className="mt-1 text-on-surface-variant">
          We&apos;ll emphasise affordability, stamp duty reminders, and plain-English
          checks. NSW first home concessions change — confirm eligibility with Revenue
          NSW and your broker.
        </p>
        <Link
          href="/onboarding"
          className="mt-2 inline-block text-sm font-medium text-secondary hover:underline"
        >
          Update buyer profile
        </Link>
      </div>
    </div>
  );
}
