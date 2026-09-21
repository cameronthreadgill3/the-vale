import { type ContinentId } from "@/game/continents";

export const PLAYER_SPEED = 140;
export const PLAYER_RADIUS = 10;
export const PASSIVE_SKILL_XP_PER_SEC = 2.5;
export const INTERACT_RADIUS = 1.35;

export type PromptState =
  | { kind: "gate"; target: ContinentId; name: string }
  | { kind: "hollow"; index: number }
  | { kind: "exit" }
  | { kind: "folk"; folkId: string; name: string; hasShop: boolean; hasBank: boolean; hasCraft?: boolean }
  | { kind: "shop"; shopId: string; name: string }
  | { kind: "ship"; dockId: string; name: string }
  | { kind: "cairn"; cairnId: string; name: string }
  | { kind: "profession"; nodeId: string; name: string; verb: "Gather" | "Fish" }
  | null;

export type HudState = {
  x: number;
  y: number;
  level: number;
  xp: number;
  progress: number;
  next: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  /** Carried pack weight. */
  weight: number;
  maxWeight: number;
  slots: number;
  maxSlots: number;
  /** Thornreach plaza / fountain — no PvE. */
  inSafeZone: boolean;
  /** Active quest objective line (wayfinding). */
  objectiveLabel?: string | null;
  /** Distance to objective in tiles. */
  objectiveDist?: number | null;
  /** Current hunt ground · rec-level, when standing in a Thornreach zone. */
  huntZoneLabel?: string | null;
};

/** Combat pacing / ranges (seconds, tiles). */
export const ATTACK_HOLD_REPEAT = true;
