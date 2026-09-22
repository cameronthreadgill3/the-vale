import type { Biome } from "./atlas";
import { CONTINENTS, settlement } from "./atlas";
import type { EnemyKind } from "./classes";
import { totalXpForLevel, xpToNext } from "./xp";
import type { InvStack, Loadout } from "./items";
import type { SkillSet } from "./skills";

export type PackEntry = { kind: EnemyKind; w: number };

export type HuntingGround = {
  id: string;
  name: string;
  /** Exact settlement id, or empty to match biome. */
  settlement: string;
  biome?: Biome;
  ox: number;
  oy: number;
  radius: number;
  rec: [number, number];
  pack: PackEntry[];
  unique?: { kind: EnemyKind; name: string; p: number };
  blurb: string;
};

export type DungeonTheme = "crypt" | "barrow" | "ash" | "tide" | "root" | "glass" | "frost" | "mine";

export type ValeDungeon = {
  name: string;
  theme: DungeonTheme;
  rec: [number, number];
  pack: PackEntry[];
  boss: { kind: EnemyKind; name: string };
  blurb: string;
};

export const GROUNDS: HuntingGround[] = [
  {
    id: "nettle-copse",
    name: "Nettle Copse",
    settlement: "thornvale-thornhearth",
    ox: -22,
    oy: -6,
    radius: 14,
    rec: [1, 8],
    pack: [
      { kind: "goblin", w: 5 },
      { kind: "wisp", w: 3 },
    ],
    unique: { kind: "wisp", name: "The Copse Candle", p: 0.08 },
    blurb: "First hunt. Wisps among the nettle west of the fountain.",
  },
  {
    id: "millford-run",
    name: "Millford Run",
    settlement: "thornvale-millford",
    ox: 18,
    oy: 6,
    radius: 14,
    rec: [6, 14],
    pack: [
      { kind: "wolf", w: 6 },
      { kind: "goblin", w: 2 },
    ],
    unique: { kind: "wolf", name: "Grey-Mane of the Mill", p: 0.07 },
    blurb: "Wolves along the mill race. A first real grind.",
  },
  {
    id: "copse-mounds",
    name: "Copsebarrow Mounds",
    settlement: "thornvale-copsebarrow",
    ox: -16,
    oy: 18,
    radius: 16,
    rec: [12, 24],
    pack: [
      { kind: "wight", w: 5 },
      { kind: "skeleton", w: 4 },
      { kind: "wolf", w: 1 },
    ],
    unique: { kind: "wight", name: "Holt of the First Barrow", p: 0.08 },
    blurb: "Burial hills. Three hours of honest hunting lands you here.",
  },
  {
    id: "ashfield-cinders",
    name: "Ashfield Cinders",
    settlement: "thornvale-ashfield",
    ox: -20,
    oy: 8,
    radius: 15,
    rec: [16, 28],
    pack: [
      { kind: "cinder", w: 5 },
      { kind: "orc", w: 3 },
    ],
    unique: { kind: "cinder", name: "The Kiln That Walks", p: 0.07 },
    blurb: "Warm ground. Cinderlings and the orcs who tend them.",
  },
  {
    id: "saltwick-flats",
    name: "Saltwick Flats",
    settlement: "thornvale-saltwick",
    ox: 4,
    oy: 22,
    radius: 16,
    rec: [8, 18],
    pack: [
      { kind: "crab", w: 6 },
      { kind: "goblin", w: 2 },
    ],
    unique: { kind: "crab", name: "Old Salt-Claw", p: 0.07 },
    blurb: "Tide pools south of the quay. Crabs keep the flats.",
  },
  {
    id: "greenwatch-deep",
    name: "Greenwatch Deepwood",
    settlement: "thornvale-greenwatch",
    ox: -8,
    oy: -22,
    radius: 18,
    rec: [14, 28],
    pack: [
      { kind: "wolf", w: 4 },
      { kind: "wisp", w: 3 },
      { kind: "wight", w: 2 },
    ],
    unique: { kind: "wolf", name: "The Greenwatch Hart-Wolf", p: 0.06 },
    blurb: "Old trees. Wisps and wolves share the same hush.",
  },
  {
    id: "cinder-caldera",
    name: "Cindermere Caldera",
    settlement: "thornvale-cindermere",
    ox: -24,
    oy: -10,
    radius: 18,
    rec: [24, 42],
    pack: [
      { kind: "drake", w: 4 },
      { kind: "cinder", w: 4 },
      { kind: "orc", w: 2 },
    ],
    unique: { kind: "drake", name: "Caldera Wyrm", p: 0.05 },
    blurb: "The fire-shelf. Bring draughts.",
  },
  {
    id: "redhollow-reavers",
    name: "Redhollow Cut",
    settlement: "thornvale-redhollow",
    ox: 18,
    oy: 12,
    radius: 14,
    rec: [20, 34],
    pack: [
      { kind: "orc", w: 6 },
      { kind: "skeleton", w: 2 },
    ],
    unique: { kind: "orc", name: "Brak of the Cut", p: 0.06 },
    blurb: "Orcs hold the red ditch. Good steel if you live.",
  },
  {
    id: "fairbarrow-road",
    name: "Fairbarrow Wight-Road",
    settlement: "thornvale-fairbarrow",
    ox: -14,
    oy: -16,
    radius: 14,
    rec: [14, 24],
    pack: [
      { kind: "wight", w: 5 },
      { kind: "skeleton", w: 3 },
    ],
    unique: { kind: "hag", name: "The Road-Widow", p: 0.05 },
    blurb: "A path the dead still walk.",
  },
  {
    id: "kingsport-smug",
    name: "Kingsport Salt-Caves",
    settlement: "thornvale-kingsport",
    ox: 20,
    oy: 16,
    radius: 14,
    rec: [10, 20],
    pack: [
      { kind: "crab", w: 4 },
      { kind: "orc", w: 3 },
      { kind: "goblin", w: 2 },
    ],
    unique: { kind: "hag", name: "Tide Mother", p: 0.05 },
    blurb: "Smugglers' water. Crabs and worse.",
  },
  {
    id: "dawnhold-light",
    name: "Dawnhold Lightwell",
    settlement: "thornvale-dawnhold",
    ox: 20,
    oy: -12,
    radius: 13,
    rec: [18, 30],
    pack: [
      { kind: "skeleton", w: 4 },
      { kind: "wight", w: 3 },
      { kind: "orc", w: 2 },
    ],
    unique: { kind: "hollowking", name: "The Unsworn", p: 0.04 },
    blurb: "A well that forgot the dawn.",
  },
  {
    id: "nettleford-wisps",
    name: "Nettleford Lanterns",
    settlement: "thornvale-nettleford",
    ox: 12,
    oy: -18,
    radius: 13,
    rec: [4, 12],
    pack: [
      { kind: "wisp", w: 6 },
      { kind: "goblin", w: 2 },
    ],
    unique: { kind: "wisp", name: "Seven-Lights", p: 0.08 },
    blurb: "A field that blinks after rain.",
  },
];

const BIOME_GROUNDS: Record<Biome, Omit<HuntingGround, "id" | "settlement">[]> = {
  vale: [
    {
      name: "The Outer Copse",
      ox: -20,
      oy: 10,
      radius: 14,
      rec: [1, 12],
      pack: [
        { kind: "goblin", w: 4 },
        { kind: "wisp", w: 3 },
        { kind: "wolf", w: 2 },
      ],
      unique: { kind: "wisp", name: "A stray lantern", p: 0.06 },
      blurb: "The vale's usual work.",
    },
  ],
  coast: [
    {
      name: "The Salt Shelf",
      ox: 8,
      oy: 22,
      radius: 16,
      rec: [8, 22],
      pack: [
        { kind: "crab", w: 5 },
        { kind: "orc", w: 2 },
        { kind: "goblin", w: 2 },
      ],
      unique: { kind: "crab", name: "The Quay's Debt", p: 0.06 },
      blurb: "Tide and claw.",
    },
  ],
  marsh: [
    {
      name: "The Reed-Dark",
      ox: -18,
      oy: 16,
      radius: 16,
      rec: [12, 26],
      pack: [
        { kind: "hag", w: 2 },
        { kind: "wisp", w: 4 },
        { kind: "skeleton", w: 3 },
      ],
      unique: { kind: "hag", name: "Sister of the Fen", p: 0.07 },
      blurb: "Black water. Bring a light.",
    },
  ],
  ember: [
    {
      name: "The Ember Shelf",
      ox: -22,
      oy: -8,
      radius: 16,
      rec: [22, 40],
      pack: [
        { kind: "cinder", w: 5 },
        { kind: "drake", w: 3 },
        { kind: "orc", w: 2 },
      ],
      unique: { kind: "drake", name: "Ash-That-Remembers", p: 0.05 },
      blurb: "Warm stone and worse tempers.",
    },
  ],
  peak: [
    {
      name: "The Wind Stair",
      ox: 16,
      oy: -20,
      radius: 14,
      rec: [18, 32],
      pack: [
        { kind: "orc", w: 4 },
        { kind: "wolf", w: 3 },
        { kind: "skeleton", w: 2 },
      ],
      unique: { kind: "orc", name: "Highmerrow's Debt-Orc", p: 0.05 },
      blurb: "Thin air. Thick hides.",
    },
  ],
  wood: [
    {
      name: "The Hush-Between",
      ox: -10,
      oy: -22,
      radius: 18,
      rec: [14, 30],
      pack: [
        { kind: "wisp", w: 3 },
        { kind: "wolf", w: 4 },
        { kind: "wight", w: 2 },
      ],
      unique: { kind: "wight", name: "The First Root", p: 0.05 },
      blurb: "Trees older than the towns.",
    },
  ],
  waste: [
    {
      name: "The Mirror Dunes",
      ox: 20,
      oy: 8,
      radius: 18,
      rec: [32, 55],
      pack: [
        { kind: "shrike", w: 6 },
        { kind: "drake", w: 2 },
        { kind: "cinder", w: 2 },
      ],
      unique: { kind: "shrike", name: "Glass-That-Hunts", p: 0.06 },
      blurb: "Nothing grows. The shrikes do not mind.",
    },
  ],
  ice: [
    {
      name: "The Quiet Shelf",
      ox: 12,
      oy: -18,
      radius: 16,
      rec: [20, 38],
      pack: [
        { kind: "wolf", w: 4 },
        { kind: "wight", w: 4 },
        { kind: "skeleton", w: 2 },
      ],
      unique: { kind: "wight", name: "The Frozen Holt", p: 0.05 },
      blurb: "White ground. Older bones.",
    },
  ],
};

const DUNGEON_BY_SETTLEMENT: Record<string, ValeDungeon> = {
  "thornvale-thornhearth": {
    name: "Thornhearth Hollow",
    theme: "crypt",
    rec: [4, 12],
    pack: [
      { kind: "skeleton", w: 5 },
      { kind: "goblin", w: 3 },
      { kind: "wight", w: 1 },
    ],
    boss: { kind: "hollowking", name: "The Hollow King" },
    blurb: "The first crypt. Bones that remember the fountain.",
  },
  "thornvale-copsebarrow": {
    name: "Copsebarrow Barrow",
    theme: "barrow",
    rec: [16, 28],
    pack: [
      { kind: "wight", w: 6 },
      { kind: "skeleton", w: 3 },
    ],
    boss: { kind: "wight", name: "Holt of the First Barrow" },
    blurb: "A three-hour walker's proper crypt. The first Holt still sits.",
  },
  "thornvale-cindermere": {
    name: "The Ashvault",
    theme: "ash",
    rec: [22, 40],
    pack: [
      { kind: "cinder", w: 5 },
      { kind: "orc", w: 3 },
      { kind: "drake", w: 1 },
    ],
    boss: { kind: "drake", name: "Caldera Wyrm" },
    blurb: "A mage-spire's basement. Still warm.",
  },
  "thornvale-kingsport": {
    name: "Smuggler's Hold",
    theme: "tide",
    rec: [10, 20],
    pack: [
      { kind: "crab", w: 4 },
      { kind: "orc", w: 3 },
      { kind: "goblin", w: 2 },
    ],
    boss: { kind: "hag", name: "Tide Mother" },
    blurb: "Salt in the stone. The quay denies it.",
  },
  "thornvale-saltwick": {
    name: "The Tide Caves",
    theme: "tide",
    rec: [8, 18],
    pack: [
      { kind: "crab", w: 6 },
      { kind: "skeleton", w: 2 },
    ],
    boss: { kind: "crab", name: "Old Salt-Claw" },
    blurb: "A cave the sea still owns.",
  },
  "thornvale-greenwatch": {
    name: "Root-Hold",
    theme: "root",
    rec: [14, 26],
    pack: [
      { kind: "wisp", w: 4 },
      { kind: "wolf", w: 3 },
      { kind: "wight", w: 2 },
    ],
    boss: { kind: "hag", name: "The Greenwatch Widow" },
    blurb: "Roots thicker than beams.",
  },
  "thornvale-dawnhold": {
    name: "The Lightwell",
    theme: "crypt",
    rec: [18, 30],
    pack: [
      { kind: "skeleton", w: 4 },
      { kind: "wight", w: 3 },
    ],
    boss: { kind: "hollowking", name: "The Unsworn" },
    blurb: "A well that forgot the dawn.",
  },
  "thornvale-ashfield": {
    name: "The Kiln Crypt",
    theme: "ash",
    rec: [16, 28],
    pack: [
      { kind: "cinder", w: 5 },
      { kind: "skeleton", w: 3 },
    ],
    boss: { kind: "cinder", name: "The Kiln That Walks" },
    blurb: "Ovens that never cooled.",
  },
};

const THEME_BY_BIOME: Record<Biome, DungeonTheme> = {
  vale: "crypt",
  coast: "tide",
  marsh: "root",
  ember: "ash",
  peak: "mine",
  wood: "root",
  waste: "glass",
  ice: "frost",
};

const BOSS_BY_THEME: Record<DungeonTheme, { kind: EnemyKind; name: string }> = {
  crypt: { kind: "hollowking", name: "A Hollow Crown" },
  barrow: { kind: "wight", name: "The Barrow's First" },
  ash: { kind: "drake", name: "The Vault Wyrm" },
  tide: { kind: "hag", name: "The Cave-Mother" },
  root: { kind: "hag", name: "Sister Under-Root" },
  glass: { kind: "shrike", name: "Mirror-That-Rules" },
  frost: { kind: "wight", name: "The Quiet King" },
  mine: { kind: "orc", name: "The Deep Foreman" },
};

const PACK_BY_THEME: Record<DungeonTheme, PackEntry[]> = {
  crypt: [
    { kind: "skeleton", w: 5 },
    { kind: "wight", w: 2 },
  ],
  barrow: [
    { kind: "wight", w: 5 },
    { kind: "skeleton", w: 3 },
  ],
  ash: [
    { kind: "cinder", w: 5 },
    { kind: "orc", w: 2 },
  ],
  tide: [
    { kind: "crab", w: 5 },
    { kind: "skeleton", w: 2 },
  ],
  root: [
    { kind: "wisp", w: 4 },
    { kind: "wight", w: 3 },
  ],
  glass: [
    { kind: "shrike", w: 5 },
    { kind: "cinder", w: 2 },
  ],
  frost: [
    { kind: "wight", w: 4 },
    { kind: "wolf", w: 3 },
  ],
  mine: [
    { kind: "orc", w: 5 },
    { kind: "skeleton", w: 2 },
  ],
};

export const THEME_LIGHT: Record<DungeonTheme, { veil: string; torch: string; floor: number }> = {
  crypt: { veil: "rgba(8,10,16,0.62)", torch: "rgba(210,180,120,0.22)", floor: 8 },
  barrow: { veil: "rgba(16,14,10,0.58)", torch: "rgba(200,170,90,0.2)", floor: 8 },
  ash: { veil: "rgba(28,10,8,0.52)", torch: "rgba(240,120,60,0.28)", floor: 4 },
  tide: { veil: "rgba(6,14,22,0.6)", torch: "rgba(90,160,190,0.2)", floor: 8 },
  root: { veil: "rgba(8,16,10,0.55)", torch: "rgba(140,180,90,0.18)", floor: 0 },
  glass: { veil: "rgba(18,16,22,0.55)", torch: "rgba(200,190,230,0.2)", floor: 14 },
  frost: { veil: "rgba(10,16,22,0.58)", torch: "rgba(170,200,230,0.2)", floor: 8 },
  mine: { veil: "rgba(12,10,8,0.64)", torch: "rgba(220,160,70,0.22)", floor: 4 },
};

export function groundsFor(locationId: string): HuntingGround[] {
  const named = GROUNDS.filter((g) => g.settlement === locationId);
  if (named.length) return named;
  const s = settlement(locationId);
  const biome = CONTINENTS[s.continent].biome;
  return (BIOME_GROUNDS[biome] ?? BIOME_GROUNDS.vale).map((g, i) => ({
    ...g,
    id: `${locationId}-hunt-${i}`,
    settlement: locationId,
    biome,
  }));
}

export function groundAt(locationId: string, x: number, y: number, townX: number, townY: number, tile: number): HuntingGround | null {
  const list = groundsFor(locationId);
  let best: HuntingGround | null = null;
  let bestD = Infinity;
  for (const g of list) {
    const gx = townX + g.ox * tile;
    const gy = townY + g.oy * tile;
    const d = Math.hypot(x - gx, y - gy) / tile;
    if (d <= g.radius && d < bestD) {
      best = g;
      bestD = d;
    }
  }
  return best;
}

export function pickFromPack(pack: PackEntry[]): EnemyKind {
  let total = 0;
  for (const p of pack) total += p.w;
  let r = Math.random() * total;
  for (const p of pack) {
    r -= p.w;
    if (r <= 0) return p.kind;
  }
  return pack[0]?.kind ?? "goblin";
}

export function dungeonFor(locationId: string): ValeDungeon {
  const named = DUNGEON_BY_SETTLEMENT[locationId];
  if (named) return named;
  const s = settlement(locationId);
  const biome = CONTINENTS[s.continent].biome;
  const theme = THEME_BY_BIOME[biome];
  const boss = BOSS_BY_THEME[theme];
  return {
    name: `${s.name} ${theme === "tide" ? "Caves" : theme === "ash" ? "Ashvault" : theme === "root" ? "Root-Hold" : theme === "glass" ? "Mirror Tomb" : theme === "frost" ? "Ice-Crypt" : theme === "mine" ? "Deep" : theme === "barrow" ? "Barrow" : "Hollow"}`,
    theme,
    rec: [6 + CONTINENTS[s.continent].danger * 6, 16 + CONTINENTS[s.continent].danger * 10],
    pack: PACK_BY_THEME[theme],
    boss,
    blurb: `The dark under ${s.name}.`,
  };
}

export function isRangedKind(kind: EnemyKind) {
  return kind === "drake" || kind === "wisp" || kind === "shrike" || kind === "cinder";
}

export const ENEMY_SPRITE_IDS: EnemyKind[] = [
  "goblin",
  "wolf",
  "skeleton",
  "orc",
  "drake",
  "wisp",
  "wight",
  "cinder",
  "crab",
  "shrike",
  "hag",
  "hollowking",
];

/** A walker after about three hours of Tibia-paced hunting. */
export function threeHourKeep(): {
  level: number;
  xp: number;
  score: number;
  gold: number;
  locationId: string;
  skills: SkillSet;
  worn: Loadout;
  pack: InvStack[];
} {
  const level = 22;
  return {
    level,
    xp: totalXpForLevel(level) + Math.floor(xpToNext(level) * 0.42),
    score: 48620,
    gold: 1840,
    locationId: "thornvale-copsebarrow",
    skills: {
      fight: { level: 28, tries: 40 },
      magic: { level: 8, tries: 12 },
      shielding: { level: 24, tries: 30 },
    },
    worn: {
      weapon: "melee_dawn",
      offhand: "ward_dawn",
      helm: "helm_iron",
      chest: "chest_raven",
      legs: "legs_iron",
      boots: "boots_thorn",
      amulet: "amulet_thorn",
      ring: "ring_thorn",
    },
    pack: [
      { item: "health_potion", qty: 8 },
      { item: "mana_potion", qty: 4 },
      { item: "stew", qty: 3 },
      { item: "wight_shroud", qty: 6 },
      { item: "bone", qty: 11 },
      { item: "wolf_pelt", qty: 4 },
      { item: "barrow_signet", qty: 1 },
    ],
  };
}
