import type { Biome, SettlementKind } from "./atlas";

function hash(x: number, y: number, s: number) {
  let n = x * 374761393 + y * 668265263 + s * 1274126177;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967296;
}

function pick<T>(seed: number, salt: number, arr: T[]): T {
  return arr[Math.floor(hash(salt, 1, seed) * arr.length) % arr.length]!;
}

export type NpcRole = "inn" | "fish" | "mill" | "watch" | "hides" | "magic" | "armory" | "fletcher";

export type Npc = {
  id: string;
  name: string;
  epithet: string;
  role: NpcRole;
  x: number;
  y: number;
  line: string;
  aside: string;
  rest: string;
  hue: string;
};

type Soul = {
  name: string;
  epithet: string;
  line: string;
  aside: string;
  rest: string;
  hue: string;
};

/** Named souls. The first square, and the inns of the eight capitals. */
const SIGNATURE: Record<string, Partial<Record<NpcRole, Soul>>> = {
  Thornhearth: {
    inn: {
      name: "Mara Holt",
      epithet: "Kettle-saint",
      line: "Sit. If the Vale wanted you dead today it would have done it on the road. Come back when the copse has had enough of you. The kettle stays.",
      aside: "I don't ask what you hunt. I pour. That's the whole of my class.",
      rest: "Mara's chair. The kettle ticks you back together.",
      hue: "#c4a574",
    },
    fish: {
      name: "Noll Reed",
      epithet: "Who counts",
      line: "Three fish. Not two. Not four. The quay keeps a tally even when I forget my own name.",
      aside: "I counted your steps from the fountain. Fourteen. That's a lucky sort of ordinary.",
      rest: "Noll nods once. That's a blessing, from him.",
      hue: "#7a8a9a",
    },
    mill: {
      name: "Tamsin Oat",
      epithet: "Talks to the stones",
      line: "Herb doesn't know your class. It grows. That's the whole sermon. Three bunches and we're square.",
      aside: "The mill is a mule. I am its worse half. Don't be a hero in my yard.",
      rest: "Tamsin snorts. The mill does not.",
      hue: "#8a7a54",
    },
    watch: {
      name: "Rook Vale",
      epithet: "Put the sword down",
      line: "Posts north of the fountain. Hit the dummy. Take the shield. Drink the font. Skills climb the Tibia way — slow, then slower. Move every half hour or we send you home.",
      aside: "Hunt if the afternoon wants blood. Sit if it wants a bench. I used to keep a score. I don't, now.",
      rest: "Rook looks past you, the way a watch does.",
      hue: "#6a7068",
    },
    hides: {
      name: "Brann Pelt",
      epithet: "Counts in skins",
      line: "Bring me what the copse leaves on the ground. Ears, pelts, fangs. I don't ask how they came off.",
      aside: "A knife and a cloak if you're walking back out. The racks don't care about class.",
      rest: "Brann taps a hide. That's the till.",
      hue: "#8a6a48",
    },
    magic: {
      name: "Iskra Ash",
      epithet: "Keeps the glass",
      line: "If it hums, I buy it. Glands, silk, a ring that still remembers a spell. Draughts if you're empty.",
      aside: "The College would tax this counter. The College is not here.",
      rest: "Iskra's orb ticks once. You may go.",
      hue: "#6a7a98",
    },
    armory: {
      name: "Garth Iron",
      epithet: "The anvil is the speech",
      line: "Steel in, steel out. I buy blades that failed. I sell ones that haven't yet.",
      aside: "Don't tell me your class. Tell me if the rivets hold.",
      rest: "Garth goes back to the iron. That's dismissal.",
      hue: "#7a6a58",
    },
    fletcher: {
      name: "Wren Greenpath",
      epithet: "Nocks before she talks",
      line: "Bows, quivers, quiet leather. I'll take glass-feathers and a fang that still cuts. Keep the rest for Brann.",
      aside: "If you can't nock in the wind, sit on a bench. The copse isn't a range.",
      rest: "Wren checks a shaft. Straight. You may leave.",
      hue: "#5a6a48",
    },
  },
  Kingsport: {
    inn: {
      name: "Brine Edda",
      epithet: "Between bells",
      line: "Tide's a clock. Rest between bells. I don't take coin for a chair that faces the water.",
      aside: "Salt in the stew. Salt in the stories. Don't bring me a hero's tale unless it has a quay in it.",
      rest: "Edda times your rest by the bell, not the hour.",
      hue: "#8aa0b0",
    },
    fish: {
      name: "Cobb Keel",
      epithet: "One-hook",
      line: "I fish with one hook on purpose. Three fish is a conversation. Four is greed. The current agrees.",
      aside: "Kingsport eats what it pulls. I sell what it doesn't. Bring me three.",
      rest: "Cobb's hook clicks on the rail.",
      hue: "#6a8494",
    },
  },
  Cindermere: {
    inn: {
      name: "Ash-Wren",
      epithet: "Sleeps through the hum",
      line: "The gate hums in the floorboards. I sleep anyway. You can too. No coin for that.",
      aside: "Mages come through hungry. I feed them like anyone. The weave doesn't do dishes.",
      rest: "The portal hums. Ash-Wren does not.",
      hue: "#9a7a9a",
    },
    watch: {
      name: "Ivy Shard",
      epithet: "Looks at the gate, not you",
      line: "If you're here to be impressive, the portal already is. Walk or sit. Both are allowed.",
      aside: "I have seen a walker come back from Emberfold with no name. The square still poured them tea.",
      rest: "Ivy's eyes stay on the spire.",
      hue: "#7a6a88",
    },
  },
  Dawnhold: {
    inn: {
      name: "Lissa Dawn",
      epithet: "Keeps the east window",
      line: "We open the shutter for the first light and leave it. Rest is a kind of vow here. Free, like the morning.",
      aside: "Paladins stop in and try to pay. I put the coin back in their stew.",
      rest: "Lissa's east window. The light does the rest.",
      hue: "#c8b070",
    },
  },
  Greenwatch: {
    watch: {
      name: "Gareth Thorn",
      epithet: "The north ear",
      line: "Greenwatch listens more than it speaks. I can hear a wolf at two miles and a lie at two feet.",
      aside: "Sit on my wall if you like. The copse is patient. So am I, until I'm not.",
      rest: "Gareth hears you sit. He does not turn.",
      hue: "#5a6a48",
    },
  },
  Millford: {
    mill: {
      name: "Hobb Grain",
      epithet: "Flour in the beard",
      line: "Three bunches. I don't care if you killed a drake this morning. The mill does not clap.",
      aside: "My father named me for the work. I have never forgiven him, or the mill. We get on.",
      rest: "Hobb wipes flour on his sleeve. That's hospitality.",
      hue: "#a09060",
    },
  },
  Harborrow: {
    inn: {
      name: "Sera Gale",
      epithet: "Laughs at the swell",
      line: "Saltreach doesn't do quiet. Rest anyway. I'll shout the sea down to a mutter for an hour.",
      aside: "Bring fish if you want my better wine. Three. I drink the rest of the stories.",
      rest: "Sera's laugh is a harbor wall.",
      hue: "#7aa0b8",
    },
  },
  Fenport: {
    inn: {
      name: "Moth Pell",
      epithet: "Soft as reed",
      line: "Greyfen folk talk low so the water doesn't take the words. Sit. The marsh can wait a cup.",
      aside: "Don't step where it shines. That's not dew. That's a lesson I only give once.",
      rest: "Pell's voice is barely there. The rest still works.",
      hue: "#6a7a68",
    },
  },
  Ashspire: {
    inn: {
      name: "Char Bram",
      epithet: "Drinks the heat",
      line: "Emberfold will cook a walker who stands on pride. Sit. Shade is a kind of armor here.",
      aside: "The mill takes cinder-herb. Three. I pay in coin that doesn't melt.",
      rest: "Bram's shade. The shelf goes on burning without you.",
      hue: "#b07050",
    },
  },
  Skyhold: {
    watch: {
      name: "Nell Col",
      epithet: "Wind-sister",
      line: "Up here the air does half the fighting. I do the other half, slowly. Sit before the wind sits you.",
      aside: "Heroes arrive gasping and leave quieter. That's Highmerrow's whole education.",
      rest: "Nell's wall. The wind keeps the watch with her.",
      hue: "#9aa8b4",
    },
  },
  Moonwell: {
    inn: {
      name: "Ysolde Veil",
      epithet: "Lights one lamp",
      line: "Duskwood is not evil. It is private. Rest. I light one lamp and that is enough company.",
      aside: "Pick what glows at the roots, not what sings. Three bunches. I'll know if you guessed wrong.",
      rest: "One lamp. Ysolde's. That's the inn.",
      hue: "#6a5a78",
    },
  },
  Sunspire: {
    inn: {
      name: "Dun Glass",
      epithet: "Rations his vowels",
      line: "Waste doesn't waste words. Sit. Water's in the jug. Don't thank me twice.",
      aside: "Three fish if the oasis holds. If it doesn't, sit anyway. Sitting is cheap.",
      rest: "Dun nods. In the waste, that is a hymn.",
      hue: "#c0a070",
    },
  },
  Icehaven: {
    inn: {
      name: "Edda Rime",
      epithet: "Keeps the stove like a vow",
      line: "Wintermere will take a finger if you boast. Rest by the stove. I don't charge for heat.",
      aside: "Talk if you want. The stove is the better conversationalist. It never asks your level.",
      rest: "Edda's stove. Fingers come back first.",
      hue: "#b0c0c8",
    },
  },
};

type Temper = "warm" | "dry" | "wry" | "hush" | "spare" | "sings" | "crooked" | "weary";

const FIRST: Record<NpcRole, string[]> = {
  inn: ["Mara", "Edda", "Bram", "Lissa", "Odge", "Cal", "Pell", "Wren"],
  fish: ["Noll", "Piet", "Sera", "Cobb", "Brisk", "Fen", "Tern", "Hook"],
  mill: ["Hobb", "Wren", "Tamsin", "Oat", "Moth", "Barley", "Quern", "Ash"],
  watch: ["Rook", "Ivy", "Gareth", "Nell", "Col", "Briar", "Flint", "Shade"],
  hides: ["Brann", "Pelt", "Hide", "Kerr", "Tallow", "Rue", "Nock", "Flense"],
  magic: ["Iskra", "Ash", "Veil", "Quill", "Lumen", "Moth", "Sable", "Wren"],
  armory: ["Garth", "Iron", "Anvil", "Bram", "Forge", "Cole", "Rivet", "Hart"],
  fletcher: ["Wren", "Green", "Nock", "Yew", "Ash", "Quill", "Thorn", "Fletch"],
};

const LAST: Record<Biome, string[]> = {
  vale: ["Holt", "Reed", "Oat", "Thorn", "Vale", "Mill", "Brook", "Hearth"],
  coast: ["Keel", "Gale", "Brine", "Hook", "Spray", "Quay", "Mast", "Tern"],
  marsh: ["Pell", "Mire", "Reed", "Fog", "Plover", "Sedge", "Still", "Wisp"],
  ember: ["Char", "Ash", "Cinder", "Slag", "Pyre", "Kiln", "Basalt", "Spark"],
  peak: ["Col", "Rime", "Granite", "Wind", "Ridge", "Kestrel", "Scree", "Horn"],
  wood: ["Veil", "Root", "Moss", "Owl", "Glen", "Twig", "Night", "Fern"],
  waste: ["Glass", "Dune", "Bone", "Wadi", "Salt", "Sirocco", "Scar", "Sun"],
  ice: ["Rime", "Pale", "Frost", "Wool", "Pack", "Berg", "Husk", "Last"],
};

const EPITHET: Record<NpcRole, Record<Temper, string>> = {
  inn: {
    warm: "Always pouring",
    dry: "Doesn't do speeches",
    wry: "Stew first, stories later",
    hush: "Voice like a closed shutter",
    spare: "One cup, no extra",
    sings: "Hums the kettle in tune",
    crooked: "Puts the good chair out last",
    weary: "Has outlived three signs",
  },
  fish: {
    warm: "Saves the small ones",
    dry: "The current is the joke",
    wry: "Bait philosopher",
    hush: "Speaks to the water",
    spare: "One hook, on purpose",
    sings: "Work-song on the quay",
    crooked: "Sells the story with the fish",
    weary: "Has named every current",
  },
  mill: {
    warm: "Flour on the kind word",
    dry: "The mill does not clap",
    wry: "Worse half of a mule",
    hush: "Listens to the stones",
    spare: "Counts in bunches",
    sings: "Keeps time with the wheel",
    crooked: "Pays in coin that looks honest",
    weary: "Father named them for the work",
  },
  watch: {
    warm: "Lets the afternoon go",
    dry: "The ruin can wait",
    wry: "Retired from being you",
    hush: "Hears two miles",
    spare: "Two words, then the wall",
    sings: "Whistles the all-clear",
    crooked: "Knows which bench is safest",
    weary: "Put the sword down once",
  },
  hides: {
    warm: "Pays fair for a pelt",
    dry: "Counts in skins",
    wry: "The smell is the receipt",
    hush: "Works the rack, not the mouth",
    spare: "Hide in, coin out",
    sings: "Hums while she flenses",
    crooked: "Keeps the best fur for last",
    weary: "Has skinned worse days",
  },
  magic: {
    warm: "Pours the draught first",
    dry: "If it hums, it sells",
    wry: "Taxes the College in reverse",
    hush: "Keeps the glass quiet",
    spare: "One orb, one price",
    sings: "The weave has a pitch",
    crooked: "Sells the story with the staff",
    weary: "Has seen a ring forget its name",
  },
  armory: {
    warm: "Fits the rivet to the walker",
    dry: "The anvil is the speech",
    wry: "Buys failure, sells the next try",
    hush: "Hammer, then words",
    spare: "Steel in, steel out",
    sings: "Keeps time with the iron",
    crooked: "The second sword costs more",
    weary: "Has mended three generations",
  },
  fletcher: {
    warm: "Nocks before she talks",
    dry: "The shaft is the sentence",
    wry: "Bows don't applaud",
    hush: "Listens to the string",
    spare: "Yew, then go",
    sings: "The string has a note",
    crooked: "Sells the quiet arrows dearer",
    weary: "Has fletched through worse winters",
  },
};

const OPEN: Record<Temper, string> = {
  warm: "Come in off the road.",
  dry: "You're here. That's enough news.",
  wry: "Another walker. The square survives.",
  hush: "Softly. This place likes quiet.",
  spare: "Sit or don't. Both work.",
  sings: "I was in the middle of a tune. You're in it now.",
  crooked: "I like a face I haven't sold to yet.",
  weary: "I've said this to better walkers. I'll say it to you.",
};

const PLACE: Record<Biome, string> = {
  vale: "{place} is kind if you let it be.",
  coast: "{place} runs on tide, not vows.",
  marsh: "{place} will take a boot if you boast.",
  ember: "{place} cooks pride first.",
  peak: "{place} lets the wind do half the talking.",
  wood: "{place} is private. It isn't evil.",
  waste: "{place} doesn't waste words, or water.",
  ice: "{place} takes fingers from the loud.",
};

const WANT: Record<NpcRole, string> = {
  inn: "Rest is free. I don't take coin for a chair.",
  fish: "Pull three for me if the afternoon is idle. I'll pay.",
  mill: "Three bunches of what's green. The mill doesn't care who you are.",
  watch: "Hunt if you want. Sit if you don't. The watch isn't a scoreboard.",
  hides: "Bring pelts, fangs, ears. I pay. Leather if you're going back out.",
  magic: "If it hums I buy it. Draughts and staves if you're empty.",
  armory: "Steel in, steel out. I buy blades that failed.",
  fletcher: "Bows and quivers. Glass-feathers if you have them.",
};

const ASIDE: Record<Temper, string> = {
  warm: "I don't need your class. I need you sitting long enough to taste the cup.",
  dry: "If you came to be impressive, you missed the turn.",
  wry: "Bring me a story only if it has a kettle or a quay in it.",
  hush: "Say less. The land is already talking.",
  spare: "That's the whole of it. I don't do a second speech.",
  sings: "If you rest, rest in time. I hate a dragged chorus.",
  crooked: "Easy work pays. Hard work also pays. I prefer easy.",
  weary: "I used to walk. Then I learned a square. You will too, or you won't.",
};

const REST: Record<NpcRole, string> = {
  inn: "The chair takes you back. No coin.",
  fish: "The quay nods. That's rest, here.",
  mill: "The mill does not stop. You may.",
  watch: "The wall is a kind of bed. Up when you're ready.",
  hides: "The racks don't mind if you stand a minute.",
  magic: "The glass ticks. You may go.",
  armory: "The iron keeps talking. You don't have to.",
  fletcher: "The string goes still. That's rest enough.",
};

const HUE: Record<NpcRole, string[]> = {
  inn: ["#c4a574", "#b89060", "#d0b080", "#a87858"],
  fish: ["#7a8a9a", "#6a8494", "#8aa0b0", "#5a7080"],
  mill: ["#8a7a54", "#a09060", "#7a6a44", "#9a8860"],
  watch: ["#6a7068", "#5a6a48", "#7a6a88", "#6a5a58"],
  hides: ["#8a6a48", "#7a5a38", "#9a7a54", "#6a4a30"],
  magic: ["#6a7a98", "#5a6a88", "#7a8aa8", "#4a5a78"],
  armory: ["#7a6a58", "#6a5a48", "#8a7a64", "#5a4a3c"],
  fletcher: ["#5a6a48", "#4a5a38", "#6a7a50", "#3a4a30"],
};

const TEMPERS: Temper[] = ["warm", "dry", "wry", "hush", "spare", "sings", "crooked", "weary"];

function compose(role: NpcRole, seed: number, place: string, biome: Biome, index: number): Soul {
  const temper = pick(seed, 11 + index, TEMPERS);
  const name = `${pick(seed, 20 + index, FIRST[role])} ${pick(seed, 40 + index, LAST[biome])}`;
  const where = PLACE[biome].replace("{place}", place);
  return {
    name,
    epithet: EPITHET[role][temper],
    line: `${OPEN[temper]} ${where} ${WANT[role]}`,
    aside: ASIDE[temper],
    rest: REST[role],
    hue: pick(seed, 70 + index, HUE[role]),
  };
}

export const CLOCK = ["Night", "Dawn", "Morning", "Noon", "Afternoon", "Dusk", "Evening", "Night"] as const;

export function clockLabel(t: number): string {
  const u = ((t % 1) + 1) % 1;
  if (u < 0.08 || u >= 0.92) return "Night";
  if (u < 0.18) return "Dawn";
  if (u < 0.32) return "Morning";
  if (u < 0.45) return "Noon";
  if (u < 0.62) return "Afternoon";
  if (u < 0.78) return "Dusk";
  return "Evening";
}

/** 0 at noon, ~0.42 at midnight — veil only, never locks the square. */
export function nightVeil(t: number): number {
  const u = ((t % 1) + 1) % 1;
  const day = Math.cos((u - 0.4) * Math.PI * 2);
  return Math.max(0, Math.min(0.42, (0.15 - day) * 0.55));
}

export function placeFolk(
  seed: number,
  townX: number,
  townY: number,
  kind: SettlementKind,
  place = "the square",
  biome: Biome = "vale",
): Npc[] {
  const roles: NpcRole[] =
    kind === "village"
      ? ["inn", "mill", "hides"]
      : kind === "town"
        ? ["inn", "fish", "mill", "hides", "armory"]
        : ["inn", "fish", "mill", "watch", "hides", "magic", "armory", "fletcher"];
  const spots: [number, number][] = [
    [90, -165],
    [40, 200],
    [200, 55],
    [-40, -90],
    [130, 95],
    [-150, -40],
    [-145, 90],
    [145, -35],
  ];
  const used = new Set<string>();
  return roles.map((role, i) => {
    const [ox, oy] = spots[i] ?? [80, 80];
    const signed = SIGNATURE[place]?.[role];
    let soul = signed ?? compose(role, seed, place, biome, i);
    if (!signed) {
      let n = 0;
      while (used.has(soul.name) && n < 8) {
        soul = compose(role, seed + n + 1, place, biome, i + n + 3);
        n++;
      }
    }
    used.add(soul.name);
    return {
      id: `${role}-${i}`,
      role,
      x: townX + ox,
      y: townY + oy,
      ...soul,
    };
  });
}

export function jobNeed(role: NpcRole): { item: "vale_fish" | "copse_herb"; qty: number; pay: number } | null {
  if (role === "fish") return { item: "vale_fish", qty: 3, pay: 36 };
  if (role === "mill") return { item: "copse_herb", qty: 3, pay: 28 };
  return null;
}

export function roleLabel(role: NpcRole) {
  if (role === "inn") return "Inn";
  if (role === "fish") return "Quay";
  if (role === "mill") return "Mill";
  if (role === "hides") return "Hides";
  if (role === "magic") return "The weave";
  if (role === "armory") return "Iron";
  if (role === "fletcher") return "Greenpath";
  return "Watch";
}
