"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadConsentPanel } from "@/components/compliance/upload-consent-panel";
import { ContextualDisclaimer } from "@/components/compliance/contextual-disclaimer";
import { FINDINGS_DISCLAIMER, NO_TRAINING_STATEMENT } from "@/lib/compliance/copy";
import { strataRequestHeaders } from "@/lib/auth/api-headers";
import { getStrataSessionId } from "@/lib/auth/client-session";
import { useAuth } from "@/providers/auth-provider";
import { STRATA_DISCLAIMER } from "@/lib/strata/schemas";
import { DEMO_STRATA_ID } from "@/lib/strata/demo";
import { toast } from "sonner";

export default function StrataUploadPage() {
  const router = useRouter();
  const [propertyCaseId, setPropertyCaseId] = useState<string | null>(null);
  const { profile, user, loading: authLoading } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPropertyCaseId(params.get("caseId"));
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/strata/upload");
    }
  }, [authLoading, user, router]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [retentionPolicy, setRetentionPolicy] = useState<"7d" | "30d" | "keep">(
    profile?.preferences.defaultStrataRetention ?? "30d",
  );

  async function uploadFile(file: File) {
    if (!consentConfirmed) {
      toast.error("Please confirm the upload notice first");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("retentionPolicy", retentionPolicy);
    if (propertyCaseId) {
      formData.append("propertyCaseId", propertyCaseId);
    }
    getStrataSessionId();

    try {
      const res = await fetch("/api/strata/upload", {
        method: "POST",
        headers: await strataRequestHeaders(),
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === "OFFLINE") {
          toast.message("Firebase not configured", {
            description: "Try the demo report instead.",
          });
          return;
        }
        throw new Error(data.error ?? "Upload failed");
      }

      toast.success("Upload received — scan running");
      router.push(`/strata/${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void uploadFile(file);
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-lg px-5 py-6 pb-24">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>

      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-secondary" />
          <h1 className="font-[family-name:var(--font-manrope)] text-2xl font-bold tracking-tight">
            Strata red flag scan
          </h1>
        </div>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          AI-assisted document scan for evidence-backed red flags and questions
          for your conveyancer or strata inspector.
        </p>
      </div>

      {!consentConfirmed ? (
        <UploadConsentPanel onConfirm={() => setConsentConfirmed(true)} />
      ) : (
        <>
          <div className="mb-4">
            <label className="font-label-caps text-on-surface-variant">
              Retention
            </label>
            <select
              value={retentionPolicy}
              onChange={(e) =>
                setRetentionPolicy(e.target.value as "7d" | "30d" | "keep")
              }
              className="mt-2 w-full rounded-lg border border-outline-variant/40 bg-white px-3 py-2 text-sm"
            >
              <option value="7d">Delete after 7 days</option>
              <option value="30d">Delete after 30 days (default)</option>
              <option value="keep">Keep in my session</option>
            </select>
          </div>

          <Card
            className={`border-dashed transition-colors ${dragOver ? "border-secondary bg-surface-container-low" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center">
              <div className="rounded-2xl bg-surface-container-low p-4">
                <Upload className="h-8 w-8 text-evidence-missing" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Drop your strata PDF here</p>
                <p className="text-sm text-on-surface-variant">
                  Max 50 MB · PDF only
                </p>
              </div>
              <Button
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                size="lg"
                className="bg-secondary text-white hover:bg-secondary/90"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  "Choose file"
                )}
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadFile(file);
                  e.target.value = "";
                }}
              />
            </CardContent>
          </Card>
        </>
      )}

      <div className="mt-6 space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(`/strata/${DEMO_STRATA_ID}`)}
        >
          Try demo strata report
        </Button>

        <ContextualDisclaimer>{STRATA_DISCLAIMER}</ContextualDisclaimer>
        <ContextualDisclaimer>{FINDINGS_DISCLAIMER}</ContextualDisclaimer>
        <ContextualDisclaimer>{NO_TRAINING_STATEMENT}</ContextualDisclaimer>
      </div>
    </div>
  );
}
