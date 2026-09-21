/** Player combat stats, class attack profiles, and damage helpers (Tibia-flavored). */

import type { ClassId, ValeClass } from "@/game/classes";
import type { ValeCharacter } from "@/game/character";
import { skillLevelFromXp, type SkillId } from "@/game/skills";
import { levelFromXp } from "@/game/xp";

/** --- Combat-feel tunables (first hunt polish) --- */
/** Plaza fountain heal radius from spawn tile center (tiles). */
export const FOUNTAIN_HEAL_RADIUS_TILES = 1.4;
/** HP restored per second while standing on the fountain. */
export const FOUNTAIN_HEAL_PER_SEC = 28;
/** Min seconds between fountain "+HP" float texts. */
export const FOUNTAIN_HEAL_FLOAT_INTERVAL = 0.4;
/** Brief invulnerability after taking a hit (seconds). */
export const HIT_IFRAMES_SEC = 0.55;
/** Knockback distance on hit (pixels) so retreat stays readable. */
export const HIT_KNOCKBACK_PX = 30;
/** HP ratio that triggers a one-shot low-HP toast. */
export const LOW_HP_RATIO = 0.35;
export const LOW_HP_TOAST = "Low HP — retreat to the fountain!";

export type AttackStyle = "melee" | "distance" | "magic";

export interface AttackProfile {
  skill: SkillId;
  style: AttackStyle;
  /** Attack range in tiles. */
  range: number;
  /** Seconds between swings. */
  cooldown: number;
  /** Multiplier on skill-scaled damage. */
  damageMult: number;
  /** Optional mana cost per attack (magic). */
  manaCost: number;
  /** Verdant: heal fraction of damage dealt on kill. */
  healOnKill: number;
}

const BASE_HP = 80;
const HP_PER_COMBAT_LEVEL = 5;
const HP_PER_SHIELD_LEVEL = 2;
const BASE_MANA = 40;
const MANA_PER_MAGIC_LEVEL = 3;

/** Attack skill / style by class — light flavor, not full kits. */
export function attackProfileForClass(classId: ClassId): AttackProfile {
  switch (classId) {
    case "warden":
      return {
        skill: "sword",
        style: "melee",
        range: 1.35,
        cooldown: 0.9,
        damageMult: 1.05,
        manaCost: 0,
        healOnKill: 0,
      };
    case "thornblade":
      return {
        skill: "axe",
        style: "melee",
        range: 1.35,
        cooldown: 0.8,
        damageMult: 1.2,
        manaCost: 0,
        healOnKill: 0,
      };
    case "pathfinder":
      return {
        skill: "distance",
        style: "distance",
        range: 5.5,
        cooldown: 1.0,
        damageMult: 1.05,
        manaCost: 0,
        healOnKill: 0,
      };
    case "hearthmage":
      return {
        skill: "magic",
        style: "magic",
        range: 4.5,
        cooldown: 1.05,
        damageMult: 1.15,
        manaCost: 4,
        healOnKill: 0,
      };
    case "verdant":
      return {
        skill: "magic",
        style: "magic",
        range: 4.2,
        cooldown: 1.1,
        damageMult: 0.95,
        manaCost: 3,
        healOnKill: 0.25,
      };
    case "hollowborn":
      return {
        skill: "fist",
        style: "melee",
        range: 2.4,
        cooldown: 0.75,
        damageMult: 1.0,
        manaCost: 0,
        healOnKill: 0,
      };
  }
}

export function maxHpFor(character: ValeCharacter): number {
  const combatLevel = levelFromXp(character.combatXp);
  const shieldLevel = skillLevelFromXp(character.skillXp.shielding);
  return (
    BASE_HP +
    combatLevel * HP_PER_COMBAT_LEVEL +
    shieldLevel * HP_PER_SHIELD_LEVEL
  );
}

export function maxManaFor(character: ValeCharacter, cls: ValeClass): number {
  const profile = attackProfileForClass(cls.id);
  if (profile.style !== "magic" && cls.id !== "verdant" && cls.id !== "hearthmage") {
    return 0;
  }
  const magicLevel = skillLevelFromXp(character.skillXp.magic);
  return BASE_MANA + magicLevel * MANA_PER_MAGIC_LEVEL;
}

export function usesMana(classId: ClassId): boolean {
  return classId === "hearthmage" || classId === "verdant";
}

/** Physical / magic hit vs foe. Small random variance. */
export function playerAttackDamage(
  character: ValeCharacter,
  profile: AttackProfile,
  rng: () => number,
): number {
  const skillLevel = skillLevelFromXp(character.skillXp[profile.skill]);
  const base = 4 + skillLevel * 1.6;
  const roll = 0.85 + rng() * 0.3;
  return Math.max(1, Math.floor(base * profile.damageMult * roll));
}

/** Incoming damage reduced by shielding. */
export function mitigateDamage(
  character: ValeCharacter,
  raw: number,
  rng: () => number,
): number {
  const shieldLevel = skillLevelFromXp(character.skillXp.shielding);
  const reduction = Math.min(0.55, shieldLevel * 0.025);
  const roll = 0.9 + rng() * 0.2;
  return Math.max(1, Math.floor(raw * (1 - reduction) * roll));
}

export function enemyAttackDamage(enemyLevel: number, atk: number, rng: () => number): number {
  const roll = 0.85 + rng() * 0.3;
  return Math.max(1, Math.floor((atk + enemyLevel * 0.8) * roll));
}

/** Mild gold loss on death (Tibia-like, soft). */
export function goldLostOnDeath(gold: number): number {
  return Math.min(gold, Math.max(1, Math.floor(gold * 0.05)));
}
