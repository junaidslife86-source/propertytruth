"use client";

import type { InspectionItem } from "@/lib/inspection/schemas";
import { SeverityPills } from "@/components/inspection/severity-pills";
import { PhotoUpload } from "@/components/inspection/photo-upload";

interface InspectionItemRowProps {
  item: InspectionItem;
  inspectionId: string;
  roomType: string;
  onSeverityChange: (severity: InspectionItem["severity"]) => void;
  onNotesChange: (notes: string) => void;
  onPhotoAdd: (photo: {
    localPreviewUrl: string;
    storagePath?: string;
    caption: string;
  }) => void;
  onPhotoRemove: (photoId: string) => void;
}

export function InspectionItemRow({
  item,
  inspectionId,
  roomType,
  onSeverityChange,
  onNotesChange,
  onPhotoAdd,
  onPhotoRemove,
}: InspectionItemRowProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-stone-900">{item.label}</h3>
      </div>

      <SeverityPills value={item.severity} onChange={onSeverityChange} />

      <textarea
        value={item.notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Add a note (optional)"
        rows={2}
        className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-200"
      />

      <PhotoUpload
        photos={item.photos}
        inspectionId={inspectionId}
        itemId={item.id}
        onAdd={onPhotoAdd}
        onRemove={onPhotoRemove}
      />
    </div>
  );
}
