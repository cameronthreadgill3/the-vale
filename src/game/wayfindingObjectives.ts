/** Wayfinding objectives + distance helpers. */
import { TILE, type WorldMap } from "@/game/world";
import type { FolkDef } from "@/game/folk";
import type { Enemy } from "@/game/enemies";
import {
  TEETH_RATS_NEEDED,
  ASHWOOD_CAIRNS_NEEDED,
  getTeethQuest,
  getAshwoodQuest,
  isTeethActive,
  isAshwoodActive,
  loadQuestLog,
  type TeethQuestProgress,
  type AshwoodQuestProgress,
} from "@/game/quests";
import { ASHWOOD_CAIRNS } from "@/game/cairns";

export type WayfindObjective = {
  label: string;
  x: number;
  y: number;
  kind: "folk" | "enemy" | "landmark" | "cairn";
};

export type RadarDot = {
  x: number;
  y: number;
  color: string;
  quest?: boolean;
};

export const WAYFIND_LABEL_RANGE = 8;
export const WAYFIND_RADAR_RANGE = 14;

export function resolveQuestObjective(
  player: { x: number; y: number },
  enemies: Enemy[],
  folk: FolkDef[],
  _map: WorldMap,
): WayfindObjective | null {
  const log = loadQuestLog();
  if (isAshwoodActive(log)) {
    const q = getAshwoodQuest(log);
    if (q) return objectiveForAshwood(q, player, enemies, folk);
  }
  if (isTeethActive(log)) {
    const q = getTeethQuest(log);
    if (q) return objectiveForTeeth(q, player, enemies, folk);
  }
  return null;
}

export function objectiveForAshwood(
  q: AshwoodQuestProgress,
  player: { x: number; y: number },
  enemies: Enemy[],
  folk: FolkDef[],
): WayfindObjective | null {
  if (q.status !== "active") return null;
  const rook = folk.find((f) => f.id === "rook");
  const nextCairn = ASHWOOD_CAIRNS.find((c) => !q.cairnsVisited.includes(c.id));
  if (nextCairn) {
    return {
      label: `Inspect ${nextCairn.name} (${q.cairnsVisited.length}/${ASHWOOD_CAIRNS_NEEDED})`,
      x: (nextCairn.x + 0.5) * TILE,
      y: (nextCairn.y + 0.5) * TILE,
      kind: "cairn",
    };
  }
  if (!q.wrongPreyDone) {
    const rat = nearestEnemy(player, enemies, "needle-rat");
    if (rat) return { label: "Wrong prey · Needle Rat", x: rat.x, y: rat.y, kind: "enemy" };
    const hound = nearestEnemy(player, enemies, "bark-hound");
    if (hound) return { label: "Wrong prey · Bark Hound", x: hound.x, y: hound.y, kind: "enemy" };
    return {
      label: "Find wrong prey (ashwood)",
      x: player.x + TILE * 6,
      y: player.y - TILE * 2,
      kind: "landmark",
    };
  }
  if (rook) {
    return {
      label: "Return to Rook",
      x: (rook.x + 0.5) * TILE,
      y: (rook.y + 0.5) * TILE,
      kind: "folk",
    };
  }
  return null;
}

export function objectiveForTeeth(
  q: TeethQuestProgress,
  player: { x: number; y: number },
  enemies: Enemy[],
  folk: FolkDef[],
): WayfindObjective | null {
  if (q.status !== "active") return null;
  const rook = folk.find((f) => f.id === "rook");
  if (!q.identifiedRat) {
    const rat = nearestEnemy(player, enemies, "needle-rat");
    if (rat) return { label: "Identify Needle Rat", x: rat.x, y: rat.y, kind: "enemy" };
    if (rook) {
      return {
        label: "Talk to Rook (watch)",
        x: (rook.x + 0.5) * TILE,
        y: (rook.y + 0.5) * TILE,
        kind: "folk",
      };
    }
  }
  if (q.ratsKilled < TEETH_RATS_NEEDED) {
    const rat = nearestEnemy(player, enemies, "needle-rat");
    if (rat) {
      return {
        label: `Defeat Needle Rat (${q.ratsKilled}/${TEETH_RATS_NEEDED})`,
        x: rat.x,
        y: rat.y,
        kind: "enemy",
      };
    }
    return {
      label: "Hunt Needle Rats (ashwood edge)",
      x: player.x + TILE * 6,
      y: player.y,
      kind: "landmark",
    };
  }
  if (!q.houndDone) {
    const hound = nearestEnemy(player, enemies, "bark-hound");
    if (hound) return { label: "Survive Bark Hound", x: hound.x, y: hound.y, kind: "enemy" };
    return {
      label: "Find Bark Hound (ashwood)",
      x: player.x + TILE * 8,
      y: player.y - TILE * 2,
      kind: "landmark",
    };
  }
  if (rook) {
    return {
      label: "Return to Rook",
      x: (rook.x + 0.5) * TILE,
      y: (rook.y + 0.5) * TILE,
      kind: "folk",
    };
  }
  return null;
}

function nearestEnemy(
  player: { x: number; y: number },
  enemies: Enemy[],
  kindId: string,
): Enemy | null {
  let best: Enemy | null = null;
  let bestD = Infinity;
  for (const e of enemies) {
    if (e.hp <= 0) continue;
    if (e.kind.id !== kindId) continue;
    const d = Math.hypot(e.x - player.x, e.y - player.y);
    if (d < bestD) {
      bestD = d;
      best = e;
    }
  }
  return best;
}

export function tilesAway(
  player: { x: number; y: number },
  target: { x: number; y: number },
): number {
  return Math.max(
    0,
    Math.round(Math.hypot(target.x - player.x, target.y - player.y) / TILE),
  );
}
