export type SettlementKind = "city" | "town" | "village";
export type Biome = "vale" | "coast" | "marsh" | "ember" | "peak" | "wood" | "waste" | "ice";
export type TravelMode = "road" | "ship" | "gate";

export type ContinentId =
  | "thornvale"
  | "saltreach"
  | "greyfen"
  | "emberfold"
  | "highmerrow"
  | "duskwood"
  | "glasswaste"
  | "wintermere";

export type Continent = {
  id: ContinentId;
  name: string;
  biome: Biome;
  blurb: string;
  danger: number;
};

export type Settlement = {
  id: string;
  continent: ContinentId;
  name: string;
  kind: SettlementKind;
  x: number;
  y: number;
  seed: number;
  port: boolean;
  portal: boolean;
  shop: boolean;
  roads: string[];
};

export type Passage = {
  a: string;
  b: string;
  mode: TravelMode;
  gold: number;
  note: string;
};

export const START_ID = "thornvale-thornhearth";

export const CONTINENTS: Record<ContinentId, Continent> = {
  thornvale: {
    id: "thornvale",
    name: "Thornvale",
    biome: "vale",
    blurb: "The first continent. Fountain towns, copse, and a south sea.",
    danger: 1,
  },
  saltreach: {
    id: "saltreach",
    name: "Saltreach",
    biome: "coast",
    blurb: "Broken isles and a wide current. Ships live here.",
    danger: 2,
  },
  greyfen: {
    id: "greyfen",
    name: "Greyfen",
    biome: "marsh",
    blurb: "Reed and black water west of the Vale.",
    danger: 2,
  },
  emberfold: {
    id: "emberfold",
    name: "Emberfold",
    biome: "ember",
    blurb: "The southern fire-shelf. Ash, glass, and a mage spire.",
    danger: 3,
  },
  highmerrow: {
    id: "highmerrow",
    name: "Highmerrow",
    biome: "peak",
    blurb: "The north wall. Stone cities in the wind.",
    danger: 3,
  },
  duskwood: {
    id: "duskwood",
    name: "Duskwood",
    biome: "wood",
    blurb: "Old forest. Roads fail; the moon-well still answers.",
    danger: 3,
  },
  glasswaste: {
    id: "glasswaste",
    name: "Glasswaste",
    biome: "waste",
    blurb: "Sand eats the weave. Only ships cross the hot current.",
    danger: 4,
  },
  wintermere: {
    id: "wintermere",
    name: "Wintermere",
    biome: "ice",
    blurb: "The last ice. A north run from Highmerrow, or a frozen gate.",
    danger: 4,
  },
};

export const CONTINENT_ORDER: ContinentId[] = [
  "thornvale",
  "saltreach",
  "greyfen",
  "emberfold",
  "highmerrow",
  "duskwood",
  "glasswaste",
  "wintermere",
];

type Spec = { name: string; kind: SettlementKind; x: number; y: number; port?: boolean; portal?: boolean; shop?: boolean };

const THORNVALE: Spec[] = [
  { name: "Thornhearth", kind: "city", x: 50, y: 50, shop: true },
  { name: "Kingsport", kind: "city", x: 54, y: 88, port: true, shop: true },
  { name: "Cindermere", kind: "city", x: 16, y: 46, portal: true, shop: true },
  { name: "Dawnhold", kind: "city", x: 84, y: 44, shop: true },
  { name: "Greenwatch", kind: "city", x: 48, y: 14, shop: true },
  { name: "Millford", kind: "town", x: 40, y: 58, shop: true },
  { name: "Hearthcross", kind: "town", x: 60, y: 58, shop: true },
  { name: "Bridlemere", kind: "town", x: 62, y: 74, shop: true },
  { name: "Saltwick", kind: "town", x: 42, y: 80, shop: true },
  { name: "Oakrest", kind: "town", x: 36, y: 28, shop: true },
  { name: "Stoneford", kind: "town", x: 70, y: 28, shop: true },
  { name: "Ashfield", kind: "town", x: 28, y: 60, shop: true },
  { name: "Ravenford", kind: "town", x: 74, y: 60, shop: true },
  { name: "Whitebrook", kind: "town", x: 56, y: 34, shop: true },
  { name: "Copsebarrow", kind: "town", x: 40, y: 38, shop: true },
  { name: "Longacre", kind: "town", x: 62, y: 48, shop: true },
  { name: "Redhollow", kind: "town", x: 72, y: 76, shop: true },
  { name: "Fairbarrow", kind: "town", x: 32, y: 72, shop: true },
  { name: "Nettleford", kind: "town", x: 80, y: 22, shop: true },
  { name: "Lowmarch", kind: "town", x: 22, y: 76, shop: true },
  { name: "Puddlewick", kind: "village", x: 46, y: 64 },
  { name: "Lambslea", kind: "village", x: 56, y: 64 },
  { name: "Bramble", kind: "village", x: 34, y: 50 },
  { name: "Wesset", kind: "village", x: 66, y: 40 },
  { name: "Dunroot", kind: "village", x: 44, y: 22 },
  { name: "Harebell", kind: "village", x: 58, y: 20 },
  { name: "Thatcham", kind: "village", x: 26, y: 38 },
  { name: "Gorside", kind: "village", x: 88, y: 56 },
  { name: "Mottle", kind: "village", x: 48, y: 76 },
  { name: "Ivyknot", kind: "village", x: 38, y: 44 },
  { name: "Reedfen", kind: "village", x: 24, y: 66 },
  { name: "Stump", kind: "village", x: 70, y: 18 },
  { name: "Yarrow", kind: "village", x: 78, y: 68 },
  { name: "Cobble", kind: "village", x: 52, y: 42 },
  { name: "Finchley", kind: "village", x: 64, y: 32 },
  { name: "Mossgate", kind: "village", x: 30, y: 22 },
  { name: "Barley", kind: "village", x: 68, y: 54 },
  { name: "Clover", kind: "village", x: 44, y: 70 },
  { name: "Wain", kind: "village", x: 80, y: 82 },
  { name: "Pebblebrook", kind: "village", x: 36, y: 86 },
];

const CITY_NAMES: Record<ContinentId, [string, string, string, string, string]> = {
  thornvale: ["Thornhearth", "Kingsport", "Cindermere", "Dawnhold", "Greenwatch"],
  saltreach: ["Harborrow", "Coralkeep", "Galespire", "Shellmere", "Tidewatch"],
  greyfen: ["Fenport", "Mirehold", "Reedkeep", "Blackwater", "Mossbarrow"],
  emberfold: ["Ashspire", "Cinderquay", "Basalt", "Pyrehold", "Slagford"],
  highmerrow: ["Skyhold", "Frostgate", "Granite", "Windmere", "Ridgewatch"],
  duskwood: ["Moonwell", "Shadequay", "Rootkeep", "Veilford", "Nightcopse"],
  glasswaste: ["Sunspire", "Duneport", "Mirage", "Saltglass", "Bonewell"],
  wintermere: ["Icehaven", "Rimehold", "Palequay", "Snowmere", "Lastlight"],
};

const TOWN_NAMES: Record<ContinentId, string[]> = {
  thornvale: [],
  saltreach: ["Brineford", "Gullcross", "Wavecrest", "Mastfield", "Kelpbarrow", "Spraywick", "Anchorford", "Driftacre", "Shingle", "Capelea", "Netsend", "Pilots Rest", "Siltmere", "Boomcross", "Leeharth"],
  greyfen: ["Sunkroad", "Peatwick", "Heronford", "Leechacre", "Fogbarrow", "Stillmere", "Bogcross", "Rushfield", "Eelwick", "Dampford", "Cattail", "Muckend", "Plover", "Sedge", "Lowferry"],
  emberfold: ["Charford", "Emberwick", "Scoria", "Kilnacre", "Ashbarrow", "Magmaford", "Cinderlea", "Heatcross", "Obsidian", "Fumarole", "Coalmere", "Sparkfield", "Brimstone", "Forgeend", "Lavaford"],
  highmerrow: ["Cragford", "Passwick", "Scree", "Hailacre", "Stonebarrow", "Goatford", "Cliffcross", "Eyrie", "Tarnfield", "Switchback", "Kestrel", "Col", "Hornmere", "Avalanche", "Pinehold"],
  duskwood: ["Gloomford", "Fernwick", "Hollowacre", "Owlbarrow", "Mossford", "Twigcross", "Canopy", "Stagfield", "Nightlea", "Webend", "Toadstool", "Glen", "Barrowmere", "Shadeacre", "Rootend"],
  glasswaste: ["Duneacre", "Heatwick", "Caravan", "Oasisford", "Saltbarrow", "Miragelea", "Boneford", "Sunscross", "Wadi", "Sirocco", "Nomad", "Glassend", "Thirstmere", "Scarfield", "Dustford"],
  wintermere: ["Rimeford", "Driftwick", "Sealacre", "Frostbarrow", "Iceford", "Whitelea", "Galeacre", "Packcross", "Bergfield", "Huskend", "Aurora", "Sledmere", "Woolford", "Paleacre", "Lastford"],
};

const VILLAGE_NAMES: Record<ContinentId, string[]> = {
  thornvale: [],
  saltreach: ["Skiff", "Buoy", "Puffin", "Kelp", "Spray", "Hook", "Jetty", "Mussel", "Gale", "Flotsam", "Winch", "Tern", "Brack", "Oar", "Spit", "Lagoon", "Chum", "Rigg", "Ebb", "Crest"],
  greyfen: ["Mire", "Leech", "Plover", "Sedge", "Fog", "Newt", "Peat", "Still", "Rush", "Damp", "Heron", "Eel", "Cattail", "Skiffen", "Bog", "Reed", "Muck", "Lichen", "Wisp", "Fen"],
  emberfold: ["Cinder", "Slag", "Kiln", "Spark", "Char", "Basalt", "Heat", "Ash", "Coal", "Pyre", "Forge", "Brim", "Scoria", "Flare", "Magma", "Soot", "Ember", "Crust", "Vent", "Glow"],
  highmerrow: ["Crag", "Scree", "Col", "Tarn", "Goat", "Pine", "Hail", "Ridge", "Horn", "Kestrel", "Pass", "Cliff", "Eyrie", "Switch", "Wool", "Stone", "Wind", "Peak", "Icecap", "Cairn"],
  duskwood: ["Gloom", "Fern", "Owl", "Twig", "Glen", "Web", "Toad", "Stag", "Moss", "Night", "Root", "Veil", "Barrow", "Shade", "Hollow", "Canopy", "Moth", "Lichenwood", "Thorn", "Dew"],
  glasswaste: ["Dune", "Wadi", "Bone", "Salt", "Heat", "Dust", "Scar", "Nomad", "Glass", "Thirst", "Mirage", "Sun", "Caravan", "Sirocco", "Oasis", "Ashen", "Bleed", "Horizon", "Cinderflat", "Skull"],
  wintermere: ["Rime", "Drift", "Seal", "Husk", "Gale", "Berg", "Wool", "Pale", "Sled", "Aurora", "Pack", "Ice", "White", "Last", "Frost", "Snow", "Howl", "Floe", "Shiver", "Quiet"],
};

const PORT_CITY: Record<ContinentId, string> = {
  thornvale: "Kingsport",
  saltreach: "Harborrow",
  greyfen: "Fenport",
  emberfold: "Cinderquay",
  highmerrow: "Frostgate",
  duskwood: "Shadequay",
  glasswaste: "Duneport",
  wintermere: "Icehaven",
};

const PORTAL_CITY: Partial<Record<ContinentId, string>> = {
  thornvale: "Cindermere",
  emberfold: "Ashspire",
  highmerrow: "Skyhold",
  duskwood: "Moonwell",
  wintermere: "Icehaven",
};

function slug(cont: ContinentId, name: string) {
  return `${cont}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "")}`;
}

function connectNearest(list: Settlement[], n = 3) {
  for (const s of list) {
    const others = list
      .filter((o) => o.id !== s.id)
      .map((o) => ({ o, d: (s.x - o.x) ** 2 + (s.y - o.y) ** 2 }))
      .sort((a, b) => a.d - b.d);
    for (const { o } of others.slice(0, n)) {
      if (!s.roads.includes(o.id)) s.roads.push(o.id);
      if (!o.roads.includes(s.id)) o.roads.push(s.id);
    }
  }
}

function buildContinent(id: ContinentId): Settlement[] {
  const used = new Set<string>();
  const uid = (name: string) => {
    let s = slug(id, name);
    let n = 2;
    while (used.has(s)) {
      s = slug(id, `${name}${n}`);
      n += 1;
    }
    used.add(s);
    return s;
  };
  if (id === "thornvale") {
    return THORNVALE.map((sp, i) => ({
      id: uid(sp.name),
      continent: id,
      name: sp.name,
      kind: sp.kind,
      x: sp.x,
      y: sp.y,
      seed: 1100 + i * 17,
      port: !!sp.port,
      portal: !!sp.portal,
      shop: sp.shop ?? (sp.kind !== "village" || i % 3 === 0),
      roads: [],
    }));
  }
  const cities = CITY_NAMES[id];
  const cityPos: [number, number][] = [
    [50, 48],
    [54, 86],
    [18, 44],
    [82, 42],
    [48, 16],
  ];
  const specs: Spec[] = cities.map((name, i) => ({
    name,
    kind: "city" as const,
    x: cityPos[i]![0],
    y: cityPos[i]![1],
    port: name === PORT_CITY[id],
    portal: PORTAL_CITY[id] === name,
    shop: true,
  }));
  const towns = TOWN_NAMES[id];
  for (let i = 0; i < 15; i++) {
    const a = (i / 15) * Math.PI * 2;
    specs.push({
      name: towns[i]!,
      kind: "town",
      x: Math.round(50 + Math.cos(a) * 28 + (i % 3) * 2),
      y: Math.round(50 + Math.sin(a) * 26 + (i % 2) * 3),
      shop: true,
    });
  }
  const villages = VILLAGE_NAMES[id];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2 + 0.4;
    specs.push({
      name: villages[i]!,
      kind: "village",
      x: Math.round(50 + Math.cos(a) * 38 + (i % 5) - 2),
      y: Math.round(50 + Math.sin(a) * 36 + (i % 4) - 2),
      shop: i % 3 === 0,
    });
  }
  return specs.map((sp, i) => ({
    id: uid(sp.name),
    continent: id,
    name: sp.name,
    kind: sp.kind,
    x: Math.max(6, Math.min(94, sp.x)),
    y: Math.max(6, Math.min(94, sp.y)),
    seed: 2000 + CONTINENT_ORDER.indexOf(id) * 200 + i,
    port: !!sp.port,
    portal: !!sp.portal,
    shop: !!sp.shop,
    roads: [],
  }));
}

function buildAll() {
  const byId: Record<string, Settlement> = {};
  for (const id of CONTINENT_ORDER) {
    const list = buildContinent(id);
    connectNearest(list, 3);
    for (const s of list) byId[s.id] = s;
  }
  return byId;
}

export const SETTLEMENTS: Record<string, Settlement> = buildAll();

function sid(cont: ContinentId, name: string) {
  return slug(cont, name);
}

export const PASSAGES: Passage[] = [
  { a: sid("thornvale", "Kingsport"), b: sid("saltreach", "Harborrow"), mode: "ship", gold: 60, note: "East current. A day's sail." },
  { a: sid("thornvale", "Kingsport"), b: sid("greyfen", "Fenport"), mode: "ship", gold: 45, note: "River mouth. Short and grey." },
  { a: sid("thornvale", "Kingsport"), b: sid("highmerrow", "Frostgate"), mode: "ship", gold: 120, note: "North run. Cold water, long haul." },
  { a: sid("saltreach", "Harborrow"), b: sid("emberfold", "Cinderquay"), mode: "ship", gold: 80, note: "South to the fire-shelf." },
  { a: sid("saltreach", "Harborrow"), b: sid("greyfen", "Fenport"), mode: "ship", gold: 55, note: "West through the reeds." },
  { a: sid("emberfold", "Cinderquay"), b: sid("glasswaste", "Duneport"), mode: "ship", gold: 90, note: "Hot current. Sand on the wind." },
  { a: sid("greyfen", "Fenport"), b: sid("duskwood", "Shadequay"), mode: "ship", gold: 70, note: "Black water under the canopy." },
  { a: sid("highmerrow", "Frostgate"), b: sid("wintermere", "Icehaven"), mode: "ship", gold: 100, note: "Ice-cutters only." },
  { a: sid("thornvale", "Cindermere"), b: sid("emberfold", "Ashspire"), mode: "gate", gold: 85, note: "The ash circle." },
  { a: sid("thornvale", "Cindermere"), b: sid("duskwood", "Moonwell"), mode: "gate", gold: 85, note: "Moon-well to the west wood." },
  { a: sid("thornvale", "Cindermere"), b: sid("highmerrow", "Skyhold"), mode: "gate", gold: 95, note: "A high step into stone." },
  { a: sid("highmerrow", "Skyhold"), b: sid("wintermere", "Icehaven"), mode: "gate", gold: 110, note: "Frozen gate. The weave thins." },
];

export function settlement(id: string): Settlement {
  return SETTLEMENTS[id] ?? SETTLEMENTS[START_ID]!;
}

export function listContinent(id: ContinentId): Settlement[] {
  return Object.values(SETTLEMENTS).filter((s) => s.continent === id);
}

export function passagesFrom(id: string, mode?: TravelMode): Passage[] {
  return PASSAGES.filter((p) => (p.a === id || p.b === id) && (!mode || p.mode === mode));
}

export function otherEnd(p: Passage, id: string) {
  return p.a === id ? p.b : p.a;
}

export function roadDestinations(id: string): Settlement[] {
  const s = settlement(id);
  return s.roads.map((rid) => SETTLEMENTS[rid]).filter(Boolean) as Settlement[];
}

export function counts() {
  const out: Record<string, { city: number; town: number; village: number }> = {};
  for (const id of CONTINENT_ORDER) {
    const list = listContinent(id);
    out[id] = {
      city: list.filter((s) => s.kind === "city").length,
      town: list.filter((s) => s.kind === "town").length,
      village: list.filter((s) => s.kind === "village").length,
    };
  }
  return out;
}
