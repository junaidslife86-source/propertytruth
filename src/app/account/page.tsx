"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import {
  DEALBREAKER_LABELS,
  useBuyerProfileStore,
  type Dealbreaker,
} from "@/stores/buyer-profile-store";
import type { UserPreferences } from "@/lib/auth/user-schema";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DEALBREAKERS = Object.keys(DEALBREAKER_LABELS) as Dealbreaker[];

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") ?? "profile";
  const { user, profile, loading, configured, updateUser, signOut } = useAuth();
  const localBuyer = useBuyerProfileStore((s) => s.profile);

  const [tab, setTab] = useState(initialTab);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [budgetMax, setBudgetMax] = useState("");
  const [comfort, setComfort] = useState("");
  const [dealbreakers, setDealbreakers] = useState<Dealbreaker[]>([]);
  const [riskAppetite, setRiskAppetite] = useState<
    "cautious" | "balanced" | "adventurous"
  >("cautious");
  const [firstHomeBuyer, setFirstHomeBuyer] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && configured && !user) {
      router.replace("/login?next=/account");
    }
  }, [loading, configured, user, router]);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName);
    setPhone(profile.phone ?? "");
    setPreferences(profile.preferences);
    setBudgetMax(profile.buyerProfile.budgetMax?.toString() ?? "");
    setComfort(profile.buyerProfile.monthlyComfortPayment?.toString() ?? "");
    setDealbreakers(profile.buyerProfile.dealbreakers);
    setRiskAppetite(profile.buyerProfile.riskAppetite);
    setFirstHomeBuyer(profile.buyerProfile.firstHomeBuyer);
  }, [profile]);

  if (loading || !user) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-on-surface-variant" />
      </div>
    );
  }

  const avatarName = profile?.displayName || user.displayName || user.email || "U";

  async function saveProfile() {
    setSaving(true);
    try {
      await updateUser({
        displayName: displayName.trim(),
        phone: phone.trim() || null,
      });
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function savePreferences() {
    if (!preferences) return;
    setSaving(true);
    try {
      await updateUser({ preferences });
      toast.success("Preferences saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveBuyerProfile() {
    setSaving(true);
    try {
      await updateUser({
        buyerProfile: {
          budgetMax: budgetMax ? Number(budgetMax) : undefined,
          monthlyComfortPayment: comfort ? Number(comfort) : undefined,
          dealbreakers,
          riskAppetite,
          firstHomeBuyer,
          completedOnboarding: true,
        },
        onboardingCompleted: true,
      });
      toast.success("Buyer profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function toggleDealbreaker(d: Dealbreaker) {
    setDealbreakers((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile?.photoURL ?? user.photoURL ?? undefined} alt="" />
          <AvatarFallback className="text-lg">
            {avatarName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-[family-name:var(--font-manrope)] text-2xl font-bold">
            {avatarName}
          </h1>
          <p className="text-sm text-on-surface-variant">{user.email}</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="buyer">Buyer profile</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email ?? ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+61 …"
                />
              </div>
              <Button
                className="bg-secondary"
                disabled={saving}
                onClick={() => void saveProfile()}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          {preferences && (
            <Card>
              <CardContent className="space-y-6 p-6">
                <label className="flex items-center justify-between gap-4">
                  <span className="text-sm">Email notifications</span>
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        emailNotifications: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-outline-variant"
                  />
                </label>
                <label className="flex items-center justify-between gap-4">
                  <span className="text-sm">Product updates</span>
                  <input
                    type="checkbox"
                    checked={preferences.productUpdates}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        productUpdates: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-outline-variant"
                  />
                </label>
                <div className="space-y-2">
                  <Label>Default scan radius (metres)</Label>
                  <Input
                    type="number"
                    min={100}
                    max={5000}
                    step={100}
                    value={preferences.defaultScanRadiusMeters}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        defaultScanRadiusMeters: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default strata document retention</Label>
                  <select
                    value={preferences.defaultStrataRetention}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        defaultStrataRetention: e.target.value as UserPreferences["defaultStrataRetention"],
                      })
                    }
                    className="w-full rounded-lg border border-outline-variant/40 bg-white px-3 py-2 text-sm"
                  >
                    <option value="7d">7 days</option>
                    <option value="30d">30 days</option>
                    <option value="keep">Keep in my account</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Risk highlights</Label>
                  <select
                    value={preferences.riskHighlightLevel}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        riskHighlightLevel: e.target.value as UserPreferences["riskHighlightLevel"],
                      })
                    }
                    className="w-full rounded-lg border border-outline-variant/40 bg-white px-3 py-2 text-sm"
                  >
                    <option value="all">All signals</option>
                    <option value="medium_and_high">Medium &amp; high only</option>
                  </select>
                </div>
                <Button
                  className="bg-secondary"
                  disabled={saving}
                  onClick={() => void savePreferences()}
                >
                  Save preferences
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="buyer">
          <Card>
            <CardContent className="space-y-6 p-6">
              <p className="text-sm text-on-surface-variant">
                Used to personalise risk highlights and affordability checks.
                {localBuyer.completedOnboarding ? " Synced from your account." : ""}
              </p>
              <div className="space-y-2">
                <Label>Max purchase budget (AUD)</Label>
                <Input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Comfortable monthly repayment (AUD)</Label>
                <Input
                  type="number"
                  value={comfort}
                  onChange={(e) => setComfort(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Risk appetite</Label>
                <div className="flex flex-wrap gap-2">
                  {(["cautious", "balanced", "adventurous"] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setRiskAppetite(level)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm capitalize transition-colors",
                        riskAppetite === level
                          ? "border-secondary bg-secondary/10 text-secondary"
                          : "border-outline-variant/40 hover:bg-surface-container-low",
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={firstHomeBuyer}
                  onChange={(e) => setFirstHomeBuyer(e.target.checked)}
                />
                First home buyer
              </label>
              <div className="space-y-2">
                <Label>Dealbreakers</Label>
                <div className="flex flex-wrap gap-2">
                  {DEALBREAKERS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDealbreaker(d)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs transition-colors",
                        dealbreakers.includes(d)
                          ? "border-evidence-issue bg-evidence-issue/10 text-evidence-issue"
                          : "border-outline-variant/40 hover:bg-surface-container-low",
                      )}
                    >
                      {DEALBREAKER_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                className="bg-secondary"
                disabled={saving}
                onClick={() => void saveBuyerProfile()}
              >
                Save buyer profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Sign out</p>
            <p className="text-sm text-on-surface-variant">
              End your session on this device.
            </p>
          </div>
          <Button variant="outline" onClick={() => void signOut()}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-5 py-8 pb-24">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>

      <Suspense fallback={<Loader2 className="mx-auto h-8 w-8 animate-spin" />}>
        <AccountContent />
      </Suspense>
    </div>
  );
}
