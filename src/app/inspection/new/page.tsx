"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardCheck, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  ALL_ROOMS,
  getDefaultRoomsForType,
  PROPERTY_TYPE_LABELS,
  ROOM_LABELS,
} from "@/lib/inspection/checklists";
import type { PropertyType, RoomType } from "@/lib/inspection/schemas";
import { useInspectionStore } from "@/stores/inspection-store";
import { cn } from "@/lib/utils";

const PROPERTY_TYPES: PropertyType[] = [
  "apartment",
  "townhouse",
  "freestanding_house",
];

export default function NewInspectionPage() {
  const router = useRouter();
  const createInspection = useInspectionStore((s) => s.createInspection);

  const [step, setStep] = useState<1 | 2>(1);
  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [selectedRooms, setSelectedRooms] = useState<RoomType[]>(
    getDefaultRoomsForType("apartment"),
  );

  function toggleRoom(room: RoomType) {
    setSelectedRooms((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room],
    );
  }

  function handleTypeChange(type: PropertyType) {
    setPropertyType(type);
    setSelectedRooms(getDefaultRoomsForType(type));
  }

  function startInspection() {
    if (!selectedRooms.length) return;
    const inspection = createInspection(address.trim(), propertyType, selectedRooms);
    router.push(`/inspection/${inspection.id}`);
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
          <ClipboardCheck className="h-5 w-5 text-stone-500" />
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            Inspection Copilot
          </h1>
        </div>
        <p className="text-sm leading-relaxed text-stone-500">
          Capture notes and photos during your Saturday inspection. Built for
          mobile — works offline on this device.
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              step >= s ? "bg-stone-800" : "bg-stone-200",
            )}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-5">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">
                  Property address (optional)
                </span>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 12 Example St, Newtown NSW"
                  className="h-12"
                />
              </label>

              <div className="space-y-2">
                <span className="text-sm font-medium text-stone-700">
                  Property type
                </span>
                <div className="grid gap-2">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTypeChange(type)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-all",
                        propertyType === type
                          ? "border-stone-800 bg-stone-900 text-white"
                          : "border-stone-200 bg-white text-stone-700 hover:border-stone-300",
                      )}
                    >
                      <Home className="h-4 w-4 shrink-0" />
                      {PROPERTY_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" size="lg" onClick={() => setStep(2)}>
            Choose rooms
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-3 p-5">
              <p className="text-sm font-medium text-stone-700">
                Rooms to inspect
              </p>
              <p className="text-xs text-stone-500">
                Tap to toggle. Checklist items are tailored to your property
                type.
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_ROOMS.map((room) => {
                  const selected = selectedRooms.includes(room);
                  const available =
                    propertyType === "apartment" ||
                    (propertyType === "townhouse" && room !== "common_areas") ||
                    (propertyType === "freestanding_house" &&
                      !["common_areas", "balcony"].includes(room));

                  if (!available) return null;

                  return (
                    <button
                      key={room}
                      type="button"
                      onClick={() => toggleRoom(room)}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition-all",
                        selected
                          ? "bg-stone-900 text-white"
                          : "bg-stone-100 text-stone-600 ring-1 ring-stone-200",
                      )}
                    >
                      {ROOM_LABELS[room]}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={!selectedRooms.length}
              onClick={startInspection}
            >
              Start inspection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
