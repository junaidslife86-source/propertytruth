"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import type { InspectionPhoto } from "@/lib/inspection/schemas";

interface PhotoUploadProps {
  photos: InspectionPhoto[];
  inspectionId: string;
  itemId: string;
  onAdd: (photo: { localPreviewUrl: string; storagePath?: string; caption: string }) => void;
  onRemove: (photoId: string) => void;
}

export function PhotoUpload({
  photos,
  inspectionId,
  itemId,
  onAdd,
  onRemove,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    const localPreviewUrl = URL.createObjectURL(file);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("itemId", itemId);

      const res = await fetch(`/api/inspections/${inspectionId}/photos`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onAdd({
          localPreviewUrl,
          storagePath: data.photo?.storage_path,
          caption: "",
        });
      } else {
        onAdd({ localPreviewUrl, caption: "" });
      }
    } catch {
      onAdd({ localPreviewUrl, caption: "" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative h-16 w-16 overflow-hidden rounded-xl border border-stone-200"
          >
            {photo.localPreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo.localPreviewUrl}
                alt="Inspection"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-stone-100 text-[10px] text-stone-400">
                Photo
              </div>
            )}
            <button
              type="button"
              onClick={() => onRemove(photo.id)}
              className="absolute right-0.5 top-0.5 rounded-full bg-stone-900/70 p-0.5 text-white"
              aria-label="Remove photo"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-stone-300 bg-stone-50 text-stone-500 transition-colors hover:border-stone-400 hover:bg-stone-100"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Camera className="h-4 w-4" />
              <span className="text-[10px]">Add</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      <p className="flex items-center gap-1 text-[11px] text-stone-400">
        <ImagePlus className="h-3 w-3" />
        Photos save on this device. Firebase Storage upload when configured.
      </p>
    </div>
  );
}
