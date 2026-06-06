"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomTabs } from "@/components/inspection/room-tabs";
import { InspectionItemRow } from "@/components/inspection/item-row";
import { InspectionSummaryCard } from "@/components/inspection/summary-card";
import { getInspectionProgress } from "@/lib/inspection/summary";
import type { RoomType } from "@/lib/inspection/schemas";
import { useInspectionStore } from "@/stores/inspection-store";

export default function InspectionSessionPage() {
  const params = useParams();
  const id = params.id as string;

  const hasHydrated = useInspectionStore((s) => s._hasHydrated);
  const setHasHydrated = useInspectionStore((s) => s.setHasHydrated);
  const inspection = useInspectionStore((s) => s.getInspection(id));
  const updateItem = useInspectionStore((s) => s.updateItem);
  const addPhoto = useInspectionStore((s) => s.addPhoto);
  const removePhoto = useInspectionStore((s) => s.removePhoto);
  const completeInspection = useInspectionStore((s) => s.completeInspection);

  const [activeRoom, setActiveRoom] = useState<RoomType | null>(null);
  const [view, setView] = useState<"checklist" | "summary">("checklist");

  useEffect(() => {
    setHasHydrated(true);
  }, [setHasHydrated]);

  useEffect(() => {
    if (inspection && !activeRoom) {
      setActiveRoom(inspection.selectedRooms[0] ?? null);
    }
  }, [inspection, activeRoom]);

  const progress = useMemo(
    () => (inspection ? getInspectionProgress(inspection) : 0),
    [inspection],
  );

  if (!hasHydrated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="h-48 animate-pulse rounded-2xl bg-stone-100" />
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-lg font-medium text-stone-900">Inspection not found</p>
        <p className="mt-2 text-sm text-stone-500">
          It may have been cleared from this device.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/inspection/new">Start a new inspection</Link>
        </Button>
      </div>
    );
  }

  const currentRoom = inspection.rooms.find((r) => r.roomType === activeRoom);
  const summary = inspection.summary;

  function handleComplete() {
    completeInspection(id);
    setView("summary");
  }

  if (view === "summary" && summary) {
    return (
      <div className="mx-auto max-w-lg space-y-6 px-4 py-6 pb-24">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setView("checklist")}
            className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to checklist
          </button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/inspection/new">New inspection</Link>
          </Button>
        </div>
        <InspectionSummaryCard
          summary={summary}
          propertyAddress={inspection.propertyAddress}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg pb-28">
      <div className="px-4 pt-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            href="/inspection/new"
            className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"
          >
            <ArrowLeft className="h-4 w-4" />
            New
          </Link>
          <div className="text-right">
            <p className="text-xs text-stone-400">Progress</p>
            <p className="text-sm font-semibold tabular-nums text-stone-900">
              {progress}%
            </p>
          </div>
        </div>

        {inspection.propertyAddress && (
          <p className="mb-1 text-sm font-medium text-stone-900">
            {inspection.propertyAddress}
          </p>
        )}
        <p className="text-xs text-stone-500">
          Tap each item as you walk through — OK, minor, major, or skip.
        </p>
      </div>

      {activeRoom && (
        <RoomTabs
          rooms={inspection.selectedRooms}
          activeRoom={activeRoom}
          onChange={setActiveRoom}
          getProgress={(room) => {
            const r = inspection.rooms.find((x) => x.roomType === room);
            const total = r?.items.length ?? 0;
            const checked =
              r?.items.filter((i) => i.severity !== "not_checked").length ?? 0;
            return { checked, total };
          }}
        />
      )}

      <div className="space-y-3 px-4 pt-4">
        {currentRoom?.items.length ? (
          currentRoom.items.map((item) => (
            <InspectionItemRow
              key={item.id}
              item={item}
              inspectionId={inspection.id}
              roomType={currentRoom.roomType}
              onSeverityChange={(severity) =>
                updateItem(inspection.id, currentRoom.roomType, item.id, {
                  severity,
                })
              }
              onNotesChange={(notes) =>
                updateItem(inspection.id, currentRoom.roomType, item.id, {
                  notes,
                })
              }
              onPhotoAdd={(photo) =>
                addPhoto(inspection.id, currentRoom.roomType, item.id, photo)
              }
              onPhotoRemove={(photoId) =>
                removePhoto(inspection.id, currentRoom.roomType, item.id, photoId)
              }
            />
          ))
        ) : (
          <p className="py-8 text-center text-sm text-stone-500">
            No checklist items for this room.
          </p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-stone-200/80 bg-[#faf9f7]/95 p-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              if (summary) {
                setView("summary");
              } else {
                handleComplete();
              }
            }}
          >
            <FileText className="h-4 w-4" />
            {summary ? "View summary" : "Finish & summarise"}
          </Button>
        </div>
      </div>
    </div>
  );
}
