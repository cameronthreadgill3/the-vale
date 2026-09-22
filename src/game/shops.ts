import { ITEMS, type ItemId } from "./items";

export type ShopId = "hides" | "magic" | "armory" | "fletcher";

export type ShopDef = {
  id: ShopId;
  title: string;
  kicker: string;
  note: string;
  art: string;
  prop: "hides" | "magicshop" | "armory" | "fletcher";
  stock: ItemId[];
};

export const SHOPS: Record<ShopId, ShopDef> = {
  hides: {
    id: "hides",
    title: "Hides",
    kicker: "Brann's racks",
    note: "They buy what the copse drops — pelts, fangs, ears, hide, scale. Leather and a knife for the walk back.",
    art: "/interiors/hides.jpg",
    prop: "hides",
    stock: ["hunting_knife", "pelt_cloak", "helm_ash", "ranger_jerkin", "chest_ash", "bait"],
  },
  magic: {
    id: "magic",
    title: "The weave",
    kicker: "Iskra's glass",
    note: "Staves, orbs, rings, draughts. They buy glands, silk, and anything that still hums.",
    art: "/interiors/magic.jpg",
    prop: "magicshop",
    stock: ["health_potion", "mana_potion", "wand_ash", "apprentice_wand", "frost_orb", "college_robe", "helm_splinter", "ring_ash", "amulet_ash", "ring_iron", "amulet_iron"],
  },
  armory: {
    id: "armory",
    title: "Iron",
    kicker: "Garth's forge",
    note: "Swords, shields, plate. They buy steel and what used to be steel.",
    art: "/interiors/armory.jpg",
    prop: "armory",
    stock: ["melee_thorn", "ward_splinter", "ward_thorn", "chest_ash", "legs_splinter", "boots_splinter", "helm_iron", "legs_ash", "boots_thorn"],
  },
  fletcher: {
    id: "fletcher",
    title: "Greenpath",
    kicker: "Wren's shafts",
    note: "Bows, quivers, quiet leather. They buy glass-feathers and fangs that still cut.",
    art: "/interiors/fletcher.jpg",
    prop: "fletcher",
    stock: ["yew_bow", "hunter_longbow", "copse_recurve", "leather_quiver", "bodkin_quiver", "ranger_hood", "ranger_jerkin", "boots_thorn"],
  },
};

const ARCHER_IDS = new Set(SHOPS.fletcher.stock);
const MAGIC_IDS = new Set(SHOPS.magic.stock);
const ARMORY_IDS = new Set(SHOPS.armory.stock);
const HIDES_LOOT = new Set([
  "goblin_ear",
  "wolf_pelt",
  "wolf_fang",
  "bone",
  "orc_tusk",
  "orc_hide",
  "drake_scale",
  "wisp_silk",
  "crab_shell",
  "shrike_glass",
  "hag_eye",
]);

export function shopBuys(id: ShopId, item: ItemId): boolean {
  const d = ITEMS[item];
  if (!d) return false;
  if (id === "hides") return d.kind === "loot" || HIDES_LOOT.has(item) || SHOPS.hides.stock.includes(item);
  if (id === "magic") {
    if (MAGIC_IDS.has(item)) return true;
    if (item === "fire_gland" || item === "wisp_silk" || item === "hag_eye" || item === "cinder_core") return true;
    return d.kind === "gear" && ((d.mp ?? 0) > 0 || d.slot === "amulet" || d.slot === "ring");
  }
  if (id === "armory") {
    if (ARCHER_IDS.has(item) || MAGIC_IDS.has(item)) return false;
    if (d.kind === "loot" && (item === "rusty_blade" || item === "orc_tusk")) return true;
    return d.kind === "gear" && d.slot !== "amulet" && d.slot !== "ring";
  }
  if (id === "fletcher") {
    if (ARCHER_IDS.has(item)) return true;
    return item === "shrike_glass" || item === "wolf_fang" || item === "wisp_silk";
  }
  return false;
}

export function shopIdFromProp(kind: string): ShopId | null {
  if (kind === "hides" || kind === "stall") return "hides";
  if (kind === "magicshop") return "magic";
  if (kind === "armory") return "armory";
  if (kind === "fletcher") return "fletcher";
  if (kind === "shop") return "armory";
  return null;
}

export function shopIdFromRole(role: string): ShopId | null {
  if (role === "hides" || role === "magic" || role === "armory" || role === "fletcher") return role;
  return null;
}
