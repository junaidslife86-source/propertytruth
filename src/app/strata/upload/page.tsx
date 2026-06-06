"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { STRATA_DISCLAIMER } from "@/lib/strata/schemas";
import { DEMO_STRATA_ID } from "@/lib/strata/demo";
import { toast } from "sonner";

export default function StrataUploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function uploadFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const sessionId =
      localStorage.getItem("strata-session") ?? crypto.randomUUID();
    localStorage.setItem("strata-session", sessionId);

    try {
      const res = await fetch("/api/strata/upload", {
        method: "POST",
        headers: { "x-strata-session": sessionId },
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

      toast.success("Upload received — analysis running");
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
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-lg px-4 py-6 pb-24">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>

      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-stone-500" />
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            Strata report analysis
          </h1>
        </div>
        <p className="text-sm leading-relaxed text-stone-500">
          Upload strata minutes, financials, or inspection reports. Digital PDFs
          are read directly; scanned PDFs use Google Document AI OCR. Large bundles
          are analysed section-by-section in the background.
        </p>
      </div>

      <Card
        className={`border-dashed transition-colors ${dragOver ? "border-stone-400 bg-stone-50" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center">
          <div className="rounded-2xl bg-stone-100 p-4">
            <Upload className="h-8 w-8 text-stone-400" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-stone-900">
              Drop your strata PDF here
            </p>
            <p className="text-sm text-stone-500">Max 50 MB · PDF only</p>
          </div>
          <Button
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            size="lg"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analysing…
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

      <div className="mt-6 space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(`/strata/${DEMO_STRATA_ID}`)}
        >
          Try demo strata report
        </Button>

        <p className="text-xs leading-relaxed text-stone-400">
          {STRATA_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
