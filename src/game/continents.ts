/** Eight continents of Thornvale — lore, biome tint, and gate graph. */

export type ContinentId =
  | "thornreach"
  | "mistmere"
  | "ashen-marches"
  | "sunken-choir"
  | "embercoil"
  | "pale-wastes"
  | "verdant-spine"
  | "nightglass-coast";

export interface BiomePalette {
  grass: string;
  grassAlt: string;
  dirt: string;
  path: string;
  stone: string;
  water: string;
  flower: string;
  gate: string;
  hollow: string;
  exit: string;
}

export interface ContinentDef {
  id: ContinentId;
  name: string;
  blurb: string;
  /** Prefixed into overworld / hollow seed strings. */
  seedPrefix: string;
  palette: BiomePalette;
  /** Extra chance weight for water tiles (0–1 bias). */
  waterBias: number;
  stoneBias: number;
  flowerBias: number;
  /** Default overworld spawn (tile coords). */
  spawn: { x: number; y: number };
  /** Gate destinations reachable from this continent. */
  gates: ContinentId[];
  /** Number of hollow entrances on the overworld. */
  hollowCount: number;
}

/** Fixed world seed mixed into every map. */
export const WORLD_SEED = "thornvale-world-v1";

export const STARTER_CONTINENT: ContinentId = "thornreach";

export const CONTINENTS: ContinentDef[] = [
  {
    id: "thornreach",
    name: "Thornreach",
    blurb: "Basin grass clearings under ashwood — dark gray bark, silver-edged green leaves; twin river-cloud bands above. Where the Vale first opens its gates.",
    seedPrefix: "thornreach",
    palette: {
      grass: "#1e3c26",
      grassAlt: "#264a2e",
      dirt: "#3a2f1f",
      path: "#4a3d28",
      stone: "#2a2e2e",
      water: "#1a2a3a",
      flower: "#3a2840",
      gate: "#c9a227",
      hollow: "#5a3a6a",
      exit: "#8a6a3a",
    },
    waterBias: 0.06,
    stoneBias: 0.04,
    flowerBias: 0.05,
    spawn: { x: 24, y: 18 },
    gates: ["mistmere", "verdant-spine", "ashen-marches"],
    hollowCount: 3,
  },
  {
    id: "mistmere",
    name: "Mistmere",
    blurb: "Fog-soft shores and reed-choked meres that swallow sound.",
    seedPrefix: "mistmere",
    palette: {
      grass: "#1a3330",
      grassAlt: "#21403c",
      dirt: "#2e3530",
      path: "#3a4540",
      stone: "#2a3238",
      water: "#1a3548",
      flower: "#2a3840",
      gate: "#7ab8c9",
      hollow: "#3a4a5a",
      exit: "#6a8090",
    },
    waterBias: 0.14,
    stoneBias: 0.03,
    flowerBias: 0.03,
    spawn: { x: 24, y: 18 },
    gates: ["thornreach", "sunken-choir", "nightglass-coast"],
    hollowCount: 2,
  },
  {
    id: "ashen-marches",
    name: "Ashen Marches",
    blurb: "Charred steppe where old wars left cinders underfoot.",
    seedPrefix: "ashen",
    palette: {
      grass: "#2a2820",
      grassAlt: "#322e24",
      dirt: "#3a3228",
      path: "#4a4034",
      stone: "#383430",
      water: "#1a2228",
      flower: "#4a3020",
      gate: "#c97a4a",
      hollow: "#4a3030",
      exit: "#8a6040",
    },
    waterBias: 0.04,
    stoneBias: 0.08,
    flowerBias: 0.02,
    spawn: { x: 24, y: 18 },
    gates: ["thornreach", "embercoil", "pale-wastes"],
    hollowCount: 2,
  },
  {
    id: "sunken-choir",
    name: "Sunken Choir",
    blurb: "Half-drowned cloisters where stone still hums a drowned hymn.",
    seedPrefix: "sunken",
    palette: {
      grass: "#1a2e2a",
      grassAlt: "#223832",
      dirt: "#2a3430",
      path: "#3a4844",
      stone: "#2c3840",
      water: "#153848",
      flower: "#2a4050",
      gate: "#5a9aaa",
      hollow: "#2a3a48",
      exit: "#5a7080",
    },
    waterBias: 0.18,
    stoneBias: 0.06,
    flowerBias: 0.02,
    spawn: { x: 24, y: 18 },
    gates: ["mistmere", "nightglass-coast"],
    hollowCount: 2,
  },
  {
    id: "embercoil",
    name: "Embercoil",
    blurb: "Coiled ridges of slag and glow — heat without mercy.",
    seedPrefix: "embercoil",
    palette: {
      grass: "#3a2818",
      grassAlt: "#442e1c",
      dirt: "#4a3020",
      path: "#5a3a28",
      stone: "#3a2820",
      water: "#2a1810",
      flower: "#5a2010",
      gate: "#e07030",
      hollow: "#4a2018",
      exit: "#a05020",
    },
    waterBias: 0.03,
    stoneBias: 0.1,
    flowerBias: 0.04,
    spawn: { x: 24, y: 18 },
    gates: ["ashen-marches", "pale-wastes"],
    hollowCount: 2,
  },
  {
    id: "pale-wastes",
    name: "Pale Wastes",
    blurb: "Bone-white flats and thin ice that never quite melts.",
    seedPrefix: "pale",
    palette: {
      grass: "#2a3230",
      grassAlt: "#323a38",
      dirt: "#3a4040",
      path: "#4a5050",
      stone: "#3a4248",
      water: "#1a2838",
      flower: "#3a3848",
      gate: "#a8c0d0",
      hollow: "#2a3038",
      exit: "#7090a0",
    },
    waterBias: 0.08,
    stoneBias: 0.07,
    flowerBias: 0.02,
    spawn: { x: 24, y: 18 },
    gates: ["ashen-marches", "embercoil", "verdant-spine"],
    hollowCount: 2,
  },
  {
    id: "verdant-spine",
    name: "Verdant Spine",
    blurb: "A green ridge of deep ashwood and thorn-crowned peaks — silver-edged canopy over basin grass.",
    seedPrefix: "verdant",
    palette: {
      grass: "#1a4028",
      grassAlt: "#224c30",
      dirt: "#2e3a22",
      path: "#3a4a2e",
      stone: "#2a3228",
      water: "#1a2e30",
      flower: "#3a4830",
      gate: "#6ab84a",
      hollow: "#2a3a28",
      exit: "#5a8a40",
    },
    waterBias: 0.05,
    stoneBias: 0.05,
    flowerBias: 0.07,
    spawn: { x: 24, y: 18 },
    gates: ["thornreach", "pale-wastes", "nightglass-coast"],
    hollowCount: 3,
  },
  {
    id: "nightglass-coast",
    name: "Nightglass Coast",
    blurb: "Obsidian strand and moonlit cliffs that drink the tide.",
    seedPrefix: "nightglass",
    palette: {
      grass: "#1a2230",
      grassAlt: "#222838",
      dirt: "#2a2838",
      path: "#3a3848",
      stone: "#282830",
      water: "#101828",
      flower: "#302040",
      gate: "#6a5aaa",
      hollow: "#1a1828",
      exit: "#5a4a8a",
    },
    waterBias: 0.12,
    stoneBias: 0.06,
    flowerBias: 0.04,
    spawn: { x: 24, y: 18 },
    gates: ["mistmere", "sunken-choir", "verdant-spine"],
    hollowCount: 2,
  },
];

export const CONTINENT_IDS: ContinentId[] = CONTINENTS.map((c) => c.id);

export function getContinent(id: ContinentId): ContinentDef {
  const found = CONTINENTS.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown continent: ${id}`);
  return found;
}

export function isContinentId(v: unknown): v is ContinentId {
  return typeof v === "string" && CONTINENT_IDS.includes(v as ContinentId);
}
