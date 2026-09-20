/** Vale character classes — path biases for Tibia-style skills. */

import type { SkillId } from "@/game/skills";

export type ClassId =
  | "warden"
  | "thornblade"
  | "pathfinder"
  | "hearthmage"
  | "verdant"
  | "hollowborn";

export interface ValeClass {
  id: ClassId;
  name: string;
  blurb: string;
  /** Accent hex used for HUD tint and player glow. */
  accent: string;
  /** Lighter highlight for gradients. */
  accentLite: string;
  /** Darker edge for gradients. */
  accentDark: string;
  /** Skill that gains tiny XP while moving. */
  primarySkill: SkillId;
  /** Starting skill levels (default 1 if omitted). */
  startingLevels: Partial<Record<SkillId, number>>;
  /** Multiplier applied when training favored skills (default 1). */
  gainMultipliers: Partial<Record<SkillId, number>>;
}

export const CLASSES: ValeClass[] = [
  {
    id: "warden",
    name: "Warden",
    blurb: "Melee tank — sword and shielding keep the hollow safe.",
    accent: "#6b8cae",
    accentLite: "#a8c4e0",
    accentDark: "#3a5570",
    primarySkill: "shielding",
    startingLevels: { sword: 4, shielding: 6, club: 2 },
    gainMultipliers: { sword: 1.35, shielding: 1.5, club: 1.15 },
  },
  {
    id: "thornblade",
    name: "Thornblade",
    blurb: "Melee DPS — axe and sword cut through the undergrowth.",
    accent: "#c45c3e",
    accentLite: "#e89a7a",
    accentDark: "#7a3018",
    primarySkill: "axe",
    startingLevels: { axe: 6, sword: 4, fist: 2 },
    gainMultipliers: { axe: 1.5, sword: 1.35, fist: 1.1 },
  },
  {
    id: "pathfinder",
    name: "Pathfinder",
    blurb: "Ranged scout — distance and footwork across the Vale.",
    accent: "#5a9e6a",
    accentLite: "#9ad4a8",
    accentDark: "#2e5c3a",
    primarySkill: "distance",
    startingLevels: { distance: 6, fist: 3, sword: 2 },
    gainMultipliers: { distance: 1.5, fist: 1.15, sword: 1.1 },
  },
  {
    id: "hearthmage",
    name: "Hearthmage",
    blurb: "Offensive magic — fire and force from the hearth-stone.",
    accent: "#c97a2a",
    accentLite: "#e8b86a",
    accentDark: "#7a4510",
    primarySkill: "magic",
    startingLevels: { magic: 6, club: 2, shielding: 2 },
    gainMultipliers: { magic: 1.55, club: 1.1 },
  },
  {
    id: "verdant",
    name: "Verdant",
    blurb: "Support heal magic — green light mends thorn and bone.",
    accent: "#7ab85a",
    accentLite: "#b8e090",
    accentDark: "#3e6a28",
    primarySkill: "magic",
    startingLevels: { magic: 6, shielding: 3, distance: 2 },
    gainMultipliers: { magic: 1.5, shielding: 1.2, distance: 1.1 },
  },
  {
    id: "hollowborn",
    name: "Hollowborn",
    blurb: "Hybrid fist and light distance — quiet steps in the mist.",
    accent: "#8a7a9e",
    accentLite: "#c4b8d8",
    accentDark: "#4a3e5c",
    primarySkill: "fist",
    startingLevels: { fist: 6, distance: 4, shielding: 2 },
    gainMultipliers: { fist: 1.5, distance: 1.3, shielding: 1.1 },
  },
];

export function getClass(id: ClassId): ValeClass {
  const found = CLASSES.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown class: ${id}`);
  return found;
}
