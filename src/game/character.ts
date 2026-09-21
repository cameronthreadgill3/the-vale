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
  sanitizeQuickSlots,
  defaultQuickSlots,
  type QuickSlots,
  type SkillId,
  xpForStartingLevel,
} from "@/game/skills";
import { isItemId, type ItemId } from "@/game/items";
import { maxHpFor, maxManaFor, usesMana } from "@/game/combat";
import {
  canCarry,
  moveStack,
  summarizeDeathLoss,
  type ItemStack,
} from "@/game/backpack";

import { getActiveCharacterKey, GUEST_CHARACTER_KEY } from "@/account/storageScope";

/** Guest key (offline). Active play uses getActiveCharacterKey(). */
export const CHARACTER_STORAGE_KEY = GUEST_CHARACTER_KEY;

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
  /** Current hit points. */
  hp: number;
  /** Current mana (0 for non-magic classes). */
  mana: number;
  /** Simple item stacks. */
  inventory: InventoryStack[];
  /** Vault stacks — persist with the character; never drop on death. */
  bank: InventoryStack[];
  /** Gold stored in the vault. */
  bankGold: number;
  /** Premium Backpack: 32 slots and +50% carry weight. */
  premiumBackpack: boolean;
  /** Folk ids the player has spoken with (optional flavor). */
  metFolk: string[];
  /** Three assignable hotbar skills (keys 1–3). */
  quickSlots: QuickSlots;
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
    const raw = localStorage.getItem(getActiveCharacterKey());
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
    const loaded: ValeCharacter = {
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
      hp:
        typeof rec.hp === "number" && Number.isFinite(rec.hp)
          ? Math.max(0, Math.floor(rec.hp))
          : 0,
      mana:
        typeof rec.mana === "number" && Number.isFinite(rec.mana)
          ? Math.max(0, Math.floor(rec.mana))
          : 0,
      inventory: sanitizeInventory(rec.inventory),
      bank: sanitizeInventory(rec.bank),
      bankGold:
        typeof rec.bankGold === "number" && Number.isFinite(rec.bankGold)
          ? Math.max(0, Math.floor(rec.bankGold))
          : 0,
      premiumBackpack: rec.premiumBackpack === true,
      metFolk: sanitizeMetFolk(rec.metFolk),
      quickSlots: sanitizeQuickSlots(rec.quickSlots, rec.classId),
    };
    const synced = syncVitals(loaded, loaded.hp <= 0);
    if (!Array.isArray(rec.quickSlots) || rec.quickSlots.length < 3) {
      saveCharacter(synced);
    }
    return synced;
  } catch {
    return null;
  }
}

export function saveCharacter(character: ValeCharacter): void {
  localStorage.setItem(getActiveCharacterKey(), JSON.stringify(character));
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
    hp: 0,
    mana: 0,
    inventory: [{ id: "trail-rations", qty: 2 }],
    bank: [],
    bankGold: 0,
    premiumBackpack: false,
    metFolk: [],
    quickSlots: defaultQuickSlots(classId),
  };
  saveCharacter(character);
  return syncVitals(character, true);
}

export function clearCharacter(): void {
  localStorage.removeItem(getActiveCharacterKey());
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

export type CarryFail = { ok: false; reason: "weight" | "slots" };
export type CarryOk = { ok: true; character: ValeCharacter };

/** Player-facing pickup / buy — blocked when overweight or out of slots. */
export function tryAddInventoryItem(
  character: ValeCharacter,
  itemId: ItemId,
  qty = 1,
): CarryOk | CarryFail {
  const check = canCarry(
    character.inventory,
    character.premiumBackpack,
    itemId,
    qty,
  );
  if (!check.ok) return check;
  return { ok: true, character: addInventoryItem(character, itemId, qty) };
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

/** Assign a skill to hotbar slot 0–2 and persist. */
export function setQuickSlot(
  character: ValeCharacter,
  index: number,
  skill: SkillId,
): ValeCharacter {
  const i = Math.max(0, Math.min(2, Math.floor(index)));
  if (character.quickSlots[i] === skill) return character;
  const quickSlots: QuickSlots = [
    character.quickSlots[0],
    character.quickSlots[1],
    character.quickSlots[2],
  ];
  quickSlots[i] = skill;
  const next = { ...character, quickSlots };
  saveCharacter(next);
  return next;
}

export function setGold(character: ValeCharacter, gold: number): ValeCharacter {
  const next = { ...character, gold: Math.max(0, Math.floor(gold)) };
  saveCharacter(next);
  return next;
}


/** Clamp / fill HP & mana from current combat + skill levels. */
export function syncVitals(character: ValeCharacter, fill = false): ValeCharacter {
  const cls = getClass(character.classId);
  const maxHp = maxHpFor(character);
  const maxMana = maxManaFor(character, cls);
  let hp = typeof character.hp === "number" && Number.isFinite(character.hp)
    ? Math.floor(character.hp)
    : maxHp;
  let mana = typeof character.mana === "number" && Number.isFinite(character.mana)
    ? Math.floor(character.mana)
    : maxMana;
  if (fill) {
    hp = maxHp;
    mana = maxMana;
  }
  hp = Math.max(0, Math.min(maxHp, hp));
  mana = Math.max(0, Math.min(maxMana, mana));
  if (!usesMana(character.classId)) mana = 0;
  if (hp === character.hp && mana === character.mana) return character;
  const next = { ...character, hp, mana };
  saveCharacter(next);
  return next;
}

export function setVitals(
  character: ValeCharacter,
  hp: number,
  mana: number,
): ValeCharacter {
  const cls = getClass(character.classId);
  const maxHp = maxHpFor(character);
  const maxMana = maxManaFor(character, cls);
  const next = {
    ...character,
    hp: Math.max(0, Math.min(maxHp, Math.floor(hp))),
    mana: usesMana(character.classId)
      ? Math.max(0, Math.min(maxMana, Math.floor(mana)))
      : 0,
  };
  saveCharacter(next);
  return next;
}

/** Award combat XP and persist. */
export function awardCombatXp(character: ValeCharacter, amount: number): ValeCharacter {
  const gained = Math.max(0, Math.floor(amount));
  const next = {
    ...character,
    combatXp: character.combatXp + gained,
    skillXp: { ...character.skillXp },
  };
  // Refresh max HP lightly after XP (do not fully heal).
  const synced = syncVitals(next, false);
  saveCharacter(synced);
  return synced;
}

export interface DeathResult {
  character: ValeCharacter;
  goldLost: number;
  itemsLost: ItemStack[];
}

/** Death: leave hollow if inside, restore vitals, gold + 10% carried-item loss. Bank is untouched. */
export function applyDeath(
  character: ValeCharacter,
  rng: () => number = Math.random,
): DeathResult {
  const { goldLost, itemsLost, inventory } = summarizeDeathLoss(
    character.gold,
    character.inventory,
    rng,
  );
  let next: ValeCharacter = {
    ...character,
    gold: Math.max(0, character.gold - goldLost),
    inventory,
    skillXp: { ...character.skillXp },
    // Force overworld respawn at continent spawn (cleared by shell remount).
    hollowIndex: null,
    hollowReturn: null,
  };
  next = syncVitals(next, true);
  saveCharacter(next);
  return { character: next, goldLost, itemsLost };
}

export function unlockPremiumBackpack(character: ValeCharacter): ValeCharacter {
  if (character.premiumBackpack) return character;
  const next = { ...character, premiumBackpack: true };
  saveCharacter(next);
  return next;
}

export function depositItem(
  character: ValeCharacter,
  itemId: ItemId,
  qty = 1,
): ValeCharacter | null {
  const moved = moveStack(character.inventory, character.bank, itemId, qty);
  if (!moved) return null;
  const next = { ...character, inventory: moved.from, bank: moved.to };
  saveCharacter(next);
  return next;
}

export function withdrawItem(
  character: ValeCharacter,
  itemId: ItemId,
  qty = 1,
): CarryOk | CarryFail | { ok: false; reason: "missing" } {
  const probe = moveStack(character.bank, character.inventory, itemId, qty);
  if (!probe) return { ok: false, reason: "missing" };
  const check = canCarry(
    character.inventory,
    character.premiumBackpack,
    itemId,
    qty,
  );
  if (!check.ok) return check;
  const next = { ...character, bank: probe.from, inventory: probe.to };
  saveCharacter(next);
  return { ok: true, character: next };
}

export function depositGold(
  character: ValeCharacter,
  amount: number,
): ValeCharacter {
  const amt = Math.max(0, Math.min(character.gold, Math.floor(amount)));
  if (amt <= 0) return character;
  const next = {
    ...character,
    gold: character.gold - amt,
    bankGold: character.bankGold + amt,
  };
  saveCharacter(next);
  return next;
}

export function withdrawGold(
  character: ValeCharacter,
  amount: number,
): ValeCharacter {
  const amt = Math.max(0, Math.min(character.bankGold, Math.floor(amount)));
  if (amt <= 0) return character;
  const next = {
    ...character,
    gold: character.gold + amt,
    bankGold: character.bankGold - amt,
  };
  saveCharacter(next);
  return next;
}
