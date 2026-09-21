/** Carry weight, backpack slots, bank transfers, and death item loss. */

import { getItem, type ItemId } from "@/game/items";
import { goldLostOnDeath } from "@/game/combat";

export interface ItemStack {
  id: ItemId;
  qty: number;
}

/** Default canvas pack (unique stacks). */
export const BASE_BACKPACK_SLOTS = 20;
/** Premium Backpack total slots (not additive). */
export const PREMIUM_BACKPACK_SLOTS = 32;
/** Default carry capacity (item weight units). */
export const BASE_WEIGHT_CAPACITY = 80;
/** Premium Backpack extra capacity (of the default). */
export const PREMIUM_WEIGHT_BONUS = 0.5;
/** Fraction of carried item quantity lost on death (rounded down). */
export const EQUIPMENT_LOSS_RATE = 0.1;

export const TOAST_OVERWEIGHT =
  "Too heavy — bank items or unlock Premium Backpack";
export const TOAST_PACK_FULL =
  "Pack full — bank items or unlock Premium Backpack";

export const DEATH_RULES_BLURB =
  "Death respawns you at the continent spawn (hollows eject). You lose about 5% of carried gold (at least 1g if you hold any) and 10% of carried item quantity, rounded down. Banked gold and items never drop. A short bones marker sits on the death tile until it fades or you walk away.";

/** Overlay toast duration for the multi-line death summary. */
export const DEATH_TOAST_MS = 5600;

export function stackWeight(stack: ItemStack): number {
  return getItem(stack.id).weight * stack.qty;
}

export function carriedWeight(inventory: ItemStack[]): number {
  let total = 0;
  for (const stack of inventory) total += stackWeight(stack);
  return total;
}

export function maxSlotsFor(premiumBackpack: boolean): number {
  return premiumBackpack ? PREMIUM_BACKPACK_SLOTS : BASE_BACKPACK_SLOTS;
}

export function maxWeightFor(premiumBackpack: boolean): number {
  const base = BASE_WEIGHT_CAPACITY;
  return premiumBackpack
    ? Math.floor(base * (1 + PREMIUM_WEIGHT_BONUS))
    : base;
}

function withAddedStack(
  inventory: ItemStack[],
  itemId: ItemId,
  qty: number,
): ItemStack[] {
  const next = inventory.map((s) => ({ ...s }));
  const stack = next.find((s) => s.id === itemId);
  if (stack) stack.qty += qty;
  else next.push({ id: itemId, qty });
  return next;
}

export function canCarry(
  inventory: ItemStack[],
  premiumBackpack: boolean,
  itemId: ItemId,
  qty = 1,
): { ok: true } | { ok: false; reason: "weight" | "slots" } {
  if (qty <= 0) return { ok: true };
  const next = withAddedStack(inventory, itemId, qty);
  if (next.length > maxSlotsFor(premiumBackpack)) {
    return { ok: false, reason: "slots" };
  }
  if (carriedWeight(next) > maxWeightFor(premiumBackpack)) {
    return { ok: false, reason: "weight" };
  }
  return { ok: true };
}

export function toastForCarryFail(reason: "weight" | "slots"): string {
  return reason === "slots" ? TOAST_PACK_FULL : TOAST_OVERWEIGHT;
}

/** Short bank transfer line: gold and/or item name × qty. Feel only — no rule changes. */
export function formatBankToast(
  verb: "Deposited" | "Withdrew",
  gold: number,
  itemId?: ItemId,
  qty = 1,
): string | null {
  const parts: string[] = [];
  if (gold > 0) parts.push(`${gold}g`);
  if (itemId && qty > 0) parts.push(`${getItem(itemId).name} ×${qty}`);
  if (parts.length === 0) return null;
  return `${verb} ${parts.join(" · ")}`;
}

/** Pack chrome — feel only. Capacities and carry rules stay with maxWeightFor / maxSlotsFor. */
export function formatWeightChrome(weight: number, maxWeight: number): string {
  return `Weight ${weight} / ${maxWeight}`;
}

export function formatSlotsChrome(slots: number, maxSlots: number): string {
  return `Slots ${slots} / ${maxSlots}`;
}

/** Compact load line, e.g. `Weight 12 / 80 · Slots 3 / 20 · Premium`. */
export function formatPackLoadChrome(
  weight: number,
  maxWeight: number,
  slots: number,
  maxSlots: number,
  premium = false,
): string {
  const load = `${formatWeightChrome(weight, maxWeight)} · ${formatSlotsChrome(slots, maxSlots)}`;
  return premium ? `${load} · Premium` : load;
}

/** Randomly remove ~10% of carried item units. Bank is not touched. */
export function applyEquipmentLoss(
  inventory: ItemStack[],
  rng: () => number = Math.random,
): { inventory: ItemStack[]; lost: ItemStack[] } {
  const pool = inventory.map((s) => ({ ...s }));
  const total = pool.reduce((n, s) => n + s.qty, 0);
  let toLose = Math.floor(total * EQUIPMENT_LOSS_RATE);
  if (toLose <= 0) return { inventory: pool, lost: [] };

  const lostQty = new Map<ItemId, number>();
  for (let i = 0; i < toLose; i++) {
    const left = pool.reduce((n, s) => n + s.qty, 0);
    if (left <= 0) break;
    let pick = Math.floor(rng() * left);
    for (const stack of pool) {
      if (stack.qty <= 0) continue;
      if (pick < stack.qty) {
        stack.qty -= 1;
        lostQty.set(stack.id, (lostQty.get(stack.id) ?? 0) + 1);
        break;
      }
      pick -= stack.qty;
    }
  }

  const lost: ItemStack[] = [];
  for (const [id, qty] of lostQty) {
    if (qty > 0) lost.push({ id, qty });
  }
  return {
    inventory: pool.filter((s) => s.qty > 0),
    lost,
  };
}

export function formatItemLoss(lost: ItemStack[]): string {
  if (lost.length === 0) return "";
  return lost
    .map((s) => `${getItem(s.id).name} ×${s.qty}`)
    .join(", ");
}

/** Structured death / respawn copy so the toast can set type rhythm. Words stay the same. */
export interface DeathToastCopy {
  title: string;
  respawn: string;
  bones: string;
  loss: string;
  safe: string;
  lostSomething: boolean;
}

export function formatDeathToast(
  goldLost: number,
  itemsLost: ItemStack[],
): DeathToastCopy {
  const itemPart = formatItemLoss(itemsLost);
  const lost: string[] = [];
  if (goldLost > 0) lost.push(`${goldLost}g carried gold`);
  if (itemPart) lost.push(itemPart);
  const lostSomething = lost.length > 0;
  return {
    title: "You fall",
    respawn: "Respawned at continent spawn.",
    bones: "Bones mark the fall — walk them to clear.",
    loss: lostSomething
      ? `Lost: ${lost.join(" · ")}`
      : "No carried gold or items lost.",
    safe: "Banked gold and items are safe.",
    lostSomething,
  };
}

export function summarizeDeathLoss(
  gold: number,
  inventory: ItemStack[],
  rng: () => number = Math.random,
): {
  goldLost: number;
  itemsLost: ItemStack[];
  inventory: ItemStack[];
} {
  const goldLost = goldLostOnDeath(gold);
  const { inventory: nextInv, lost } = applyEquipmentLoss(inventory, rng);
  return { goldLost, itemsLost: lost, inventory: nextInv };
}

function addToList(
  list: ItemStack[],
  itemId: ItemId,
  qty: number,
): ItemStack[] {
  return withAddedStack(list, itemId, qty);
}

function removeFromList(
  list: ItemStack[],
  itemId: ItemId,
  qty: number,
): ItemStack[] | null {
  const next = list.map((s) => ({ ...s }));
  const idx = next.findIndex((s) => s.id === itemId);
  if (idx < 0) return null;
  const stack = next[idx]!;
  if (stack.qty < qty) return null;
  stack.qty -= qty;
  if (stack.qty <= 0) next.splice(idx, 1);
  return next;
}

export function moveStack(
  from: ItemStack[],
  to: ItemStack[],
  itemId: ItemId,
  qty = 1,
): { from: ItemStack[]; to: ItemStack[] } | null {
  const nextFrom = removeFromList(from, itemId, qty);
  if (!nextFrom) return null;
  return { from: nextFrom, to: addToList(to, itemId, qty) };
}
