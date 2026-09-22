import type { ClassId } from "./classes";

export type SkillId = "fight" | "magic" | "shielding";

export type SkillState = { level: number; tries: number };

export type SkillSet = {
  fight: SkillState;
  magic: SkillState;
  shielding: SkillState;
};

export type VocationSkills = {
  fightName: string;
  fightShort: string;
  fightKind: "melee" | "distance";
  fightRate: number;
  fightStart: number;
  magicRate: number;
  magicStart: number;
  shieldRate: number;
  shieldStart: number;
};

/** Tibia vocation rates: lower = trains faster. 1.1 is a knight's sword. */
export const VOCATION: Record<ClassId, VocationSkills> = {
  warrior: {
    fightName: "Sword Fighting",
    fightShort: "Sword",
    fightKind: "melee",
    fightRate: 1.1,
    fightStart: 10,
    magicRate: 3,
    magicStart: 0,
    shieldRate: 1.1,
    shieldStart: 10,
  },
  archer: {
    fightName: "Distance Fighting",
    fightShort: "Distance",
    fightKind: "distance",
    fightRate: 1.1,
    fightStart: 10,
    magicRate: 1.4,
    magicStart: 0,
    shieldRate: 1.5,
    shieldStart: 10,
  },
  mage: {
    fightName: "Wand Fighting",
    fightShort: "Wand",
    fightKind: "distance",
    fightRate: 2,
    fightStart: 10,
    magicRate: 1.1,
    magicStart: 0,
    shieldRate: 2,
    shieldStart: 10,
  },
  healer: {
    fightName: "Rod Fighting",
    fightShort: "Rod",
    fightKind: "distance",
    fightRate: 2,
    fightStart: 10,
    magicRate: 1.1,
    magicStart: 0,
    shieldRate: 1.8,
    shieldStart: 10,
  },
  paladin: {
    fightName: "Club Fighting",
    fightShort: "Club",
    fightKind: "melee",
    fightRate: 1.2,
    fightStart: 10,
    magicRate: 1.4,
    magicStart: 0,
    shieldRate: 1.1,
    shieldStart: 10,
  },
  monk: {
    fightName: "Fist Fighting",
    fightShort: "Fist",
    fightKind: "melee",
    fightRate: 1.1,
    fightStart: 10,
    magicRate: 1.6,
    magicStart: 0,
    shieldRate: 1.3,
    shieldStart: 10,
  },
};

export function defaultSkills(classId: ClassId): SkillSet {
  const v = VOCATION[classId];
  return {
    fight: { level: v.fightStart, tries: 0 },
    magic: { level: v.magicStart, tries: 0 },
    shielding: { level: v.shieldStart, tries: 0 },
  };
}

export function sanitizeSkills(classId: ClassId, raw?: Partial<SkillSet> | null): SkillSet {
  const base = defaultSkills(classId);
  if (!raw) return base;
  for (const key of ["fight", "magic", "shielding"] as const) {
    const s = raw[key];
    if (!s) continue;
    base[key] = {
      level: Math.max(0, Math.min(200, Math.floor(Number(s.level) || base[key].level))),
      tries: Math.max(0, Math.floor(Number(s.tries) || 0)),
    };
  }
  return base;
}

/** Tries to go from `level` to `level+1`. Tibia exponential. */
export function triesToAdvance(level: number, rate: number, start: number, kind: "fight" | "magic" | "shielding"): number {
  if (kind === "magic") return Math.max(24, Math.floor(1600 * Math.pow(rate, Math.max(0, level))));
  const exp = Math.max(0, level - start);
  return Math.max(8, Math.floor(50 * Math.pow(rate, exp)));
}

export function addTries(
  skill: SkillState,
  amount: number,
  rate: number,
  start: number,
  kind: "fight" | "magic" | "shielding",
): boolean {
  if (amount <= 0) return false;
  skill.tries += amount;
  let leveled = false;
  for (let i = 0; i < 12; i++) {
    const need = triesToAdvance(skill.level, rate, start, kind);
    if (skill.tries < need) break;
    skill.tries -= need;
    skill.level += 1;
    leveled = true;
  }
  return leveled;
}

export function loseSkillProgress(
  skill: SkillState,
  rate: number,
  start: number,
  kind: "fight" | "magic" | "shielding",
): number {
  const need = triesToAdvance(skill.level, rate, start, kind);
  const loss = Math.max(1, Math.ceil(need * 0.03));
  skill.tries -= loss;
  let dropped = 0;
  while (skill.tries < 0 && skill.level > start) {
    skill.level -= 1;
    dropped += 1;
    skill.tries += triesToAdvance(skill.level, rate, start, kind);
  }
  if (skill.tries < 0) skill.tries = 0;
  return dropped;
}

export function skillProgress(skill: SkillState, rate: number, start: number, kind: "fight" | "magic" | "shielding"): number {
  const need = triesToAdvance(skill.level, rate, start, kind);
  if (need <= 0) return 1;
  return Math.max(0, Math.min(1, skill.tries / need));
}

/**
 * Tibia melee/distance max hit:
 * ceil(skill * attack * 0.05 + attack * 0.085 + level/5)
 */
export function rollFightHit(weaponAttack: number, skill: number, level: number): number {
  const A = weaponAttack * 2.2;
  const max = Math.max(1, Math.ceil(skill * (A * 0.05) + A * 0.085 + level / 5));
  const min = Math.max(1, Math.floor(max * 0.22));
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Tibia-like spell: level/5 + maglevel * 1.4..2.2 */
export function rollSpellHit(level: number, maglevel: number, factor = 1): number {
  const min = level / 5 + maglevel * 1.4 + 8;
  const max = level / 5 + maglevel * 2.2 + 16;
  return Math.max(1, Math.floor((min + Math.random() * (max - min)) * factor));
}

export function rollHeal(level: number, maglevel: number, base: number): number {
  return Math.floor(base + level / 5 + maglevel * 2.4);
}

/** Higher fight skill = shorter swing. Floor at 48% of the class interval. */
export function attackInterval(baseCd: number, skill: number, start: number): number {
  const extra = Math.max(0, skill - start);
  const factor = 1 / (1 + extra * 0.028);
  return Math.max(baseCd * 0.48, baseCd * factor);
}

/** Higher magic level = shorter spell cooldowns. Floor at 55%. */
export function spellInterval(baseCd: number, maglevel: number): number {
  const factor = 1 / (1 + maglevel * 0.022);
  return Math.max(baseCd * 0.55, baseCd * factor);
}

export function shieldBonus(skill: number): number {
  return skill * 0.12;
}

/** Mana spent per second at a font. Tibia vocation sit-regen, roughly. */
export function trainManaPerSec(classId: ClassId): number {
  const r = VOCATION[classId].magicRate;
  if (r <= 1.15) return 2;
  if (r <= 1.5) return 1;
  return 1 / 3;
}

export function cloneSkills(s: SkillSet): SkillSet {
  return {
    fight: { ...s.fight },
    magic: { ...s.magic },
    shielding: { ...s.shielding },
  };
}
