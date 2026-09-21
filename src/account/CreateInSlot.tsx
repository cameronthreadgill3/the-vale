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
        className="vale-gate-stage flex h-full w-full items-center justify-center overflow-auto p-4 sm:p-8"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="vale-text-screen w-full max-w-md p-5">
          <div className="vale-screen-kicker">Slot {slotIndex + 1}</div>
          <h2 className="vale-screen-title vale-screen-title-lg mt-1">
            New character
          </h2>
          <label className="vale-gate-label mt-4">
            Character name
            <input
              className="vale-gate-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={32}
              placeholder="Walker name"
              autoFocus
            />
          </label>
          <div className="vale-screen-actions">
            <button
              type="button"
              onClick={onCancel}
              className="vale-ghost-btn px-3 py-2 text-xs text-[#a8b09a]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!name.trim()}
              onClick={() => setReadyForClass(true)}
              className="vale-tap vale-ghost-btn vale-ghost-btn-accent flex-1 px-3 py-2 text-sm disabled:opacity-40"
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
        className="vale-ghost-btn absolute left-4 top-4 z-20 px-3 py-1.5 text-xs text-[#a8b09a]"
      >
        ← Name
      </button>
      <ClassSelectOverlay onPick={(id) => onConfirm(id, name.trim())} />
    </div>
  );
}
