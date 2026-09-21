import { useState } from "react";
import { ClassSelectOverlay } from "@/game/ui/ClassSelectOverlay";
import type { ClassId } from "@/game/classes";

export function CreateInSlot({
  slotIndex,
  onCancel,
  onConfirm,
}: {
  slotIndex: number;
  onCancel: () => void;
  onConfirm: (classId: ClassId, name: string) => void;
}) {
  const [name, setName] = useState("");
  const [readyForClass, setReadyForClass] = useState(false);

  if (!readyForClass) {
    return (
      <div
        className="flex h-full w-full items-center justify-center overflow-auto bg-[#0c0d0b] p-4 sm:p-8"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="w-full max-w-md rounded border border-[#2a2e24] bg-[#161812] p-5">
          <h2 className="font-display text-xl tracking-wide text-[#c9a227]">
            New character · Slot {slotIndex + 1}
          </h2>
          <label className="mt-4 block text-xs text-[#a8b09a]">
            Character name
            <input
              className="mt-1 w-full rounded border border-[#2a2e24] bg-[#0c0d0b] px-3 py-2 text-sm text-[#e8e6d9] outline-none focus:border-[#c9a227]/60"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={32}
              placeholder="Walker name"
              autoFocus
            />
          </label>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded border border-[#2a2e24] px-3 py-2 text-xs text-[#a8b09a]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!name.trim()}
              onClick={() => setReadyForClass(true)}
              className="vale-tap flex-1 rounded border border-[#c9a227]/50 bg-[#1c1f16] px-3 py-2 text-sm text-[#c9a227] disabled:opacity-40"
            >
              Choose path
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <button
        type="button"
        onClick={() => setReadyForClass(false)}
        className="absolute left-4 top-4 z-20 rounded border border-[#2a2e24] bg-[#161812]/90 px-3 py-1.5 text-xs text-[#a8b09a] backdrop-blur-sm"
      >
        ← Name
      </button>
      <ClassSelectOverlay onPick={(id) => onConfirm(id, name.trim())} />
    </div>
  );
}
