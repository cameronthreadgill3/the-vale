/** Weighted enemy drop tables — First Story fauna, Tibia-lite rolls. */

import type { EnemyKindId } from "@/game/enemies";
import type { ItemId } from "@/game/items";
import { getItem } from "@/game/items";

export interface LootEntry {
  /** null = empty pocket this roll. */
  itemId: ItemId | null;
  weight: number;
}

export interface LootTable {
  /** Independent weighted picks per corpse. */
  rolls: number;
  table: LootEntry[];
}

const EMPTY = (weight: number): LootEntry => ({ itemId: null, weight });

export const LOOT_TABLES: Record<EnemyKindId, LootTable> = {
  "briar-mite": {
    rolls: 1,
    table: [
      EMPTY(38),
      { itemId: "mite-chitin", weight: 32 },
      { itemId: "trail-rations", weight: 16 },
      { itemId: "thorn-charm", weight: 8 },
      { itemId: "fledgling-knife", weight: 6 },
    ],
  },
  "needle-rat": {
    rolls: 1,
    table: [
      EMPTY(28),
      { itemId: "rat-tooth", weight: 28 },
      { itemId: "basin-leather", weight: 16 },
      { itemId: "ashwood-splinter", weight: 12 },
      { itemId: "healing-draught", weight: 8 },
      { itemId: "fledgling-knife", weight: 5 },
      { itemId: "basin-buckler", weight: 3 },
    ],
  },
  "bark-hound": {
    rolls: 2,
    table: [
      EMPTY(22),
      { itemId: "bark-hide", weight: 24 },
      { itemId: "thorn-fang", weight: 18 },
      { itemId: "basin-leather", weight: 12 },
      { itemId: "ashwood-blade", weight: 8 },
      { itemId: "bark-club", weight: 6 },
      { itemId: "bark-shield", weight: 5 },
      { itemId: "thorn-mail", weight: 3 },
      { itemId: "healing-draught", weight: 2 },
    ],
  },
  "shade-wisp": {
    rolls: 1,
    table: [
      EMPTY(26),
      { itemId: "mistveil-thread", weight: 24 },
      { itemId: "hollow-spark", weight: 18 },
      { itemId: "lantern-oil", weight: 12 },
      { itemId: "mistveil-wrap", weight: 8 },
      { itemId: "mistveil-rod", weight: 6 },
      { itemId: "choir-shard", weight: 4 },
      { itemId: "thorn-ward", weight: 2 },
    ],
  },
  "ash-vole": {
    rolls: 1,
    table: [
      EMPTY(40),
      { itemId: "trail-rations", weight: 28 },
      { itemId: "basin-leather", weight: 18 },
      { itemId: "mite-chitin", weight: 10 },
      { itemId: "healing-draught", weight: 4 },
    ],
  },
  "gorse-fox": {
    rolls: 1,
    table: [
      EMPTY(30),
      { itemId: "basin-leather", weight: 26 },
      { itemId: "ashwood-splinter", weight: 16 },
      { itemId: "rat-tooth", weight: 12 },
      { itemId: "fledgling-knife", weight: 10 },
      { itemId: "healing-draught", weight: 6 },
    ],
  },
  "ashveil-ember": {
    rolls: 2,
    table: [
      EMPTY(8),
      { itemId: "hollow-spark", weight: 26 },
      { itemId: "ashveil-cinder", weight: 22 },
      { itemId: "lantern-oil", weight: 16 },
      { itemId: "mistveil-thread", weight: 12 },
      { itemId: "mistveil-wrap", weight: 8 },
      { itemId: "mistveil-rod", weight: 5 },
      { itemId: "choir-shard", weight: 3 },
    ],
  },
};

export function pickWeighted<T>(rng: () => number, entries: { value: T; weight: number }[]): T {
  const total = entries.reduce((s, e) => s + e.weight, 0);
  let roll = rng() * total;
  for (const e of entries) {
    roll -= e.weight;
    if (roll < 0) return e.value;
  }
  return entries[entries.length - 1]!.value;
}

/** Roll a corpse. Empty weights produce no item for that pick. */
export function rollLoot(kindId: EnemyKindId, rng: () => number): ItemId[] {
  const def = LOOT_TABLES[kindId];
  if (!def) return [];
  const out: ItemId[] = [];
  const weighted = def.table.map((row) => ({ value: row.itemId, weight: row.weight }));
  for (let i = 0; i < def.rolls; i++) {
    const picked = pickWeighted(rng, weighted);
    if (picked) out.push(picked);
  }
  return out;
}

export function lootFloatLabel(id: ItemId): string {
  return getItem(id).name;
}

/** Short pack-pickup line: gold and/or item name × qty. Feel only — no rule changes. */
export function formatPickupToast(gold: number, taken: ItemId[]): string | null {
  const parts: string[] = [];
  if (gold > 0) parts.push(`${gold}g`);
  const counts = new Map<ItemId, number>();
  for (const id of taken) counts.set(id, (counts.get(id) ?? 0) + 1);
  for (const [id, qty] of counts) {
    parts.push(`${getItem(id).name} ×${qty}`);
  }
  if (parts.length === 0) return null;
  return `Picked up ${parts.join(" · ")}`;
}
