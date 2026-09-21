import { getClass, type ClassId } from "@/game/classes";
import type { ValeCharacter } from "@/game/character";
import type { QuestLog } from "@/game/quests";
import { levelFromXp } from "@/game/xp";
import { slotCharacterKey } from "@/account/storageScope";
import {
  SLOT_COUNT,
  type CharacterSlot,
  type FilledCharacterSlot,
  type SlotArray,
} from "@/account/types";

export const SLOTS_METADATA_KEY = "valeCharacterSlots";
export const DEMO_SLOTS_PREFIX = "vale-demo-slots:";

export function emptySlots(): SlotArray {
  return [null, null, null, null];
}

export function normalizeSlots(raw: unknown): SlotArray {
  const out = emptySlots();
  if (!Array.isArray(raw)) return out;
  for (let i = 0; i < SLOT_COUNT; i++) {
    out[i] = sanitizeSlot(raw[i]);
  }
  return out;
}

function isClassId(v: unknown): v is ClassId {
  return (
    typeof v === "string" &&
    ["warden", "thornblade", "pathfinder", "hearthmage", "verdant", "hollowborn"].includes(
      v,
    )
  );
}

function sanitizeSlot(raw: unknown): CharacterSlot {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (!isClassId(o.classId)) return null;
  if (typeof o.id !== "string" || !o.id) return null;
  if (typeof o.name !== "string" || !o.name.trim()) return null;
  if (!o.save || typeof o.save !== "object") return null;
  const save = o.save as ValeCharacter;
  if (!isClassId(save.classId)) return null;
  // Level follows the embedded run. A stored level field goes stale when
  // combat XP is written to the live slot key and the snapshot is not refreshed.
  const hasXp = typeof save.combatXp === "number" && Number.isFinite(save.combatXp);
  const level = hasXp
    ? levelFromXp(Math.max(0, Math.floor(save.combatXp)))
    : typeof o.level === "number" && Number.isFinite(o.level)
      ? Math.max(1, Math.floor(o.level))
      : 1;
  return {
    id: o.id,
    name: o.name.trim().slice(0, 32),
    classId: o.classId,
    level,
    updatedAt:
      typeof o.updatedAt === "string" ? o.updatedAt : new Date().toISOString(),
    save,
    quests:
      o.quests && typeof o.quests === "object"
        ? (o.quests as QuestLog)
        : undefined,
  };
}

export function buildFilledSlot(
  name: string,
  save: ValeCharacter,
  quests?: QuestLog,
  existingId?: string,
): FilledCharacterSlot {
  const cls = getClass(save.classId);
  return {
    id: existingId ?? `slot-${save.classId}-${Date.now().toString(36)}`,
    name: (name.trim() || cls.name).slice(0, 32),
    classId: save.classId,
    level: levelFromXp(save.combatXp ?? 0),
    updatedAt: new Date().toISOString(),
    save,
    quests: quests ?? {},
  };
}

function finiteCombatXp(xp: unknown): number | null {
  if (typeof xp !== "number" || !Number.isFinite(xp)) return null;
  return Math.max(0, Math.floor(xp));
}

/** Live run for this browser, if it is the same class as the slot snapshot. */
export function readLiveSlotSave(
  userId: string,
  slotIndex: number,
  classId: ClassId,
): ValeCharacter | null {
  try {
    const raw = localStorage.getItem(slotCharacterKey(userId, slotIndex));
    if (!raw) return null;
    const data = JSON.parse(raw) as ValeCharacter;
    if (!data || data.classId !== classId) return null;
    if (finiteCombatXp(data.combatXp) == null) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Level shown on the character page. Prefer the live slot key — that is the
 * run Play resumes — and fall back to the snapshot's combat XP.
 */
export function slotShownLevel(
  userId: string,
  slotIndex: number,
  slot: FilledCharacterSlot,
): number {
  const liveXp = finiteCombatXp(
    readLiveSlotSave(userId, slotIndex, slot.classId)?.combatXp,
  );
  if (liveXp != null) return levelFromXp(liveXp);
  return levelFromXp(finiteCombatXp(slot.save?.combatXp) ?? 0);
}

/**
 * Copy a live run into slot metadata when it has more combat XP than the
 * snapshot. Does not lower a snapshot that is ahead of this browser.
 */
export function syncSlotsFromLiveRun(userId: string, slots: SlotArray): SlotArray {
  let changed = false;
  const next = slots.map((slot, i) => {
    if (!slot) return slot;
    const saveXp = finiteCombatXp(slot.save?.combatXp) ?? 0;
    const live = readLiveSlotSave(userId, i, slot.classId);
    const liveXp = live ? finiteCombatXp(live.combatXp) : null;
    if (live && liveXp != null && liveXp > saveXp) {
      changed = true;
      return {
        ...slot,
        level: levelFromXp(liveXp),
        save: live,
        updatedAt: new Date().toISOString(),
      };
    }
    const level = levelFromXp(saveXp);
    if (slot.level !== level) {
      changed = true;
      return { ...slot, level };
    }
    return slot;
  }) as SlotArray;
  return changed ? next : slots;
}

export function loadDemoSlots(userId: string): SlotArray {
  try {
    const raw = localStorage.getItem(DEMO_SLOTS_PREFIX + userId);
    if (!raw) return emptySlots();
    return normalizeSlots(JSON.parse(raw));
  } catch {
    return emptySlots();
  }
}

export function saveDemoSlots(userId: string, slots: SlotArray): void {
  localStorage.setItem(DEMO_SLOTS_PREFIX + userId, JSON.stringify(slots));
}

/** Optional: migrate guest local save into first empty slot. */
export function migrateGuestIntoSlots(
  slots: SlotArray,
  guest: ValeCharacter | null,
  guestQuests?: QuestLog,
): { slots: SlotArray; migrated: boolean } {
  if (!guest) return { slots, migrated: false };
  const emptyIdx = slots.findIndex((s) => s === null);
  if (emptyIdx < 0) return { slots, migrated: false };
  const next = [...slots] as SlotArray;
  const cls = getClass(guest.classId);
  next[emptyIdx] = buildFilledSlot(cls.name, guest, guestQuests);
  return { slots: next, migrated: true };
}
