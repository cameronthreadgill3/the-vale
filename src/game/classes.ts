export type ClassId = "warrior" | "archer" | "mage" | "healer" | "paladin" | "monk";

export type AbilityKind = "melee" | "ranged" | "aoe" | "self" | "dash";

export type AbilityDef = {
  id: string;
  name: string;
  mana: number;
  cooldown: number;
  range: number;
  kind: AbilityKind;
  desc: string;
  projectile?: "arrow" | "fireball" | "holy" | "ice";
  stun?: number;
  heal?: number;
  aoe?: number;
};

export type ClassDef = {
  id: ClassId;
  name: string;
  epithet: string;
  role: string;
  playstyle: string;
  weapon: string;
  blurb: string;
  vow: string;
  recommended?: boolean;
  hp: number;
  mp: number;
  speed: number;
  attack: number;
  attackRange: number;
  attackCd: number;
  armor: number;
  abilities: AbilityDef[];
};

export const CLASS_ORDER: ClassId[] = [
  "warrior",
  "archer",
  "mage",
  "healer",
  "paladin",
  "monk",
];

export function abilityShort(ab: AbilityDef): string {
  const shorts: Record<string, string> = {
    cleave: "Cleave",
    bash: "Bash",
    charge: "Charge",
    rally: "Rally",
    power: "Shot",
    multi: "Fan",
    snare: "Snare",
    rain: "Rain",
    fireball: "Fire",
    nova: "Nova",
    blink: "Blink",
    meteor: "Meteor",
    smite: "Bolt",
    heal: "Mend",
    sanctuary: "Ward",
    light: "Light",
    judge: "Judge",
    consecrate: "Ground",
    aegis: "Aegis",
    hammer: "Hammer",
    flurry: "Flurry",
    sweep: "Sweep",
    meditate: "Breath",
    kick: "Kick",
  };
  return shorts[ab.id] ?? ab.name.split(" ")[0]!;
}

export const CLASSES: Record<ClassId, ClassDef> = {
  warrior: {
    id: "warrior",
    name: "Warrior",
    epithet: "Ironfront",
    role: "Melee frontline",
    playstyle: "Stand in the pack. Cleave, stun, hold.",
    weapon: "Arming sword and kite shield",
    blurb:
      "Militia captains of Thornvale. Plate, a kite shield, and a wide cleave. You keep the cobbles so others can hunt.",
    vow: "Ironfront. Hold the line.",
    recommended: true,
    hp: 130,
    mp: 40,
    speed: 108,
    attack: 16,
    attackRange: 46,
    attackCd: 1.15,
    armor: 6,
    abilities: [
      { id: "cleave", name: "Cleave", mana: 8, cooldown: 5, range: 56, kind: "aoe", aoe: 70, desc: "Sweep all foes in reach." },
      { id: "bash", name: "Shield Bash", mana: 10, cooldown: 7, range: 50, kind: "melee", stun: 1.6, desc: "Stun a target in melee." },
      { id: "charge", name: "Charge", mana: 12, cooldown: 9, range: 220, kind: "dash", desc: "Burst toward your mark and strike." },
      { id: "rally", name: "Rally", mana: 14, cooldown: 16, range: 0, kind: "self", desc: "Briefly harden your armor." },
    ],
  },
  archer: {
    id: "archer",
    name: "Archer",
    epithet: "Greenpath",
    role: "Ranged hunter",
    playstyle: "Keep distance. Pin, volley, pick off.",
    weapon: "Yew longbow",
    blurb:
      "Rangers of the outer copse. You strip a pack before it reaches town, and you do not let the sprinting ones close.",
    vow: "Greenpath. Hunt farther than you think.",
    hp: 88,
    mp: 55,
    speed: 118,
    attack: 13,
    attackRange: 230,
    attackCd: 1.05,
    armor: 2,
    abilities: [
      { id: "power", name: "Power Shot", mana: 8, cooldown: 4.5, range: 280, kind: "ranged", projectile: "arrow", desc: "A heavy arrow that hits hard." },
      { id: "multi", name: "Fan of Arrows", mana: 12, cooldown: 7, range: 240, kind: "ranged", projectile: "arrow", desc: "Three shafts in a spread." },
      { id: "snare", name: "Snare", mana: 10, cooldown: 8, range: 240, kind: "ranged", projectile: "arrow", desc: "Slow a marked foe." },
      { id: "rain", name: "Arrow Rain", mana: 16, cooldown: 14, range: 260, kind: "aoe", aoe: 90, desc: "Pelt a patch of ground." },
    ],
  },
  mage: {
    id: "mage",
    name: "Mage",
    epithet: "Ashen College",
    role: "Arcane artillery",
    playstyle: "Burst from range. Blink when they close.",
    weapon: "Tower staff",
    blurb:
      "The old tower still teaches fire and frost. Fragile. Decisive. One meteor ends a pack — if you live to finish it.",
    vow: "Ashen College. Do not let them touch you.",
    hp: 72,
    mp: 110,
    speed: 104,
    attack: 11,
    attackRange: 240,
    attackCd: 1.25,
    armor: 1,
    abilities: [
      { id: "fireball", name: "Fireball", mana: 10, cooldown: 3.2, range: 280, kind: "ranged", projectile: "fireball", aoe: 48, desc: "A bursting globe of fire." },
      { id: "nova", name: "Frost Nova", mana: 16, cooldown: 8, range: 0, kind: "aoe", aoe: 110, stun: 0.8, desc: "Freeze everything nearby." },
      { id: "blink", name: "Blink", mana: 14, cooldown: 10, range: 200, kind: "dash", desc: "Step through the veil." },
      { id: "meteor", name: "Meteor", mana: 28, cooldown: 16, range: 260, kind: "aoe", aoe: 120, projectile: "fireball", desc: "Call a falling star." },
    ],
  },
  healer: {
    id: "healer",
    name: "Healer",
    epithet: "Wellkeeper",
    role: "Ward of the fountain",
    playstyle: "Mend, smite, linger near the wounded.",
    weapon: "Pale crozier",
    blurb:
      "Sworn to the fountain. You walk with the hunting parties and bring them home — light for the unclean, a ward for yourself.",
    vow: "Wellkeeper. Bring them home.",
    hp: 92,
    mp: 120,
    speed: 106,
    attack: 10,
    attackRange: 210,
    attackCd: 1.2,
    armor: 2,
    abilities: [
      { id: "smite", name: "Holy Bolt", mana: 8, cooldown: 3, range: 240, kind: "ranged", projectile: "holy", desc: "A shaft of consecrated light." },
      { id: "heal", name: "Mend", mana: 14, cooldown: 6, range: 0, kind: "self", heal: 38, desc: "Restore a large share of health." },
      { id: "sanctuary", name: "Sanctuary", mana: 18, cooldown: 14, range: 0, kind: "self", heal: 8, desc: "A lingering ward of mending." },
      { id: "light", name: "Divine Light", mana: 22, cooldown: 12, range: 0, kind: "aoe", aoe: 100, heal: 22, desc: "Heal yourself and burn nearby foes." },
    ],
  },
  paladin: {
    id: "paladin",
    name: "Paladin",
    epithet: "Dawnplate",
    role: "Holy knight",
    playstyle: "Hold the middle. Judge, then shield.",
    weapon: "Warhammer and oath",
    blurb:
      "First light over Thornvale. Plate and prayer. You do not fall easily, and the ground at your feet is consecrated.",
    vow: "Dawnplate. You will not fall first.",
    hp: 118,
    mp: 70,
    speed: 102,
    attack: 15,
    attackRange: 48,
    attackCd: 1.2,
    armor: 5,
    abilities: [
      { id: "judge", name: "Judgement", mana: 10, cooldown: 4.5, range: 52, kind: "melee", projectile: "holy", desc: "A righteous melee strike." },
      { id: "consecrate", name: "Consecrate", mana: 14, cooldown: 9, range: 0, kind: "aoe", aoe: 96, desc: "Burn the ground at your feet." },
      { id: "aegis", name: "Divine Shield", mana: 18, cooldown: 18, range: 0, kind: "self", desc: "Brief invulnerability." },
      { id: "hammer", name: "Hammer of Light", mana: 16, cooldown: 8, range: 220, kind: "ranged", projectile: "holy", desc: "Hurl a radiant hammer." },
    ],
  },
  monk: {
    id: "monk",
    name: "Monk",
    epithet: "Quiet Step",
    role: "Fist and focus",
    playstyle: "Fast in, flurry, kick out.",
    weapon: "Open hands",
    blurb:
      "The cloister west of town. Unarmored, unhurried, then suddenly everywhere. Breath is your armor; the gap is yours to close.",
    vow: "Quiet Step. Be there, then gone.",
    hp: 100,
    mp: 65,
    speed: 124,
    attack: 14,
    attackRange: 44,
    attackCd: 0.85,
    armor: 3,
    abilities: [
      { id: "flurry", name: "Flurry", mana: 8, cooldown: 5, range: 48, kind: "melee", desc: "A burst of three blows." },
      { id: "sweep", name: "Sweep", mana: 12, cooldown: 8, range: 54, kind: "aoe", aoe: 70, stun: 1.1, desc: "Drop nearby foes." },
      { id: "meditate", name: "Meditate", mana: 0, cooldown: 14, range: 0, kind: "self", heal: 24, desc: "Restore health and mana." },
      { id: "kick", name: "Flying Kick", mana: 12, cooldown: 8, range: 200, kind: "dash", desc: "Close the gap and knock back." },
    ],
  },
};

export type EnemyKind =
  | "goblin"
  | "wolf"
  | "skeleton"
  | "orc"
  | "drake"
  | "wisp"
  | "wight"
  | "cinder"
  | "crab"
  | "shrike"
  | "hag"
  | "hollowking";

export type EnemyDef = {
  id: EnemyKind;
  name: string;
  hp: number;
  attack: number;
  speed: number;
  range: number;
  attackCd: number;
  armor: number;
  xp: number;
  score: number;
  radius: number;
  minDist: number;
  maxDist: number;
};

export const ENEMIES: Record<EnemyKind, EnemyDef> = {
  goblin: { id: "goblin", name: "Goblin", hp: 28, attack: 6, speed: 72, range: 40, attackCd: 1.4, armor: 0, xp: 18, score: 40, radius: 14, minDist: 14, maxDist: 38 },
  wolf: { id: "wolf", name: "Dire Wolf", hp: 42, attack: 9, speed: 96, range: 38, attackCd: 1.15, armor: 1, xp: 32, score: 70, radius: 16, minDist: 22, maxDist: 52 },
  skeleton: { id: "skeleton", name: "Skeleton", hp: 58, attack: 12, speed: 78, range: 42, attackCd: 1.3, armor: 2, xp: 55, score: 110, radius: 15, minDist: 34, maxDist: 70 },
  orc: { id: "orc", name: "Orc Brute", hp: 96, attack: 18, speed: 70, range: 46, attackCd: 1.5, armor: 4, xp: 90, score: 180, radius: 18, minDist: 48, maxDist: 92 },
  drake: { id: "drake", name: "Fire Drake", hp: 160, attack: 24, speed: 88, range: 150, attackCd: 1.8, armor: 5, xp: 160, score: 320, radius: 20, minDist: 68, maxDist: 200 },
  wisp: { id: "wisp", name: "Nettle Wisp", hp: 22, attack: 8, speed: 64, range: 140, attackCd: 1.55, armor: 0, xp: 22, score: 52, radius: 13, minDist: 10, maxDist: 36 },
  wight: { id: "wight", name: "Barrow Wight", hp: 74, attack: 14, speed: 68, range: 44, attackCd: 1.35, armor: 3, xp: 70, score: 140, radius: 16, minDist: 28, maxDist: 64 },
  cinder: { id: "cinder", name: "Ash Cinderling", hp: 48, attack: 13, speed: 80, range: 130, attackCd: 1.25, armor: 2, xp: 64, score: 128, radius: 14, minDist: 30, maxDist: 70 },
  crab: { id: "crab", name: "Saltwick Crab", hp: 86, attack: 15, speed: 52, range: 46, attackCd: 1.7, armor: 6, xp: 60, score: 120, radius: 18, minDist: 16, maxDist: 48 },
  shrike: { id: "shrike", name: "Glasswaste Shrike", hp: 110, attack: 22, speed: 108, range: 160, attackCd: 1.4, armor: 3, xp: 140, score: 280, radius: 17, minDist: 60, maxDist: 160 },
  hag: { id: "hag", name: "Mire Hag", hp: 128, attack: 20, speed: 60, range: 52, attackCd: 1.6, armor: 3, xp: 150, score: 300, radius: 18, minDist: 36, maxDist: 80 },
  hollowking: { id: "hollowking", name: "The Hollow King", hp: 260, attack: 28, speed: 62, range: 52, attackCd: 1.45, armor: 8, xp: 320, score: 720, radius: 22, minDist: 50, maxDist: 140 },
};
