import type { EnemyKind } from "./classes";
import type { SkillId, SkillSet } from "./skills";
import { GEAR_EXTRAS, LADDER, canWear as wearCheck } from "./gear";

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythical" | "relic";
export type EquipSlot = "weapon" | "offhand" | "helm" | "chest" | "legs" | "boots" | "amulet" | "ring";
export type Loadout = Partial<Record<EquipSlot, ItemId>>;
export type SkillNeed = { skill: SkillId; level: number };

export type ItemDef = {
  id: string;
  name: string;
  value: number;
  kind: "loot" | "supply" | "gear";
  desc: string;
  eatHp?: number;
  eatMp?: number;
  slot?: EquipSlot;
  rarity?: Rarity;
  levelReq?: number;
  skillReq?: SkillNeed;
  attack?: number;
  distance?: number;
  armor?: number;
  hp?: number;
  mp?: number;
};

const LOOT: Record<string, ItemDef> = {
  gold: { id: "gold", name: "Gold", value: 1, kind: "supply", desc: "Old tongue for coin. The purse splits copper, silver, gold, and platinum." },
  health_potion: { id: "health_potion", name: "Health draught", value: 28, kind: "supply", desc: "A red flask. Drink in the wild." },
  mana_potion: { id: "mana_potion", name: "Mana draught", value: 32, kind: "supply", desc: "Blue glass. Restores the weave." },
  bread: { id: "bread", name: "Hearth bread", value: 8, kind: "supply", desc: "Still warm if you ask.", eatHp: 22 },
  stew: { id: "stew", name: "Vale stew", value: 16, kind: "supply", desc: "A bowl. Sit with it.", eatHp: 40, eatMp: 12 },
  ale: { id: "ale", name: "Mill ale", value: 6, kind: "supply", desc: "Bitter. Kind.", eatMp: 14 },
  vale_fish: { id: "vale_fish", name: "Vale fish", value: 9, kind: "supply", desc: "From the quay. Eat or sell.", eatHp: 18 },
  copse_herb: { id: "copse_herb", name: "Copse herb", value: 5, kind: "supply", desc: "Green at the edge of town.", eatMp: 10 },
  bait: { id: "bait", name: "Offal bait", value: 4, kind: "supply", desc: "The quay and the copse both notice." },
  goblin_ear: { id: "goblin_ear", name: "Goblin ear", value: 6, kind: "loot", desc: "Proof of a small hunt." },
  wolf_pelt: { id: "wolf_pelt", name: "Wolf pelt", value: 14, kind: "loot", desc: "Warm if you can stand the smell." },
  wolf_fang: { id: "wolf_fang", name: "Wolf fang", value: 11, kind: "loot", desc: "Traders pay for the point." },
  bone: { id: "bone", name: "Old bone", value: 5, kind: "loot", desc: "From something that should have stayed down." },
  rusty_blade: { id: "rusty_blade", name: "Rusty blade", value: 18, kind: "loot", desc: "Not a weapon anymore. Scrap." },
  orc_tusk: { id: "orc_tusk", name: "Orc tusk", value: 22, kind: "loot", desc: "Heavy. The shops in cities want these." },
  orc_hide: { id: "orc_hide", name: "Orc hide", value: 20, kind: "loot", desc: "Thick as boot leather." },
  drake_scale: { id: "drake_scale", name: "Drake scale", value: 40, kind: "loot", desc: "Still warm at the edges." },
  fire_gland: { id: "fire_gland", name: "Fire gland", value: 55, kind: "loot", desc: "Mages buy these. Handle closed." },
  wisp_silk: { id: "wisp_silk", name: "Wisp silk", value: 12, kind: "loot", desc: "Cool to the touch. Lights a room." },
  wight_shroud: { id: "wight_shroud", name: "Barrow linen", value: 18, kind: "loot", desc: "A shroud that still knows a name." },
  cinder_core: { id: "cinder_core", name: "Cinder core", value: 28, kind: "loot", desc: "A coal that will not go out." },
  crab_shell: { id: "crab_shell", name: "Salt shell", value: 16, kind: "loot", desc: "Barnacled. The quay pays for these." },
  shrike_glass: { id: "shrike_glass", name: "Shrike glass", value: 48, kind: "loot", desc: "A feather that cuts the palm." },
  hag_eye: { id: "hag_eye", name: "Hag eye", value: 60, kind: "loot", desc: "It looks back. Traders still buy it." },
  king_shard: { id: "king_shard", name: "Crown shard", value: 90, kind: "loot", desc: "A flake of the Hollow King's antler." },
};

export const ITEMS: Record<string, ItemDef> = { ...LOOT };
for (const g of LADDER) ITEMS[g.id] = g;
for (const g of GEAR_EXTRAS) ITEMS[g.id] = g;

export type ItemId = string;

export type InvStack = { item: ItemId; qty: number };

export const PACK_CAP = 24;
export const BANK_SLOTS = 100;

export const SLOT_ORDER: EquipSlot[] = ["weapon", "offhand", "helm", "chest", "legs", "boots", "amulet", "ring"];

export const SLOT_LABEL: Record<EquipSlot, string> = {
  weapon: "Weapon",
  offhand: "Off-hand",
  helm: "Helm",
  chest: "Chest",
  legs: "Legs",
  boots: "Boots",
  amulet: "Amulet",
  ring: "Ring",
};

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  mythical: "Mythical",
  relic: "Relic",
};

export const RARITY_CLASS: Record<Rarity, string> = {
  common: "text-fg-subtle",
  uncommon: "text-xp",
  rare: "text-mp",
  epic: "text-hp",
  legendary: "text-fg",
  mythical: "text-primary",
  relic: "text-primary",
};

export const SHOP_STOCK: ItemId[] = [
  "health_potion",
  "mana_potion",
  "bread",
  "stew",
  "ale",
  "melee_splinter",
  "ward_splinter",
  "helm_splinter",
  "chest_splinter",
  "legs_splinter",
  "boots_splinter",
  "melee_thorn",
];

export function isGear(id: ItemId): boolean {
  return ITEMS[id]?.kind === "gear";
}

export function emptyWorn(): Loadout {
  return {};
}

export type Vault = (InvStack | null)[];

export function emptyVault(): Vault {
  return Array.from({ length: BANK_SLOTS }, () => null);
}

export function emptyPack(): InvStack[] {
  return [];
}

export function sanitizeWorn(raw?: Loadout | null): Loadout {
  const next: Loadout = {};
  if (!raw || typeof raw !== "object") return next;
  for (const slot of SLOT_ORDER) {
    const id = raw[slot];
    if (!id || !ITEMS[id] || ITEMS[id].kind !== "gear" || ITEMS[id].slot !== slot) continue;
    next[slot] = id;
  }
  return next;
}

export function sanitizeVault(raw?: Vault | null): Vault {
  const next = emptyVault();
  if (!Array.isArray(raw)) return next;
  for (let i = 0; i < BANK_SLOTS; i++) {
    const s = raw[i];
    if (!s || !ITEMS[s.item] || s.item === "gold") continue;
    next[i] = { item: s.item, qty: Math.max(1, Math.floor(s.qty || 1)) };
  }
  return next;
}

export function wornBonuses(worn: Loadout, level = 999, skills?: SkillSet) {
  let attack = 0;
  let distance = 0;
  let armor = 0;
  let hp = 0;
  let mp = 0;
  for (const slot of SLOT_ORDER) {
    const id = worn[slot];
    if (!id) continue;
    const d = ITEMS[id];
    if (!d) continue;
    if (skills ? wearCheck(d, level, skills) : (d.levelReq ?? 1) > level) continue;
    attack += d.attack ?? 0;
    distance += d.distance ?? 0;
    armor += d.armor ?? 0;
    hp += d.hp ?? 0;
    mp += d.mp ?? 0;
  }
  return { attack, distance, armor, hp, mp };
}

export function canWear(d: ItemDef, level: number, skills: SkillSet) {
  return wearCheck(d, level, skills);
}

export function sellPrice(id: ItemId) {
  const d = ITEMS[id];
  if (!d) return 1;
  return Math.max(1, Math.floor(d.value * 0.45));
}

export function addToPack(pack: InvStack[], item: ItemId, qty: number): InvStack[] | null {
  if (item === "gold" || qty <= 0 || !ITEMS[item]) return pack.map((s) => ({ ...s }));
  const next = pack.map((s) => ({ ...s }));
  const found = next.find((s) => s.item === item);
  if (found) {
    found.qty += qty;
    return next;
  }
  if (next.length >= PACK_CAP) return null;
  next.push({ item, qty });
  return next;
}

export function takeFromPack(pack: InvStack[], item: ItemId, qty: number): InvStack[] | null {
  const next = pack.map((s) => ({ ...s }));
  const found = next.find((s) => s.item === item);
  if (!found || found.qty < qty) return null;
  found.qty -= qty;
  return next.filter((s) => s.qty > 0);
}

export function stashInVault(vault: Vault, pack: InvStack[], item: ItemId): { vault: Vault; pack: InvStack[] } | null {
  const taken = takeFromPack(pack, item, 1);
  if (!taken) return null;
  const nextVault = vault.map((s) => (s ? { ...s } : null));
  const existing = nextVault.find((s) => s?.item === item);
  if (existing) {
    existing.qty += 1;
    return { vault: nextVault, pack: taken };
  }
  const i = nextVault.findIndex((s) => !s);
  if (i < 0) return null;
  nextVault[i] = { item, qty: 1 };
  return { vault: nextVault, pack: taken };
}

export function takeFromVault(vault: Vault, pack: InvStack[], slot: number): { vault: Vault; pack: InvStack[] } | null {
  const i = Math.max(0, Math.min(BANK_SLOTS - 1, Math.floor(slot)));
  const stack = vault[i];
  if (!stack) return null;
  const nextPack = addToPack(pack, stack.item, stack.qty);
  if (!nextPack) return null;
  const nextVault = vault.map((s) => (s ? { ...s } : null));
  nextVault[i] = null;
  return { vault: nextVault, pack: nextPack };
}

export function vaultUsed(vault: Vault) {
  return vault.reduce((n, s) => n + (s ? 1 : 0), 0);
}

export function statLine(d: ItemDef): string {
  const bits: string[] = [];
  if (d.attack) bits.push(`+${d.attack} atk`);
  if (d.distance) bits.push(`+${d.distance} dist`);
  if (d.armor) bits.push(`+${d.armor} arm`);
  if (d.hp) bits.push(`+${d.hp} hp`);
  if (d.mp) bits.push(`+${d.mp} mp`);
  if (d.levelReq) bits.push(`lv ${d.levelReq}`);
  if (d.skillReq) bits.push(`${d.skillReq.skill} ${d.skillReq.level}`);
  return bits.join(" · ");
}

const KIND_LOOT: Record<EnemyKind, ItemId[]> = {
  goblin: ["goblin_ear", "rusty_blade", "bone"],
  wolf: ["wolf_pelt", "wolf_fang"],
  skeleton: ["bone", "rusty_blade"],
  orc: ["orc_tusk", "orc_hide"],
  drake: ["drake_scale", "fire_gland"],
  wisp: ["wisp_silk"],
  wight: ["wight_shroud", "bone"],
  cinder: ["cinder_core", "fire_gland"],
  crab: ["crab_shell"],
  shrike: ["shrike_glass"],
  hag: ["hag_eye", "wisp_silk"],
  hollowking: ["king_shard", "bone"],
};

export function rollLoot(kind: EnemyKind, level: number): { gold: number; drops: { item: ItemId; qty: number }[] } {
  const gold = 2 + ((Math.random() * (4 + level * 1.4)) | 0);
  const drops: { item: ItemId; qty: number }[] = [];
  const table = KIND_LOOT[kind] ?? ["bone"];
  if (Math.random() < 0.58) {
    drops.push({ item: table[(Math.random() * table.length) | 0]!, qty: 1 });
  }
  if (Math.random() < 0.08) drops.push({ item: "health_potion", qty: 1 });
  if (Math.random() < 0.07) {
    const near = LADDER.filter((g) => Math.abs((g.levelReq ?? 1) - level) <= 12);
    const pick = near[(Math.random() * near.length) | 0];
    if (pick) drops.push({ item: pick.id, qty: 1 });
  }
  return { gold, drops };
}

export { LADDER };
