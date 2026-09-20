/** Named folk, shops, and coastal ship docks for Thornvale. */

import type { ContinentId } from "@/game/continents";
import type { ItemId } from "@/game/items";

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
    id: "briar-ward",
    name: "Briar Ward",
    line: "Thornreach holds the first gate. Keep your blade oiled and your path chosen.",
    continentId: "thornreach",
    x: 22,
    y: 16,
    color: "#6ab84a",
  },
  {
    id: "mara-hearth",
    name: "Mara Hearth",
    line: "Coin for bread, oil, and luck-charms — the Vale runs on small mercies.",
    continentId: "thornreach",
    x: 27,
    y: 17,
    color: "#c9a227",
    shopId: "thornreach-general",
  },
  {
    id: "old-reed",
    name: "Old Reed",
    line: "Fog eats footsteps here. Follow the reed-path and you will not drown.",
    continentId: "mistmere",
    x: 21,
    y: 19,
    color: "#7ab8c9",
  },
  {
    id: "selene-tide",
    name: "Selene Tide",
    line: "Salt fish and mist-tonics off the pier. Mind the tide when you board.",
    continentId: "mistmere",
    x: 28,
    y: 20,
    color: "#5a9aaa",
    shopId: "mistmere-coastal",
  },
  {
    id: "choir-keeper",
    name: "Choir Keeper",
    line: "The drowned hymn still hums underfoot. Buy rope if you mean to climb.",
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
    x: 27,
    y: 17,
    keeperFolkId: "mara-hearth",
    stock: [
      { itemId: "healing-draught", price: 12 },
      { itemId: "trail-rations", price: 5 },
      { itemId: "hearth-bread", price: 4 },
      { itemId: "thorn-charm", price: 18 },
      { itemId: "lantern-oil", price: 8 },
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
