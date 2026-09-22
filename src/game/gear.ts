import type { ItemDef, Rarity, EquipSlot } from "./items";
import type { SkillId, SkillSet } from "./skills";

export type SkillNeed = { skill: SkillId; level: number };

type SetRow = {
  lv: number;
  rarity: Rarity;
  tag: string;
  melee: string;
  bow: string;
  wand: string;
  rod: string;
  ward: string;
  helm: string;
  chest: string;
  legs: string;
  boots: string;
  amulet: string;
  ring: string;
};

const SETS: SetRow[] = [
  { lv: 1, rarity: "common", tag: "splinter", melee: "Splinter", bow: "Twig bow", wand: "Reed wand", rod: "Reed rod", ward: "Pot lid", helm: "Cloth cap", chest: "Sack wrap", legs: "Patched legs", boots: "Wrap sandals", amulet: "Twine charm", ring: "Copper wire" },
  { lv: 5, rarity: "common", tag: "ash", melee: "Ash blade", bow: "Ash bow", wand: "Ash wand", rod: "Ash rod", ward: "Scrap buckler", helm: "Hide cap", chest: "Linen wrap", legs: "Hide chausses", boots: "Trail sandals", amulet: "Bone charm", ring: "Copper band" },
  { lv: 10, rarity: "uncommon", tag: "thorn", melee: "Thorn steel", bow: "Yew bow", wand: "Thorn wand", rod: "Thorn rod", ward: "Oak kite", helm: "Ranger hood", chest: "Wolf jerkin", legs: "Hunter legs", boots: "Trail boots", amulet: "Fang torc", ring: "Hunter signet" },
  { lv: 15, rarity: "uncommon", tag: "mill", melee: "Mill iron", bow: "Mill longbow", wand: "Quern wand", rod: "Quern rod", ward: "Mill lid", helm: "Iron cap", chest: "Mill hauberk", legs: "Mill greaves", boots: "Mill boots", amulet: "Grain charm", ring: "Mill loop" },
  { lv: 20, rarity: "rare", tag: "iron", melee: "Ravenford edge", bow: "Horn recurve", wand: "College wand", rod: "College rod", ward: "Iron ward", helm: "Iron helm", chest: "Iron wrap", legs: "Plate greaves", boots: "Hobnail boots", amulet: "Moon-well", ring: "Weave loop" },
  { lv: 25, rarity: "rare", tag: "raven", melee: "Raven brand", bow: "Raven bow", wand: "Ink wand", rod: "Ink rod", ward: "Raven kite", helm: "Raven helm", chest: "Raven mail", legs: "Raven greaves", boots: "Raven boots", amulet: "Raven eye", ring: "Raven seal" },
  { lv: 30, rarity: "rare", tag: "dawn", melee: "Dawn brand", bow: "Dawn longbow", wand: "Dawn wand", rod: "Dawn rod", ward: "King's ward", helm: "Dawn circlet", chest: "Dawn mail", legs: "Dawn greaves", boots: "Dawn treads", amulet: "Dawn heart", ring: "Dawn seal" },
  { lv: 35, rarity: "epic", tag: "star", melee: "Star steel", bow: "Star bow", wand: "Star wand", rod: "Star rod", ward: "Star aegis", helm: "Star helm", chest: "Star mail", legs: "Star greaves", boots: "Star treads", amulet: "Star well", ring: "Star loop" },
  { lv: 40, rarity: "epic", tag: "vale", melee: "Valeheart", bow: "Vale longbow", wand: "Vale wand", rod: "Vale rod", ward: "Vale aegis", helm: "Vale helm", chest: "Vale mail", legs: "Vale greaves", boots: "Vale treads", amulet: "Vale heart", ring: "Vale seal" },
  { lv: 45, rarity: "epic", tag: "ember", melee: "Emberfold iron", bow: "Cinder bow", wand: "Kiln wand", rod: "Kiln rod", ward: "Ember ward", helm: "Cinder helm", chest: "Drake mail", legs: "Ember greaves", boots: "Ember treads", amulet: "Ember heart", ring: "Cinder loop" },
  { lv: 50, rarity: "legendary", tag: "frost", melee: "Wintermere ice", bow: "Frost bow", wand: "Rime wand", rod: "Rime rod", ward: "Frost aegis", helm: "Rime helm", chest: "Frost mail", legs: "Frost greaves", boots: "Frost treads", amulet: "Rime well", ring: "Ice seal" },
  { lv: 55, rarity: "legendary", tag: "glass", melee: "Glasswaste fang", bow: "Glass bow", wand: "Sand wand", rod: "Sand rod", ward: "Glass aegis", helm: "Glass helm", chest: "Glass mail", legs: "Glass greaves", boots: "Glass treads", amulet: "Sun well", ring: "Glass loop" },
  { lv: 60, rarity: "legendary", tag: "night", melee: "Duskwood nightblade", bow: "Night bow", wand: "Veil wand", rod: "Veil rod", ward: "Night aegis", helm: "Night helm", chest: "Night mail", legs: "Night greaves", boots: "Night treads", amulet: "Night well", ring: "Night seal" },
  { lv: 65, rarity: "mythical", tag: "story", melee: "Story-steel", bow: "Story bow", wand: "Story wand", rod: "Story rod", ward: "Story aegis", helm: "Story helm", chest: "Story mail", legs: "Story greaves", boots: "Story treads", amulet: "Story well", ring: "Story seal" },
  { lv: 70, rarity: "mythical", tag: "time", melee: "Time's Edge", bow: "Time's bow", wand: "Time's wand", rod: "Time's rod", ward: "Time's aegis", helm: "Time's helm", chest: "Time's mail", legs: "Time's greaves", boots: "Time's treads", amulet: "Time's well", ring: "Time's seal" },
  { lv: 75, rarity: "mythical", tag: "crown", melee: "Crown brand", bow: "Crown bow", wand: "Crown wand", rod: "Crown rod", ward: "Crown aegis", helm: "Hollow crown", chest: "Crown mail", legs: "Crown greaves", boots: "Crown treads", amulet: "Crown well", ring: "Crown seal" },
  { lv: 80, rarity: "mythical", tag: "first", melee: "First edge", bow: "First bow", wand: "First wand", rod: "First rod", ward: "First aegis", helm: "First helm", chest: "First mail", legs: "First greaves", boots: "First treads", amulet: "The First Story", ring: "First seal" },
  { lv: 85, rarity: "relic", tag: "old", melee: "Old-tongue", bow: "Old bow", wand: "Old wand", rod: "Old rod", ward: "Old aegis", helm: "Old helm", chest: "Old mail", legs: "Old greaves", boots: "Old treads", amulet: "Old well", ring: "Old seal" },
  { lv: 90, rarity: "relic", tag: "name", melee: "Name-keeper", bow: "Name bow", wand: "Name wand", rod: "Name rod", ward: "Name aegis", helm: "Name helm", chest: "Name mail", legs: "Name greaves", boots: "Name treads", amulet: "Name well", ring: "Name seal" },
  { lv: 95, rarity: "relic", tag: "hollow", melee: "Hollow fang", bow: "Hollow bow", wand: "Hollow wand", rod: "Hollow rod", ward: "Hollow aegis", helm: "Hollow helm", chest: "Hollow mail", legs: "Hollow greaves", boots: "Hollow treads", amulet: "Hollow well", ring: "Hollow seal" },
  { lv: 100, rarity: "relic", tag: "last", melee: "The Last Word", bow: "The Last Flight", wand: "The Last Weave", rod: "The Last Light", ward: "The Last Ward", helm: "The Last Brow", chest: "The Last Hide", legs: "The Last Step", boots: "The Last Road", amulet: "The Last Name", ring: "The Last Seal" },
];

const RM: Record<Rarity, number> = {
  common: 1,
  uncommon: 1.22,
  rare: 1.48,
  epic: 1.82,
  legendary: 2.25,
  mythical: 2.8,
  relic: 3.5,
};

const VALUE: Record<Rarity, number> = {
  common: 1,
  uncommon: 1.7,
  rare: 2.6,
  epic: 4,
  legendary: 6.2,
  mythical: 9.5,
  relic: 14,
};

function fightSkill(lv: number) {
  return Math.max(10, Math.round(lv * 0.7 + 10));
}
function magicSkill(lv: number) {
  return Math.max(0, Math.round(lv * 0.55));
}
function shieldSkill(lv: number) {
  return Math.max(10, Math.round(lv * 0.65 + 8));
}

function gear(
  id: string,
  name: string,
  slot: EquipSlot,
  rarity: Rarity,
  levelReq: number,
  value: number,
  stats: { attack?: number; distance?: number; armor?: number; hp?: number; mp?: number },
  desc: string,
  skillReq?: SkillNeed,
): ItemDef {
  return { id, name, value, kind: "gear", desc, slot, rarity, levelReq, skillReq, ...stats };
}

function atk(lv: number, r: Rarity) {
  return Math.max(5, Math.round(5 + (lv - 1) * 0.42 * RM[r]));
}
function dist(lv: number, r: Rarity) {
  return Math.max(5, Math.round(5 + (lv - 1) * 0.4 * RM[r]));
}
function arm(lv: number, r: Rarity, w: number) {
  return Math.max(1, Math.round((2 + (lv - 1) * 0.2 * RM[r]) * w));
}
function hp(lv: number, r: Rarity, w: number) {
  return Math.round((4 + (lv - 1) * 0.18 * RM[r]) * w);
}
function mp(lv: number, r: Rarity, w: number) {
  return Math.round((3 + (lv - 1) * 0.16 * RM[r]) * w);
}
function val(lv: number, r: Rarity) {
  return Math.max(8, Math.round(10 * lv * VALUE[r]));
}

export const LADDER: ItemDef[] = [];

for (const s of SETS) {
  const r = s.rarity;
  const lv = s.lv;
  const v = val(lv, r);
  const fs = fightSkill(lv);
  const ms = magicSkill(lv);
  const ss = shieldSkill(lv);
  LADDER.push(
    gear(`melee_${s.tag}`, s.melee, "weapon", r, lv, v, { attack: atk(lv, r) }, `Melee. Combat ${lv}. Fighting ${fs}.`, { skill: "fight", level: fs }),
    gear(`bow_${s.tag}`, s.bow, "weapon", r, lv, v, { distance: dist(lv, r) }, `Distance. Combat ${lv}. Fighting ${fs}.`, { skill: "fight", level: fs }),
    gear(`wand_${s.tag}`, s.wand, "weapon", r, lv, Math.round(v * 0.95), { distance: dist(lv, r) - 1, mp: mp(lv, r, 0.8) }, `Wand. Combat ${lv}. Magic ${ms}.`, { skill: "magic", level: ms }),
    gear(`rod_${s.tag}`, s.rod, "weapon", r, lv, Math.round(v * 0.95), { distance: dist(lv, r) - 1, mp: mp(lv, r, 1) }, `Rod. Combat ${lv}. Magic ${ms}.`, { skill: "magic", level: ms }),
    gear(`ward_${s.tag}`, s.ward, "offhand", r, lv, Math.round(v * 0.85), { armor: arm(lv, r, 0.9), hp: hp(lv, r, 0.4) }, `Off-hand. Combat ${lv}. Shielding ${ss}.`, { skill: "shielding", level: ss }),
    gear(`helm_${s.tag}`, s.helm, "helm", r, lv, Math.round(v * 0.7), { armor: arm(lv, r, 0.45), hp: hp(lv, r, 0.35) }, `Helm. Combat ${lv}. Shielding ${ss}.`, { skill: "shielding", level: ss }),
    gear(`chest_${s.tag}`, s.chest, "chest", r, lv, Math.round(v * 1.1), { armor: arm(lv, r, 1), hp: hp(lv, r, 0.7) }, `Chest. Combat ${lv}. Shielding ${ss}.`, { skill: "shielding", level: ss }),
    gear(`legs_${s.tag}`, s.legs, "legs", r, lv, Math.round(v * 0.8), { armor: arm(lv, r, 0.7) }, `Legs. Combat ${lv}. Shielding ${ss}.`, { skill: "shielding", level: ss }),
    gear(`boots_${s.tag}`, s.boots, "boots", r, lv, Math.round(v * 0.6), { armor: arm(lv, r, 0.4) }, `Boots. Combat ${lv}. Shielding ${ss}.`, { skill: "shielding", level: ss }),
    gear(`amulet_${s.tag}`, s.amulet, "amulet", r, lv, Math.round(v * 0.9), { hp: hp(lv, r, 0.9), mp: mp(lv, r, 0.6) }, `Amulet. Combat ${lv}.`, undefined),
    gear(`ring_${s.tag}`, s.ring, "ring", r, lv, Math.round(v * 0.85), { attack: Math.max(0, Math.round(atk(lv, r) * 0.18)), mp: mp(lv, r, 0.5) }, `Ring. Combat ${lv}.`, undefined),
  );
}

/** Named extras the shops and hunts still drop. */
export const GEAR_EXTRAS: ItemDef[] = [
  gear("hunting_knife", "Hunting knife", "weapon", "common", 1, 18, { attack: 3 }, "For hide, not glory.", { skill: "fight", level: 10 }),
  gear("yew_bow", "Greenpath yew", "weapon", "common", 1, 24, { distance: 5 }, "A first ranger's stave.", { skill: "fight", level: 10 }),
  gear("hunter_longbow", "Hunter longbow", "weapon", "uncommon", 10, 78, { distance: 10 }, "Greenpath yew, second cut.", { skill: "fight", level: 18 }),
  gear("copse_recurve", "Copse recurve", "weapon", "rare", 20, 190, { distance: 17 }, "Horn and sinew.", { skill: "fight", level: 24 }),
  gear("leather_quiver", "Leather quiver", "offhand", "common", 1, 16, { distance: 1 }, "Twenty shafts.", { skill: "fight", level: 10 }),
  gear("bodkin_quiver", "Bodkin quiver", "offhand", "uncommon", 10, 70, { distance: 3 }, "Points for mail.", { skill: "fight", level: 18 }),
  gear("apprentice_wand", "Apprentice wand", "weapon", "common", 1, 20, { distance: 4, mp: 6 }, "Ashen College issue.", { skill: "magic", level: 0 }),
  gear("frost_orb", "Frost orb", "offhand", "uncommon", 10, 88, { mp: 12, attack: 2 }, "Cold in the palm.", { skill: "magic", level: 5 }),
  gear("college_robe", "College robe", "chest", "uncommon", 8, 76, { mp: 14, armor: 2 }, "Ink at the cuffs.", { skill: "magic", level: 4 }),
  gear("pelt_cloak", "Pelt cloak", "chest", "uncommon", 5, 54, { armor: 4, hp: 6 }, "A wolf that keeps you warm now.", { skill: "shielding", level: 12 }),
  gear("ranger_hood", "Ranger hood", "helm", "uncommon", 8, 46, { armor: 2 }, "Keeps the copse out of your eyes.", { skill: "shielding", level: 14 }),
  gear("ranger_jerkin", "Ranger jerkin", "chest", "uncommon", 10, 82, { armor: 5 }, "Quiet leather.", { skill: "shielding", level: 16 }),
  gear("glass_pinion", "Glass pinion", "weapon", "epic", 40, 640, { attack: 30 }, "A shrike's primary.", { skill: "fight", level: 38 }),
  gear("hag_lantern", "Hag lantern", "offhand", "epic", 40, 580, { mp: 22, attack: 4 }, "Swampfire in a cage.", { skill: "magic", level: 22 }),
  gear("salt_carapace", "Salt carapace", "offhand", "rare", 20, 210, { armor: 13 }, "A crab's idea of a shield.", { skill: "shielding", level: 22 }),
  gear("wight_shroud_cloak", "Wight shroud", "chest", "rare", 20, 260, { armor: 10, hp: 8 }, "Linen that remembers a name.", { skill: "shielding", level: 22 }),
  gear("cinder_core_amulet", "Cinder core", "amulet", "epic", 35, 520, { attack: 6, mp: 14 }, "Still ticks with kiln-heat."),
  gear("barrow_signet", "Barrow signet", "ring", "rare", 20, 240, { attack: 5, hp: 8 }, "Bronze from Copsebarrow."),
];

export function canWear(d: ItemDef, level: number, skills: SkillSet): string | null {
  if (d.kind !== "gear") return "That is not gear.";
  if ((d.levelReq ?? 1) > level) return `Need combat ${d.levelReq}.`;
  if (d.skillReq && skills[d.skillReq.skill].level < d.skillReq.level) {
    const n = d.skillReq.skill === "fight" ? "fighting" : d.skillReq.skill;
    return `Need ${n} ${d.skillReq.level}.`;
  }
  return null;
}

export function gearBySlot(slot: EquipSlot): ItemDef[] {
  return LADDER.filter((g) => g.slot === slot);
}

export const GEAR_LEVELS = SETS.map((s) => s.lv);
