/** Persist class choice + skill XP + world location + purse in localStorage. */

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
import { isItemId, type ItemId } from "@/game/items";

export const CHARACTER_STORAGE_KEY = "vale-character-v1";

/** Starting gold for a new path. */
export const STARTING_GOLD = 45;

export interface InventoryStack {
  id: ItemId;
  qty: number;
}

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
  /** Purse gold. */
  gold: number;
  /** Simple item stacks. */
  inventory: InventoryStack[];
  /** Folk ids the player has spoken with (optional flavor). */
  metFolk: string[];
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

function sanitizeInventory(raw: unknown): InventoryStack[] {
  if (!Array.isArray(raw)) return [];
  const out: InventoryStack[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    if (!isItemId(o.id)) continue;
    const qty =
      typeof o.qty === "number" && Number.isFinite(o.qty) ? Math.floor(o.qty) : 0;
    if (qty <= 0) continue;
    const existing = out.find((s) => s.id === o.id);
    if (existing) existing.qty += qty;
    else out.push({ id: o.id, qty });
  }
  return out;
}

function sanitizeMetFolk(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const set = new Set<string>();
  for (const v of raw) {
    if (typeof v === "string" && v.length > 0 && v.length < 64) set.add(v);
  }
  return Array.from(set);
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
    const gold =
      typeof rec.gold === "number" && Number.isFinite(rec.gold)
        ? Math.max(0, Math.floor(rec.gold))
        : STARTING_GOLD;
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
      gold,
      inventory: sanitizeInventory(rec.inventory),
      metFolk: sanitizeMetFolk(rec.metFolk),
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
    gold: STARTING_GOLD,
    inventory: [{ id: "trail-rations", qty: 2 }],
    metFolk: [],
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

export function markFolkMet(
  character: ValeCharacter,
  folkId: string,
): ValeCharacter {
  if (character.metFolk.includes(folkId)) return character;
  const next: ValeCharacter = {
    ...character,
    metFolk: [...character.metFolk, folkId],
  };
  saveCharacter(next);
  return next;
}

export function addInventoryItem(
  character: ValeCharacter,
  itemId: ItemId,
  qty = 1,
): ValeCharacter {
  const inventory = character.inventory.map((s) => ({ ...s }));
  const stack = inventory.find((s) => s.id === itemId);
  if (stack) stack.qty += qty;
  else inventory.push({ id: itemId, qty });
  const next = { ...character, inventory };
  saveCharacter(next);
  return next;
}

export function removeInventoryItem(
  character: ValeCharacter,
  itemId: ItemId,
  qty = 1,
): ValeCharacter | null {
  const inventory = character.inventory.map((s) => ({ ...s }));
  const idx = inventory.findIndex((s) => s.id === itemId);
  if (idx < 0) return null;
  const stack = inventory[idx]!;
  if (stack.qty < qty) return null;
  stack.qty -= qty;
  if (stack.qty <= 0) inventory.splice(idx, 1);
  const next = { ...character, inventory };
  saveCharacter(next);
  return next;
}

export function setGold(character: ValeCharacter, gold: number): ValeCharacter {
  const next = { ...character, gold: Math.max(0, Math.floor(gold)) };
  saveCharacter(next);
  return next;
}
