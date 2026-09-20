/** Persist class choice + skill XP in localStorage. */

import { getClass, type ClassId } from "@/game/classes";
import {
  emptySkillXp,
  SKILL_IDS,
  type SkillId,
  xpForStartingLevel,
} from "@/game/skills";

export const CHARACTER_STORAGE_KEY = "vale-character-v1";

export interface ValeCharacter {
  classId: ClassId;
  /** Total XP per skill (same cubic curve as combat XP). */
  skillXp: Record<SkillId, number>;
  /** Combat / character XP (shell HUD). */
  combatXp: number;
}

function isClassId(v: unknown): v is ClassId {
  return (
    typeof v === "string" &&
    ["warden", "thornblade", "pathfinder", "hearthmage", "verdant", "hollowborn"].includes(
      v,
    )
  );
}

function sanitizeSkillXp(raw: unknown): Record<SkillId, number> {
  const base = emptySkillXp();
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;
  for (const id of SKILL_IDS) {
    const n = obj[id];
    if (typeof n === "number" && Number.isFinite(n) && n >= 0) {
      base[id] = Math.floor(n);
    }
  }
  return base;
}

export function loadCharacter(): ValeCharacter | null {
  try {
    const raw = localStorage.getItem(CHARACTER_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const rec = data as Record<string, unknown>;
    if (!isClassId(rec.classId)) return null;
    return {
      classId: rec.classId,
      skillXp: sanitizeSkillXp(rec.skillXp),
      combatXp:
        typeof rec.combatXp === "number" && Number.isFinite(rec.combatXp)
          ? Math.max(0, Math.floor(rec.combatXp))
          : 0,
    };
  } catch {
    return null;
  }
}

export function saveCharacter(character: ValeCharacter): void {
  localStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(character));
}

export function createCharacter(classId: ClassId): ValeCharacter {
  const cls = getClass(classId);
  const skillXp = emptySkillXp();
  for (const id of SKILL_IDS) {
    const start = cls.startingLevels[id] ?? 1;
    skillXp[id] = xpForStartingLevel(start);
  }
  const character: ValeCharacter = { classId, skillXp, combatXp: 0 };
  saveCharacter(character);
  return character;
}

export function clearCharacter(): void {
  localStorage.removeItem(CHARACTER_STORAGE_KEY);
}

/** Award skill XP with class gain multiplier. Returns new total XP. */
export function awardSkillXp(
  character: ValeCharacter,
  skill: SkillId,
  baseAmount: number,
): number {
  const cls = getClass(character.classId);
  const mult = cls.gainMultipliers[skill] ?? 1;
  const gained = Math.max(0, Math.floor(baseAmount * mult));
  const next = character.skillXp[skill] + gained;
  character.skillXp[skill] = next;
  saveCharacter(character);
  return next;
}
