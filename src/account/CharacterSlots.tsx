import { getClass } from "@/game/classes";
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
      className="flex h-full w-full items-center justify-center overflow-auto overscroll-contain bg-[#0c0d0b] p-4 sm:p-8"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="w-full max-w-3xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl tracking-wide text-[#c9a227] sm:text-3xl">
              Character slots
            </h1>
            <p className="mt-1 text-sm text-[#a8b09a]">
              Signed in as{" "}
              <span className="text-[#e8e6d9]">{user.displayName}</span>
              <span className="text-[#6a7260]"> · {user.email}</span>
              {user.demo && (
                <span className="ml-2 rounded border border-[#c9a227]/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[#c9a227]">
                  demo
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="rounded border border-[#2a2e24] bg-[#161812] px-3 py-1.5 text-xs text-[#a8b09a] hover:border-[#c9a227]/50 hover:text-[#e8e6d9]"
          >
            {signOutLabel}
          </button>
        </div>

        <p className="mt-3 text-xs text-[#6a7260]">
          Four paths per account. Saves sync to{" "}
          {user.id === "offline"
            ? "local offline storage (this browser)"
            : user.demo
              ? "local demo storage"
              : "Clerk user metadata (compact snapshots — migrate to Postgres for production)"}
          . New characters begin on Thornreach with Teeth in the Grass.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: SLOT_COUNT }, (_, i) => (
            <SlotCard
              key={i}
              index={i}
              slot={slots[i]}
              onCreate={() => onCreate(i)}
              onPlay={() => onPlay(i)}
              onDelete={() => onDelete(i)}
            />
          ))}
        </div>

        {guestAvailable && onImportGuest && (
          <p className="mt-6 text-center">
            <button
              type="button"
              onClick={onImportGuest}
              className="text-xs text-[#6a7260] underline-offset-2 hover:text-[#a8b09a] hover:underline"
            >
              Import offline local save into first empty slot
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

function SlotCard({
  index,
  slot,
  onCreate,
  onPlay,
  onDelete,
}: {
  index: number;
  slot: CharacterSlot;
  onCreate: () => void;
  onPlay: () => void;
  onDelete: () => void;
}) {
  if (!slot) {
    return (
      <div className="flex min-h-[9rem] flex-col justify-between rounded border border-dashed border-[#2a2e24] bg-[#12140f] p-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[#6a7260]">
            Slot {index + 1}
          </div>
          <p className="mt-2 text-sm text-[#a8b09a]">Empty</p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="vale-tap mt-3 rounded border border-[#c9a227]/50 bg-[#1c1f16] px-3 py-2 text-sm text-[#c9a227] hover:border-[#c9a227]"
        >
          Create
        </button>
      </div>
    );
  }

  const cls = getClass(slot.classId);
  const updated = formatUpdated(slot.updatedAt);

  return (
    <div
      className="flex min-h-[9rem] flex-col justify-between rounded border border-[#2a2e24] bg-[#161812] p-4"
      style={{ borderLeftWidth: 4, borderLeftColor: cls.accent }}
    >
      <div>
        <div className="text-[10px] uppercase tracking-wider text-[#6a7260]">
          Slot {index + 1}
        </div>
        <div className="mt-1 font-display text-lg tracking-wide text-[#e8e6d9]">
          {slot.name}
        </div>
        <p className="mt-1 text-sm" style={{ color: cls.accent }}>
          {cls.name} · Lv {slot.level}
        </p>
        <p className="mt-1 text-[10px] text-[#6a7260]">Updated {updated}</p>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onPlay}
          className="vale-tap flex-1 rounded border border-[#c9a227]/50 bg-[#1c1f16] px-3 py-2 text-sm text-[#c9a227] hover:border-[#c9a227]"
        >
          Play
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded border border-[#2a2e24] px-3 py-2 text-xs text-[#a8b09a] hover:border-[#c97a7a]/60 hover:text-[#c97a7a]"
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
