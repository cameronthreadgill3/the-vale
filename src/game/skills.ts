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
  /** Hotkey digit 1–7 for train-debug. */
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
