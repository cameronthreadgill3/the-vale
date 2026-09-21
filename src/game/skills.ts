/** Tibia-style skills — independent levels on the same cubic XP curve. */

import {
  levelFromXp,
  progressInLevel,
  totalXpForLevel,
  xpToNext,
} from "@/game/xp";

export type SkillId =
  | "sword"
  | "axe"
  | "club"
  | "distance"
  | "shielding"
  | "fist"
  | "magic";

export interface SkillDef {
  id: SkillId;
  name: string;
  /** Digit shown in the skills list (assignment is 1–3 on the hotbar). */
  hotkey: string;
}

export const SKILLS: SkillDef[] = [
  { id: "sword", name: "Sword", hotkey: "1" },
  { id: "axe", name: "Axe", hotkey: "2" },
  { id: "club", name: "Club", hotkey: "3" },
  { id: "distance", name: "Distance", hotkey: "4" },
  { id: "shielding", name: "Shielding", hotkey: "5" },
  { id: "fist", name: "Fist", hotkey: "6" },
  { id: "magic", name: "Magic", hotkey: "7" },
];

export const SKILL_IDS: SkillId[] = SKILLS.map((s) => s.id);

/** Re-export cubic helpers under skill-friendly names. */
export const skillTotalXpForLevel = totalXpForLevel;
export const skillXpToNext = xpToNext;
export const skillProgressInLevel = progressInLevel;
export const skillLevelFromXp = levelFromXp;

export function emptySkillXp(): Record<SkillId, number> {
  return {
    sword: 0,
    axe: 0,
    club: 0,
    distance: 0,
    shielding: 0,
    fist: 0,
    magic: 0,
  };
}

/** Convert a desired starting level into total skill XP. */
export function xpForStartingLevel(level: number): number {
  return totalXpForLevel(Math.max(1, Math.floor(level)));
}

export function skillSnapshot(xp: number) {
  const level = levelFromXp(xp);
  return {
    xp,
    level,
    progress: progressInLevel(level, xp),
    next: xpToNext(level),
  };
}

export const QUICK_SLOT_COUNT = 3 as const;

/** Three hotbar slots — tap / keys 1–3 to train (cast) that skill. */
export type QuickSlots = [SkillId, SkillId, SkillId];

/** Class-biased default hotbar (favored / starting skills). */
export function defaultQuickSlots(classId: string): QuickSlots {
  switch (classId) {
    case "warden":
      return ["sword", "shielding", "club"];
    case "thornblade":
      return ["axe", "sword", "fist"];
    case "pathfinder":
      return ["distance", "fist", "sword"];
    case "hearthmage":
      return ["magic", "club", "shielding"];
    case "verdant":
      return ["magic", "shielding", "distance"];
    case "hollowborn":
      return ["fist", "distance", "shielding"];
    default:
      return ["sword", "shielding", "magic"];
  }
}

export function isSkillId(v: unknown): v is SkillId {
  return typeof v === "string" && (SKILL_IDS as string[]).includes(v);
}

export function sanitizeQuickSlots(raw: unknown, classId: string): QuickSlots {
  const fallback = defaultQuickSlots(classId);
  if (!Array.isArray(raw) || raw.length < QUICK_SLOT_COUNT) return fallback;
  const out: SkillId[] = [];
  for (let i = 0; i < QUICK_SLOT_COUNT; i++) {
    out.push(isSkillId(raw[i]) ? raw[i] : fallback[i]!);
  }
  return [out[0]!, out[1]!, out[2]!];
}

export function skillName(id: SkillId): string {
  return SKILLS.find((s) => s.id === id)?.name ?? id;
}

export function skillAbbrev(id: SkillId): string {
  switch (id) {
    case "sword":
      return "Swd";
    case "axe":
      return "Axe";
    case "club":
      return "Clb";
    case "distance":
      return "Dist";
    case "shielding":
      return "Shld";
    case "fist":
      return "Fist";
    case "magic":
      return "Mag";
  }
}
