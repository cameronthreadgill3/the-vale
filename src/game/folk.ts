/** Named folk, shops, and coastal ship docks for Thornvale. */

import type { ContinentId } from "@/game/continents";
import type { ItemId } from "@/game/items";
import { THORNREACH_DEPOT } from "@/game/world/town";

export interface FolkDef {
  id: string;
  name: string;
  /** Short dialogue line. */
  line: string;
  continentId: ContinentId;
  x: number;
  y: number;
  /** Sprite fill color. */
  color: string;
  /** If set, E opens this shop instead of (or after) talk. */
  shopId?: string;
  /** If set, dialogue offers the plaza vault. */
  bankId?: string;
  /** Town role — depot clerk opens the Systems bank. */
  role?: "watch" | "shop" | "healer" | "depot" | "townsfolk";
}

export interface ShopStock {
  itemId: ItemId;
  /** Buy price; sell is ~half. */
  price: number;
}

export interface ShopDef {
  id: string;
  name: string;
  continentId: ContinentId;
  /** Marker tile; often coincides with a folk. */
  x: number;
  y: number;
  stock: ShopStock[];
  /** Folk who runs the counter (optional). */
  keeperFolkId?: string;
}

export interface ShipDock {
  id: string;
  name: string;
  continentId: ContinentId;
  x: number;
  y: number;
  /** Ports this ship can sail to. */
  destinations: ContinentId[];
  /** Flavor text keyed by destination continent id. */
  routeFlavor: Partial<Record<ContinentId, string>>;
}

/** Coastal continents that host docks. */
export const COASTAL_CONTINENTS: ContinentId[] = [
  "mistmere",
  "sunken-choir",
  "nightglass-coast",
];

export const FOLK: FolkDef[] = [
  {
    id: "rook",
    name: "Rook",
    line: "Watch-captain of this square. Survive first. Learn the ashwood edge. Progress when the System allows. Needle rats in the basin grass; bark hounds pack from the trees. Shops and the depot sit on the cobbles — talk to folk before you bleed in the grass.",
    continentId: "thornreach",
    x: 22,
    y: 16,
    color: "#6ab84a",
    role: "watch",
  },
  {
    id: "mara-hearth",
    name: "Mara Hearth",
    line: "General store — step inside. Coin for bread, oil, luck-charms, and ashwood edges if you mean to last the grass. If you bleed, find Noll in the hut north of the fountain; if you wander lost, ask Rook. Cress keeps the depot on the south-west cobbles.",
    continentId: "thornreach",
    x: 32,
    y: 17,
    color: "#c9a227",
    shopId: "thornreach-general",
    role: "shop",
  },
  {
    id: "noll",
    name: "Noll",
    line: "Healer of the square. Come in off the cobbles. Draughts and clean wraps — Identify your wounds before they Identify you. Survive. Then learn.",
    continentId: "thornreach",
    x: 25,
    y: 11,
    color: "#8ab87a",
    shopId: "nolls-wraps",
    role: "healer",
  },
  {
    id: "cress-ledger",
    name: "Cress Ledger",
    line: "Depot clerk of Thornhearth. The plaza vault is open — bank coin and packs at this counter before the ashwood takes a bite. What rests here does not drop on death. The fountain square is safe; beasts will not hunt you beside it.",
    continentId: THORNREACH_DEPOT.continentId,
    x: THORNREACH_DEPOT.x,
    y: THORNREACH_DEPOT.y,
    color: "#c9b070",
    role: "depot",
    bankId: "thornreach-vault",
  },
  {
    id: "bram-cooper",
    name: "Bram Cooper",
    line: "Barrels, hoops, and gossip. Watch-captain Rook drinks nothing I seal; Old Tam sits the south bench and remembers more wars than he should.",
    continentId: "thornreach",
    x: 21,
    y: 17,
    color: "#8a6a3a",
    role: "townsfolk",
  },
  {
    id: "liska-ash",
    name: "Liska Ash",
    line: "I light the square at dusk. Lantern-oil from Mara, spark from the fountain rim. Stay on cobble after dark and the mites lose interest.",
    continentId: "thornreach",
    x: 26,
    y: 20,
    color: "#d4a050",
    role: "townsfolk",
  },
  {
    id: "old-tam",
    name: "Old Tam",
    line: "This bench has outlasted two captains. Fountain mends flesh; Cress at the depot will mend your packs. Sit. The ashwood can wait one breath.",
    continentId: "thornreach",
    x: 23,
    y: 20,
    color: "#7a8a6a",
    role: "townsfolk",
  },
  {
    id: "perrin-loaf",
    name: "Perrin Loaf",
    line: "Oven's warm. Hearth-bread and trail biscuit — cheaper than dying hungry. Step under the awning if the square wind bites.",
    continentId: "thornreach",
    x: 28,
    y: 15,
    color: "#c97a4a",
    shopId: "perrin-oven",
    role: "shop",
  },
  {
    id: "wren-quill",
    name: "Wren Quill",
    line: "I copy notices for the square: hunt flags, ship tides, who still owes Mara. If you cannot read the System, I can read it aloud — for a kind word, not coin.",
    continentId: "thornreach",
    x: 25,
    y: 17,
    color: "#6a8aaa",
    role: "townsfolk",
  },
  {
    id: "old-reed",
    name: "Old Reed",
    line: "Outdoor guide of Mistmere. Fog eats footsteps; follow the reed-path and you will not drown. I walk the ashwood skirts when the twin river-clouds show.",
    continentId: "mistmere",
    x: 21,
    y: 19,
    color: "#7ab8c9",
  },
  {
    id: "selene-tide",
    name: "Selene Tide",
    line: "Salt fish, mist-tonics, and fog-wraps off the pier. Mind the tide when you board.",
    continentId: "mistmere",
    x: 28,
    y: 20,
    color: "#5a9aaa",
    shopId: "mistmere-coastal",
  },
  {
    id: "choir-keeper",
    name: "Choir Keeper",
    line: "The drowned hymn still hums underfoot. Rope, oil, and choir-steel if you mean to climb.",
    continentId: "sunken-choir",
    x: 23,
    y: 16,
    color: "#5a9aaa",
    shopId: "choir-stores",
  },
  {
    id: "ash-pilgrim",
    name: "Ash Pilgrim",
    line: "Cinders remember the old wars. Do not camp where the ground still smokes.",
    continentId: "ashen-marches",
    x: 26,
    y: 15,
    color: "#c97a4a",
  },
  {
    id: "nightglass-pilot",
    name: "Captain Vesper",
    line: "Nightglass ships sail by moon-glint. Name a port and we cast off.",
    continentId: "nightglass-coast",
    x: 25,
    y: 21,
    color: "#6a5aaa",
  },
];

export const SHOPS: ShopDef[] = [
  {
    id: "thornreach-general",
    name: "Thornreach General Store",
    continentId: "thornreach",
    x: 32,
    y: 17,
    keeperFolkId: "mara-hearth",
    stock: [
      { itemId: "healing-draught", price: 12 },
      { itemId: "trail-rations", price: 5 },
      { itemId: "hearth-bread", price: 4 },
      { itemId: "thorn-charm", price: 18 },
      { itemId: "lantern-oil", price: 8 },
      { itemId: "fledgling-sword", price: 22 },
      { itemId: "ashwood-hatchet", price: 28 },
      { itemId: "reed-bow", price: 26 },
      { itemId: "fledgling-vest", price: 16 },
      { itemId: "basin-leathers", price: 34 },
      { itemId: "basin-buckler", price: 16 },
    ],
  },
  {
    id: "nolls-wraps",
    name: "Noll's Wraps",
    continentId: "thornreach",
    x: 25,
    y: 11,
    keeperFolkId: "noll",
    stock: [
      { itemId: "healing-draught", price: 11 },
      { itemId: "thorn-charm", price: 16 },
    ],
  },
  {
    id: "perrin-oven",
    name: "Perrin's Oven",
    continentId: "thornreach",
    x: 28,
    y: 15,
    keeperFolkId: "perrin-loaf",
    stock: [
      { itemId: "hearth-bread", price: 3 },
      { itemId: "trail-rations", price: 5 },
    ],
  },
  {
    id: "mistmere-coastal",
    name: "Mistmere Pier Market",
    continentId: "mistmere",
    x: 28,
    y: 20,
    keeperFolkId: "selene-tide",
    stock: [
      { itemId: "salted-fish", price: 6 },
      { itemId: "mistveil-tonic", price: 15 },
      { itemId: "trail-rations", price: 5 },
      { itemId: "rope-coil", price: 10 },
      { itemId: "healing-draught", price: 14 },
      { itemId: "reed-bow", price: 28 },
      { itemId: "mistveil-wrap", price: 48 },
      { itemId: "cloth-wraps", price: 12 },
      { itemId: "thornleaf-wand", price: 26 },
    ],
  },
  {
    id: "choir-stores",
    name: "Choir Cloister Stores",
    continentId: "sunken-choir",
    x: 23,
    y: 16,
    keeperFolkId: "choir-keeper",
    stock: [
      { itemId: "rope-coil", price: 9 },
      { itemId: "lantern-oil", price: 7 },
      { itemId: "healing-draught", price: 13 },
      { itemId: "obsidian-shard", price: 20 },
      { itemId: "trail-rations", price: 6 },
      { itemId: "bark-club", price: 36 },
      { itemId: "thorn-mail", price: 56 },
      { itemId: "choir-dirk", price: 72 },
      { itemId: "bark-shield", price: 38 },
    ],
  },
];

export const SHIP_DOCKS: ShipDock[] = [
  {
    id: "mistmere-pier",
    name: "Mistmere Pier",
    continentId: "mistmere",
    x: 30,
    y: 22,
    destinations: ["sunken-choir", "nightglass-coast"],
    routeFlavor: {
      "sunken-choir": "Through reed fog toward the drowned cloisters.",
      "nightglass-coast": "Westward under a pewter sky to the obsidian strand.",
    },
  },
  {
    id: "choir-landing",
    name: "Choir Landing",
    continentId: "sunken-choir",
    x: 20,
    y: 22,
    destinations: ["mistmere", "nightglass-coast"],
    routeFlavor: {
      mistmere: "North to the mist-soft shores of Mistmere.",
      "nightglass-coast": "A dark crossing to Nightglass cliffs.",
    },
  },
  {
    id: "nightglass-wharf",
    name: "Nightglass Wharf",
    continentId: "nightglass-coast",
    x: 22,
    y: 24,
    destinations: ["mistmere", "sunken-choir"],
    routeFlavor: {
      mistmere: "Moonlit run back to Mistmere's reeds.",
      "sunken-choir": "East along the black water to the Choir.",
    },
  },
];

export function folkOnContinent(id: ContinentId): FolkDef[] {
  return FOLK.filter((f) => f.continentId === id);
}

export function shopsOnContinent(id: ContinentId): ShopDef[] {
  return SHOPS.filter((s) => s.continentId === id);
}

export function docksOnContinent(id: ContinentId): ShipDock[] {
  return SHIP_DOCKS.filter((d) => d.continentId === id);
}

export function getFolk(id: string): FolkDef | undefined {
  return FOLK.find((f) => f.id === id);
}

export function getShop(id: string): ShopDef | undefined {
  return SHOPS.find((s) => s.id === id);
}

export function getDock(id: string): ShipDock | undefined {
  return SHIP_DOCKS.find((d) => d.id === id);
}

/** Arrival tile beside a dock on the destination continent. */
export function dockSpawnForContinent(
  continentId: ContinentId,
): { x: number; y: number } | null {
  const dock = SHIP_DOCKS.find((d) => d.continentId === continentId);
  if (!dock) return null;
  return { x: dock.x - 1, y: dock.y };
}

export function sellPrice(buyPrice: number): number {
  return Math.max(1, Math.floor(buyPrice / 2));
}

/** Depot clerk — also the Systems bank (Cress Vault / thornreach-vault). */
export function getDepotFolk(): FolkDef | undefined {
  return FOLK.find(
    (f) =>
      f.role === "depot" ||
      f.id === THORNREACH_DEPOT.folkId ||
      f.bankId === "thornreach-vault",
  );
}
