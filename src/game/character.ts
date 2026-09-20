/** Persist class choice + skill XP + world location in localStorage. */

import {
  STARTER_CONTINENT,
  isContinentId,
  type ContinentId,
} from "@/game/continents";
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
  /** Current continent (overworld or parent of hollow). */
  continentId: ContinentId;
  /** Continents unlocked by visiting via gates (or starter). */
  discoveredContinents: ContinentId[];
  /** null = overworld; otherwise hollow index on current continent. */
  hollowIndex: number | null;
  /** Overworld tile to return to when exiting a hollow. */
  hollowReturn: { x: number; y: number } | null;
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

function sanitizeDiscovered(raw: unknown, current: ContinentId): ContinentId[] {
  const set = new Set<ContinentId>([STARTER_CONTINENT, current]);
  if (Array.isArray(raw)) {
    for (const v of raw) {
      if (isContinentId(v)) set.add(v);
    }
  }
  return Array.from(set);
}

function sanitizeHollowReturn(
  raw: unknown,
): { x: number; y: number } | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (
    typeof o.x === "number" &&
    typeof o.y === "number" &&
    Number.isFinite(o.x) &&
    Number.isFinite(o.y)
  ) {
    return { x: Math.floor(o.x), y: Math.floor(o.y) };
  }
  return null;
}

export function loadCharacter(): ValeCharacter | null {
  try {
    const raw = localStorage.getItem(CHARACTER_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const rec = data as Record<string, unknown>;
    if (!isClassId(rec.classId)) return null;
    const continentId = isContinentId(rec.continentId)
      ? rec.continentId
      : STARTER_CONTINENT;
    const hollowIndex =
      typeof rec.hollowIndex === "number" &&
      Number.isFinite(rec.hollowIndex) &&
      rec.hollowIndex >= 0
        ? Math.floor(rec.hollowIndex)
        : null;
    return {
      classId: rec.classId,
      skillXp: sanitizeSkillXp(rec.skillXp),
      combatXp:
        typeof rec.combatXp === "number" && Number.isFinite(rec.combatXp)
          ? Math.max(0, Math.floor(rec.combatXp))
          : 0,
      continentId,
      discoveredContinents: sanitizeDiscovered(
        rec.discoveredContinents,
        continentId,
      ),
      hollowIndex,
      hollowReturn: hollowIndex !== null ? sanitizeHollowReturn(rec.hollowReturn) : null,
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
  const character: ValeCharacter = {
    classId,
    skillXp,
    combatXp: 0,
    continentId: STARTER_CONTINENT,
    discoveredContinents: [STARTER_CONTINENT],
    hollowIndex: null,
    hollowReturn: null,
  };
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

/** Travel to another continent via gate; marks it discovered. */
export function travelToContinent(
  character: ValeCharacter,
  target: ContinentId,
): ValeCharacter {
  const discovered = new Set(character.discoveredContinents);
  discovered.add(target);
  const next: ValeCharacter = {
    ...character,
    continentId: target,
    discoveredContinents: Array.from(discovered),
    hollowIndex: null,
    hollowReturn: null,
  };
  saveCharacter(next);
  return next;
}

/** Enter a hollow from an overworld entrance tile. */
export function enterHollow(
  character: ValeCharacter,
  index: number,
  returnTile: { x: number; y: number },
): ValeCharacter {
  const next: ValeCharacter = {
    ...character,
    hollowIndex: index,
    hollowReturn: { ...returnTile },
  };
  saveCharacter(next);
  return next;
}

/** Leave hollow back to overworld (keeps hollowReturn for one-shot spawn). */
export function exitHollow(character: ValeCharacter): ValeCharacter {
  const next: ValeCharacter = {
    ...character,
    hollowIndex: null,
  };
  saveCharacter(next);
  return next;
}

/** Clear pending overworld return tile after spawning. */
export function clearHollowReturn(character: ValeCharacter): ValeCharacter {
  if (!character.hollowReturn) return character;
  const next: ValeCharacter = { ...character, hollowReturn: null };
  saveCharacter(next);
  return next;
}
