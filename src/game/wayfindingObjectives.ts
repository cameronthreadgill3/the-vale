/** Wayfinding objectives + distance helpers. */
import { TILE, type WorldMap } from "@/game/world";
import type { FolkDef } from "@/game/folk";
import type { Enemy } from "@/game/enemies";
import {
  TEETH_RATS_NEEDED,
  ASHWOOD_CAIRNS_NEEDED,
  HOLLOW_WISPS_NEEDED,
  getTeethQuest,
  getAshwoodQuest,
  getHollowQuest,
  getGateWatchQuest,
  isTeethActive,
  isAshwoodActive,
  isHollowActive,
  isGateWatchActive,
  loadQuestLog,
  type TeethQuestProgress,
  type AshwoodQuestProgress,
  type HollowQuestProgress,
  type GateWatchQuestProgress,
} from "@/game/quests";
import { ASHWOOD_CAIRNS } from "@/game/cairns";
import { huntZoneById } from "@/game/huntZones";

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
/** Hunt cairns read from farther than folk/gates so Rec. bands are wayfindable. */
export const HUNT_CAIRN_LABEL_RANGE = 12;
export const WAYFIND_RADAR_RANGE = 14;

export function resolveQuestObjective(
  player: { x: number; y: number },
  enemies: Enemy[],
  folk: FolkDef[],
  map: WorldMap,
): WayfindObjective | null {
  const log = loadQuestLog();
  if (isGateWatchActive(log)) {
    const q = getGateWatchQuest(log);
    if (q) return objectiveForGateWatch(q, player, folk, map);
  }
  if (isHollowActive(log)) {
    const q = getHollowQuest(log);
    if (q) return objectiveForHollow(q, player, enemies, folk, map);
  }
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

export function objectiveForGateWatch(
  q: GateWatchQuestProgress,
  player: { x: number; y: number },
  folk: FolkDef[],
  map: WorldMap,
): WayfindObjective | null {
  if (q.status !== "active") return null;
  const rook = folk.find((f) => f.id === "rook");

  if (!q.gateReached) {
    const gate = mistmereGateOnMap(map);
    if (gate) {
      return {
        label: "Reach Mistmere gate",
        x: (gate.x + 0.5) * TILE,
        y: (gate.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Mistmere gate (Thornreach)",
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

function mistmereGateOnMap(
  map: WorldMap,
): { x: number; y: number } | null {
  if (!map.gates || map.gates.length === 0) return null;
  const g = map.gates.find((x) => x.targetContinentId === "mistmere");
  return g ? { x: g.x, y: g.y } : null;
}

export function objectiveForHollow(
  q: HollowQuestProgress,
  player: { x: number; y: number },
  enemies: Enemy[],
  folk: FolkDef[],
  map: WorldMap,
): WayfindObjective | null {
  if (q.status !== "active") return null;
  const rook = folk.find((f) => f.id === "rook");

  if (!q.enteredHollow) {
    if (map.kind === "hollow") {
      return {
        label: "Seek Shade Wisps (hollow)",
        x: player.x,
        y: player.y,
        kind: "landmark",
      };
    }
    const hollow = nearestHollowEntrance(player, map);
    if (hollow) {
      return {
        label: "Enter Thornreach hollow",
        x: (hollow.x + 0.5) * TILE,
        y: (hollow.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find a hollow entrance",
      x: player.x + TILE * 6,
      y: player.y - TILE * 2,
      kind: "landmark",
    };
  }

  if (!q.identifiedWisp || q.wispsKilled < HOLLOW_WISPS_NEEDED) {
    const wisp = nearestEnemy(player, enemies, "shade-wisp");
    if (wisp) {
      const label = !q.identifiedWisp
        ? "Identify Shade Wisp"
        : `Defeat Shade Wisp (${q.wispsKilled}/${HOLLOW_WISPS_NEEDED})`;
      return { label, x: wisp.x, y: wisp.y, kind: "enemy" };
    }
    if (map.kind !== "hollow") {
      const hollow = nearestHollowEntrance(player, map);
      if (hollow) {
        return {
          label: "Return to hollow (wisps)",
          x: (hollow.x + 0.5) * TILE,
          y: (hollow.y + 0.5) * TILE,
          kind: "landmark",
        };
      }
    }
    return {
      label: "Seek Shade Wisps deeper in",
      x: player.x + TILE * 3,
      y: player.y,
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
    const ashwood = cairnPixel("ashwood-edge", player.x + TILE * 6, player.y);
    return {
      label: "Hunt Needle Rats (Ashwood Edge · Rec. 2–4)",
      x: ashwood.x,
      y: ashwood.y,
      kind: "landmark",
    };
  }
  if (!q.houndDone) {
    const hound = nearestEnemy(player, enemies, "bark-hound");
    if (hound) return { label: "Survive Bark Hound", x: hound.x, y: hound.y, kind: "enemy" };
    const north = cairnPixel("north-ashwood", player.x + TILE * 8, player.y - TILE * 2);
    return {
      label: "Find Bark Hound (North Ashwood · Rec. 3–5)",
      x: north.x,
      y: north.y,
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

function nearestHollowEntrance(
  player: { x: number; y: number },
  map: WorldMap,
): { x: number; y: number } | null {
  if (!map.hollows || map.hollows.length === 0) return null;
  let best: { x: number; y: number } | null = null;
  let bestD = Infinity;
  for (const h of map.hollows) {
    const hx = (h.x + 0.5) * TILE;
    const hy = (h.y + 0.5) * TILE;
    const d = Math.hypot(hx - player.x, hy - player.y);
    if (d < bestD) {
      bestD = d;
      best = { x: h.x, y: h.y };
    }
  }
  return best;
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

function cairnPixel(
  zoneId: string,
  fallbackX: number,
  fallbackY: number,
): { x: number; y: number } {
  const zone = huntZoneById(zoneId);
  if (!zone) return { x: fallbackX, y: fallbackY };
  return { x: (zone.cairn.x + 0.5) * TILE, y: (zone.cairn.y + 0.5) * TILE };
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
