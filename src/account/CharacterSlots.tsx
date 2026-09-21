import type { CSSProperties } from "react";
import { getClass } from "@/game/classes";
import { slotShownLevel } from "@/account/slots";
import type { CharacterSlot, SlotArray, ValeAccountUser } from "@/account/types";
import { SLOT_COUNT } from "@/account/types";

export function CharacterSlots({
  user,
  slots,
  onCreate,
  onPlay,
  onDelete,
  onSignOut,
  onImportGuest,
  guestAvailable,
  signOutLabel = "Sign out",
}: {
  user: ValeAccountUser;
  slots: SlotArray;
  onCreate: (slotIndex: number) => void;
  onPlay: (slotIndex: number) => void;
  onDelete: (slotIndex: number) => void;
  onSignOut: () => void;
  onImportGuest?: () => void;
  guestAvailable?: boolean;
  signOutLabel?: string;
}) {
  return (
    <div
      className="vale-gate-stage flex h-full w-full items-center justify-center overflow-auto overscroll-contain p-4 sm:p-8"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="w-full max-w-3xl">
        <div className="vale-text-screen px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="vale-screen-kicker">Account</div>
              <h1 className="vale-screen-title vale-screen-title-lg mt-1">
                Character slots
              </h1>
              <p className="vale-screen-hint">
                Signed in as{" "}
                <span className="text-[#f3f0e4]">{user.displayName}</span>
                <span> · {user.email}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="vale-tap-sm vale-ghost-btn px-3 py-2 text-xs text-[#a8b09a]"
            >
              {signOutLabel}
            </button>
          </div>
          {user.demo && (
            <div className="vale-inv-stats mt-3">
              <span className="vale-inv-chip vale-inv-chip-gold">Demo</span>
            </div>
          )}
          <p className="vale-screen-aside">
            Four paths per account. Saves sync to{" "}
            {user.id === "offline"
              ? "local offline storage (this browser)"
              : user.demo
                ? "local demo storage"
                : "Clerk user metadata (compact snapshots — migrate to Postgres for production)"}
            . New characters begin on Thornreach with Teeth in the Grass.
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: SLOT_COUNT }, (_, i) => (
            <SlotCard
              key={i}
              userId={user.id}
              index={i}
              slot={slots[i]}
              onCreate={() => onCreate(i)}
              onPlay={() => onPlay(i)}
              onDelete={() => onDelete(i)}
            />
          ))}
        </div>

        {guestAvailable && onImportGuest && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onImportGuest}
              className="vale-tap vale-ghost-btn px-4 py-2 text-xs text-[#a8b09a]"
            >
              Import offline local save into first empty slot
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SlotCard({
  userId,
  index,
  slot,
  onCreate,
  onPlay,
  onDelete,
}: {
  userId: string;
  index: number;
  slot: CharacterSlot;
  onCreate: () => void;
  onPlay: () => void;
  onDelete: () => void;
}) {
  if (!slot) {
    return (
      <div className="vale-gate-slot-empty flex flex-col justify-between">
        <div>
          <div className="vale-skill-meta">Slot {index + 1}</div>
          <p className="vale-skill-name vale-skill-name-dim mt-2">Empty</p>
        </div>
        <div className="vale-inv-foot">
          <button
            type="button"
            onClick={onCreate}
            className="vale-tap vale-ghost-btn vale-ghost-btn-accent w-full px-3 py-2 text-sm"
          >
            Create
          </button>
        </div>
      </div>
    );
  }

  const cls = getClass(slot.classId);
  const updated = formatUpdated(slot.updatedAt);
  const level = slotShownLevel(userId, index, slot);

  return (
    <div
      className="vale-skill-row vale-map-row-here flex min-h-[9.5rem] flex-col justify-between p-4"
      style={{ "--vale-row-mark": cls.accent } as CSSProperties}
    >
      <div>
        <div className="vale-skill-meta">Slot {index + 1}</div>
        <div className="vale-gate-name">{slot.name}</div>
        <p className="vale-skill-level mt-1" style={{ color: cls.accent }}>
          {cls.name} · Lv {level}
        </p>
        <p className="vale-screen-hint">Updated {updated}</p>
      </div>
      <div className="vale-inv-foot flex gap-2">
        <button
          type="button"
          onClick={onPlay}
          className="vale-tap vale-ghost-btn vale-ghost-btn-accent flex-1 px-3 py-2 text-sm"
        >
          Play
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="vale-tap-sm vale-ghost-btn vale-gate-danger px-3 py-2 text-xs text-[#a8b09a]"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function formatUpdated(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
