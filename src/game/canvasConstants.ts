import { type ContinentId } from "@/game/continents";

export const PLAYER_SPEED = 140;
export const PLAYER_RADIUS = 10;
export const PASSIVE_SKILL_XP_PER_SEC = 2.5;
export const INTERACT_RADIUS = 1.35;

export type PromptState =
  | { kind: "gate"; target: ContinentId; name: string }
  | { kind: "hollow"; index: number }
  | { kind: "exit" }
  | null;

export type HudState = {
  x: number;
  y: number;
  level: number;
  xp: number;
  progress: number;
  next: number;
};
