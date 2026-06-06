"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DOCUMENT_TYPE_LABELS,
  REQUIRED_DOCS_HOUSE,
  useDocumentVaultStore,
  type DocumentType,
} from "@/stores/document-vault-store";
import { cn } from "@/lib/utils";

const ALL_TYPES: DocumentType[] = [
  "contract",
  "strata_report",
  "building_report",
  "pest_report",
  "section_10_7",
  "insurance_quote",
  "other",
];

export default function DocumentVaultPage() {
  const params = useParams();
  const propertyId = decodeURIComponent(params.id as string);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingType, setPendingType] = useState<DocumentType | null>(null);
  const [address, setAddress] = useState("Property");

  const documents = useDocumentVaultStore((s) => s.documents);
  const addDocument = useDocumentVaultStore((s) => s.addDocument);
  const removeDocument = useDocumentVaultStore((s) => s.removeDocument);

  useEffect(() => {
    const cached = sessionStorage.getItem(`scan:${propertyId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as { formattedAddress?: string };
        if (parsed.formattedAddress) setAddress(parsed.formattedAddress);
      } catch {
        /* ignore */
      }
    }
  }, [propertyId]);

  const propertyDocs = useMemo(
    () => documents.filter((d) => d.propertyId === propertyId),
    [documents, propertyId],
  );

  const missingRequired = REQUIRED_DOCS_HOUSE.filter(
    (t) => !propertyDocs.some((d) => d.documentType === t),
  );

  function handleUploadClick(type: DocumentType) {
    setPendingType(type);
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !pendingType) return;

    addDocument({
      propertyId,
      documentType: pendingType,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
    });

    setPendingType(null);
    e.target.value = "";
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 pb-24">
      <Link
        href={`/property/${encodeURIComponent(propertyId)}`}
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to report
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Document vault
        </h1>
        <p className="text-sm text-stone-500">{address}</p>
        <p className="text-sm text-stone-500">
          Upload contracts, strata reports and inspection PDFs. Files stay in
          your browser until Firebase Storage is configured.
        </p>
      </div>

      {missingRequired.length > 0 && (
        <Card className="border-amber-200/80 bg-amber-50/50">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium text-amber-900">Missing documents</p>
              <ul className="mt-1 list-inside list-disc text-sm text-amber-800">
                {missingRequired.map((t) => (
                  <li key={t}>{DOCUMENT_TYPE_LABELS[t]}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {ALL_TYPES.map((type) => {
          const uploaded = propertyDocs.filter((d) => d.documentType === type);
          const hasFile = uploaded.length > 0;

          return (
            <button
              key={type}
              type="button"
              onClick={() => handleUploadClick(type)}
              className={cn(
                "flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition-colors hover:bg-stone-50",
                hasFile
                  ? "border-emerald-200 bg-emerald-50/30"
                  : "border-stone-200 bg-white",
              )}
            >
              <div className="flex w-full items-center justify-between">
                <FileText className="h-5 w-5 text-stone-500" />
                {hasFile ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Upload className="h-5 w-5 text-stone-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-stone-900">
                  {DOCUMENT_TYPE_LABELS[type]}
                </p>
                <p className="text-xs text-stone-500">
                  {hasFile
                    ? `${uploaded.length} file${uploaded.length > 1 ? "s" : ""}`
                    : "Tap to upload"}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {propertyDocs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-stone-900">Uploaded files</h2>
          <ul className="space-y-2">
            {propertyDocs.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-stone-900">
                    {doc.fileName}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge variant="default">
                      {DOCUMENT_TYPE_LABELS[doc.documentType]}
                    </Badge>
                    <Badge variant="low">{doc.status}</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(doc.id)}
                  aria-label="Remove document"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/strata/upload">Analyse strata report with AI</Link>
          </Button>
        </section>
      )}

      <p className="text-xs text-stone-400">
        Scanned PDFs are read with Google Document AI OCR. AI analysis uses Gemini.
        when configured.
      </p>
    </div>
  );
}
