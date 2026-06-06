"use client";

import type { RoomType } from "@/lib/inspection/schemas";
import { ROOM_LABELS } from "@/lib/inspection/checklists";
import { cn } from "@/lib/utils";

interface RoomTabsProps {
  rooms: RoomType[];
  activeRoom: RoomType;
  onChange: (room: RoomType) => void;
  getProgress: (room: RoomType) => { checked: number; total: number };
}

export function RoomTabs({
  rooms,
  activeRoom,
  onChange,
  getProgress,
}: RoomTabsProps) {
  return (
    <div className="sticky top-16 z-20 -mx-4 border-b border-stone-200/80 bg-[#faf9f7]/95 px-4 py-3 backdrop-blur-md">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {rooms.map((room) => {
          const { checked, total } = getProgress(room);
          const done = total > 0 && checked === total;

          return (
            <button
              key={room}
              type="button"
              onClick={() => onChange(room)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
                activeRoom === room
                  ? "bg-stone-900 text-white shadow-sm"
                  : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50",
              )}
            >
              {ROOM_LABELS[room]}
              {total > 0 && (
                <span
                  className={cn(
                    "ml-1.5 text-xs",
                    activeRoom === room ? "text-stone-300" : "text-stone-400",
                  )}
                >
                  {done ? "✓" : `${checked}/${total}`}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
