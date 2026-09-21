/** Catalog of pack goods and equippable gear (First Story flavor, Tibia-lite stats). */

import type { SkillId } from "@/game/skills";

export type ItemKind = "goods" | "weapon" | "armor" | "shield";

/** Equipment slots that can hold a worn piece. */
export type EquipSlot = "weapon" | "armor" | "shield";

/**
 * Gear tiers — ashwood basin → thorn → mistveil/choir.
 * 0 Fledgling · 1 Basin · 2 Ashwood · 3 Thorn · 4 Choir-mist
 */
export type EquipTier = 0 | 1 | 2 | 3 | 4;

export const TIER_NAMES: Record<EquipTier, string> = {
  0: "Fledgling",
  1: "Basin",
  2: "Ashwood",
  3: "Thorn",
  4: "Choir-mist",
};

export type ItemId =
  | "healing-draught"
  | "trail-rations"
  | "hearth-bread"
  | "thorn-charm"
  | "lantern-oil"
  | "rope-coil"
  | "salted-fish"
  | "mistveil-tonic"
  | "obsidian-shard"
  | "rat-tooth"
  | "basin-leather"
  | "ashwood-splinter"
  | "mite-chitin"
  | "bark-hide"
  | "thorn-fang"
  | "mistveil-thread"
  | "hollow-spark"
  | "choir-shard"
  | "fledgling-knife"
  | "fledgling-sword"
  | "ashwood-hatchet"
  | "ashwood-blade"
  | "bark-club"
  | "reed-bow"
  | "cloth-wraps"
  | "hearth-rod"
  | "thornleaf-wand"
  | "thorn-axe"
  | "mistveil-rod"
  | "choir-dirk"
  | "fledgling-vest"
  | "basin-leathers"
  | "thorn-mail"
  | "mistveil-wrap"
  | "choir-hauberk"
  | "basin-buckler"
  | "bark-shield"
  | "thorn-ward";

export interface ItemDef {
  id: ItemId;
  name: string;
  blurb: string;
  /** Default buy / vendor value in gold. */
  value: number;
  /** Carry weight in oz. */
  weight: number;
  kind: ItemKind;
  tier?: EquipTier;
  slot?: EquipSlot;
  attack?: number;
  defense?: number;
  weaponSkill?: SkillId;
  twoHand?: boolean;
}

export const ITEMS: ItemDef[] = [
  {
    id: "healing-draught",
    name: "Healing Draught",
    blurb: "A bitter vial that knits scrapes and bruises.",
    value: 12,
    weight: 2,
    kind: "goods",
  },
  {
    id: "trail-rations",
    name: "Trail Rations",
    blurb: "Dried meat and hard biscuit for the road.",
    value: 5,
    weight: 8,
    kind: "goods",
  },
  {
    id: "hearth-bread",
    name: "Hearth Bread",
    blurb: "Warm loaf wrapped in thornleaf cloth.",
    value: 4,
    weight: 6,
    kind: "goods",
  },
  {
    id: "thorn-charm",
    name: "Thorn Charm",
    blurb: "A briar token travelers rub for luck.",
    value: 18,
    weight: 1,
    kind: "goods",
  },
  {
    id: "lantern-oil",
    name: "Lantern Oil",
    blurb: "Smoky oil that burns steady in hollow dark.",
    value: 8,
    weight: 4,
    kind: "goods",
  },
  {
    id: "rope-coil",
    name: "Rope Coil",
    blurb: "Stout hemp for cliffs and choir vaults.",
    value: 10,
    weight: 18,
    kind: "goods",
  },
  {
    id: "salted-fish",
    name: "Salted Fish",
    blurb: "Mistmere catch, packed in brine.",
    value: 6,
    weight: 6,
    kind: "goods",
  },
  {
    id: "mistveil-tonic",
    name: "Mistveil Tonic",
    blurb: "Clears fog from the lungs — or so they say.",
    value: 15,
    weight: 2,
    kind: "goods",
  },
  {
    id: "obsidian-shard",
    name: "Obsidian Shard",
    blurb: "Nightglass coast glass, sharp and cold.",
    value: 22,
    weight: 3,
    kind: "goods",
  },
  {
    id: "rat-tooth",
    name: "Needle Tooth",
    blurb: "A curved needle-tooth, still faintly hooked.",
    value: 3,
    weight: 1,
    kind: "goods",
  },
  {
    id: "basin-leather",
    name: "Basin Leather",
    blurb: "Grass-scuffed hide from the Thornreach clearing.",
    value: 8,
    weight: 5,
    kind: "goods",
  },
  {
    id: "ashwood-splinter",
    name: "Ashwood Splinter",
    blurb: "Dark gray bark with a silver-edged grain.",
    value: 6,
    weight: 2,
    kind: "goods",
  },
  {
    id: "mite-chitin",
    name: "Mite Chitin",
    blurb: "Thorn-shelled plate from a basin pest.",
    value: 4,
    weight: 2,
    kind: "goods",
  },
  {
    id: "bark-hide",
    name: "Bark Hide",
    blurb: "Wolf-sized plates that still smell of ashwood.",
    value: 14,
    weight: 8,
    kind: "goods",
  },
  {
    id: "thorn-fang",
    name: "Thorn Fang",
    blurb: "A bark-hound hook, heavier than it looks.",
    value: 11,
    weight: 3,
    kind: "goods",
  },
  {
    id: "mistveil-thread",
    name: "Mistveil Thread",
    blurb: "Pale filament that beads with fog.",
    value: 16,
    weight: 1,
    kind: "goods",
  },
  {
    id: "hollow-spark",
    name: "Hollow Spark",
    blurb: "A wisp-ember that never quite goes out.",
    value: 18,
    weight: 1,
    kind: "goods",
  },
  {
    id: "choir-shard",
    name: "Choir Shard",
    blurb: "Drowned hymn-glass, cold as the cloister floor.",
    value: 24,
    weight: 2,
    kind: "goods",
  },
  {
    id: "fledgling-knife",
    name: "Fledgling Knife",
    blurb: "A square-forged sticker for first blood.",
    value: 10,
    weight: 8,
    kind: "weapon",
    tier: 0,
    slot: "weapon",
    attack: 3,
    weaponSkill: "sword",
  },
  {
    id: "fledgling-sword",
    name: "Fledgling Sword",
    blurb: "Practice steel from the Thornhearth rack.",
    value: 18,
    weight: 22,
    kind: "weapon",
    tier: 0,
    slot: "weapon",
    attack: 4,
    weaponSkill: "sword",
  },
  {
    id: "ashwood-hatchet",
    name: "Ashwood Hatchet",
    blurb: "Silver-edged bit bound to dark gray haft.",
    value: 26,
    weight: 24,
    kind: "weapon",
    tier: 1,
    slot: "weapon",
    attack: 6,
    weaponSkill: "axe",
  },
  {
    id: "ashwood-blade",
    name: "Ashwood Blade",
    blurb: "Longer edge; grain runs like basin-river bands.",
    value: 42,
    weight: 28,
    kind: "weapon",
    tier: 2,
    slot: "weapon",
    attack: 8,
    weaponSkill: "sword",
  },
  {
    id: "bark-club",
    name: "Bark Club",
    blurb: "A hound-thick bough, still plated in hide.",
    value: 34,
    weight: 30,
    kind: "weapon",
    tier: 2,
    slot: "weapon",
    attack: 7,
    weaponSkill: "club",
  },
  {
    id: "reed-bow",
    name: "Reed Bow",
    blurb: "Mistmere reed, drawn quiet across the grass.",
    value: 24,
    weight: 18,
    kind: "weapon",
    tier: 1,
    slot: "weapon",
    attack: 6,
    weaponSkill: "distance",
    twoHand: true,
  },
  {
    id: "cloth-wraps",
    name: "Cloth Wraps",
    blurb: "Square-knit strips. The Hollowborn's first hands.",
    value: 8,
    weight: 6,
    kind: "weapon",
    tier: 0,
    slot: "weapon",
    attack: 3,
    weaponSkill: "fist",
  },
  {
    id: "hearth-rod",
    name: "Hearth Rod",
    blurb: "A hearth-stone stave that remembers fire.",
    value: 28,
    weight: 16,
    kind: "weapon",
    tier: 1,
    slot: "weapon",
    attack: 7,
    weaponSkill: "magic",
    twoHand: true,
  },
  {
    id: "thornleaf-wand",
    name: "Thornleaf Wand",
    blurb: "Green pith, soft light. Mends as it stings.",
    value: 24,
    weight: 12,
    kind: "weapon",
    tier: 1,
    slot: "weapon",
    attack: 6,
    weaponSkill: "magic",
  },
  {
    id: "thorn-axe",
    name: "Thorn Axe",
    blurb: "Briar-forged cheek; bites like the ashwood pack.",
    value: 58,
    weight: 32,
    kind: "weapon",
    tier: 3,
    slot: "weapon",
    attack: 10,
    weaponSkill: "axe",
  },
  {
    id: "mistveil-rod",
    name: "Mistveil Rod",
    blurb: "Fog-tempered. The hymn inside is not yours.",
    value: 72,
    weight: 18,
    kind: "weapon",
    tier: 4,
    slot: "weapon",
    attack: 11,
    weaponSkill: "magic",
    twoHand: true,
  },
  {
    id: "choir-dirk",
    name: "Choir Dirk",
    blurb: "Drowned-hymn steel, thin as a cloister vow.",
    value: 70,
    weight: 20,
    kind: "weapon",
    tier: 4,
    slot: "weapon",
    attack: 11,
    weaponSkill: "sword",
  },
  {
    id: "fledgling-vest",
    name: "Fledgling Vest",
    blurb: "Quilted cloth from the square's spare chest.",
    value: 14,
    weight: 18,
    kind: "armor",
    tier: 0,
    slot: "armor",
    defense: 2,
  },
  {
    id: "basin-leathers",
    name: "Basin Leathers",
    blurb: "Grass-scuffed hide, sewn with thorn-gut.",
    value: 32,
    weight: 28,
    kind: "armor",
    tier: 1,
    slot: "armor",
    defense: 4,
  },
  {
    id: "thorn-mail",
    name: "Thorn Mail",
    blurb: "Briar rings over bark plates. Heavy mercy.",
    value: 54,
    weight: 42,
    kind: "armor",
    tier: 2,
    slot: "armor",
    defense: 7,
  },
  {
    id: "mistveil-wrap",
    name: "Mistveil Wrap",
    blurb: "Fog-beaded cloth that turns a glancing bite.",
    value: 48,
    weight: 22,
    kind: "armor",
    tier: 3,
    slot: "armor",
    defense: 6,
  },
  {
    id: "choir-hauberk",
    name: "Choir Hauberk",
    blurb: "Hymn-linked rings. Cold even in the sun.",
    value: 80,
    weight: 55,
    kind: "armor",
    tier: 4,
    slot: "armor",
    defense: 10,
  },
  {
    id: "basin-buckler",
    name: "Basin Buckler",
    blurb: "A round of ashwood, silver-edged, small mercy.",
    value: 16,
    weight: 16,
    kind: "shield",
    tier: 1,
    slot: "shield",
    defense: 2,
  },
  {
    id: "bark-shield",
    name: "Bark Shield",
    blurb: "Hound-hide across a basin plank.",
    value: 36,
    weight: 28,
    kind: "shield",
    tier: 2,
    slot: "shield",
    defense: 4,
  },
  {
    id: "thorn-ward",
    name: "Thorn Ward",
    blurb: "Briar-rimmed face. The square's last lesson.",
    value: 52,
    weight: 32,
    kind: "shield",
    tier: 3,
    slot: "shield",
    defense: 6,
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

export function isEquipSlot(v: unknown): v is EquipSlot {
  return v === "weapon" || v === "armor" || v === "shield";
}

export function isEquippable(item: ItemDef): boolean {
  return item.kind === "weapon" || item.kind === "armor" || item.kind === "shield";
}

/** Compact stat line for shops and the pack. */
export function itemStatLine(item: ItemDef): string {
  const bits: string[] = [];
  if (item.tier !== undefined) bits.push(TIER_NAMES[item.tier]);
  if (typeof item.attack === "number") bits.push(`Atk ${item.attack}`);
  if (typeof item.defense === "number") bits.push(`Def ${item.defense}`);
  if (item.twoHand) bits.push("2H");
  bits.push(`${item.weight} oz`);
  return bits.join(" · ");
}
