/** Catalog of buyable / inventory items (flavor gear, no combat stats). */

export type ItemId =
  | "healing-draught"
  | "trail-rations"
  | "hearth-bread"
  | "thorn-charm"
  | "lantern-oil"
  | "rope-coil"
  | "salted-fish"
  | "mistveil-tonic"
  | "obsidian-shard";

export interface ItemDef {
  id: ItemId;
  name: string;
  blurb: string;
  /** Default buy price in gold. */
  value: number;
}

export const ITEMS: ItemDef[] = [
  {
    id: "healing-draught",
    name: "Healing Draught",
    blurb: "A bitter vial that knits scrapes and bruises.",
    value: 12,
  },
  {
    id: "trail-rations",
    name: "Trail Rations",
    blurb: "Dried meat and hard biscuit for the road.",
    value: 5,
  },
  {
    id: "hearth-bread",
    name: "Hearth Bread",
    blurb: "Warm loaf wrapped in thornleaf cloth.",
    value: 4,
  },
  {
    id: "thorn-charm",
    name: "Thorn Charm",
    blurb: "A briar token travelers rub for luck.",
    value: 18,
  },
  {
    id: "lantern-oil",
    name: "Lantern Oil",
    blurb: "Smoky oil that burns steady in hollow dark.",
    value: 8,
  },
  {
    id: "rope-coil",
    name: "Rope Coil",
    blurb: "Stout hemp for cliffs and choir vaults.",
    value: 10,
  },
  {
    id: "salted-fish",
    name: "Salted Fish",
    blurb: "Mistmere catch, packed in brine.",
    value: 6,
  },
  {
    id: "mistveil-tonic",
    name: "Mistveil Tonic",
    blurb: "Clears fog from the lungs — or so they say.",
    value: 15,
  },
  {
    id: "obsidian-shard",
    name: "Obsidian Shard",
    blurb: "Nightglass coast glass, sharp and cold.",
    value: 22,
  },
];

export function getItem(id: ItemId): ItemDef {
  const found = ITEMS.find((i) => i.id === id);
  if (!found) throw new Error(`Unknown item: ${id}`);
  return found;
}

export function isItemId(v: unknown): v is ItemId {
  return typeof v === "string" && ITEMS.some((i) => i.id === v);
}
