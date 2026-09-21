import { getClass, type ClassId } from "@/game/classes";
import type { ValeCharacter } from "@/game/character";
import type { QuestLog } from "@/game/quests";
import { levelFromXp } from "@/game/xp";
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
  const level =
    typeof o.level === "number" && Number.isFinite(o.level)
      ? Math.max(1, Math.floor(o.level))
      : levelFromXp(typeof save.combatXp === "number" ? save.combatXp : 0);
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
