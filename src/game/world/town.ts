/**
 * Thornreach (Thornhearth square) layout — starter town density.
 * Original Vale geometry only; not a copy of any CipSoft map.
 *
 * Bank/weight PR: hook the depot clerk via THORNREACH_DEPOT / folk role "depot".
 * This module places the NPC and building; it does not implement ledger logic.
 */

import type { ContinentId } from "@/game/continents";
import {
  isTownStructureTile,
  type GroundTile,
  type WorldMap,
} from "@/game/world/types";

export type TownPropKind =
  | "crate"
  | "barrel"
  | "bench"
  | "lantern"
  | "stall"
  | "notice"
  | "cobble-patch";

export interface TownBuilding {
  id: string;
  name: string;
  /** Top-left wall tile. */
  x: number;
  y: number;
  w: number;
  h: number;
  door: { x: number; y: number };
  /** Sign color (original Vale gold/ink, not CipSoft). */
  signColor: string;
  /** If set, E at the door opens this shop (enterable shopfront). */
  shopId?: string;
}

export interface TownProp {
  kind: TownPropKind;
  x: number;
  y: number;
}

/** Stable hook for the bank/weight branch — depot clerk at this counter. */
export const THORNREACH_DEPOT = {
  continentId: "thornreach" as const,
  folkId: "cress-ledger",
  buildingId: "thornhearth-depot",
  /** Clerk tile (interior). */
  x: 20,
  y: 22,
  door: { x: 20, y: 20 },
};

export const THORNREACH_BUILDINGS: TownBuilding[] = [
  {
    id: "watch-post",
    name: "Watch Post",
    x: 17,
    y: 13,
    w: 4,
    h: 4,
    door: { x: 20, y: 15 },
    signColor: "#6ab84a",
  },
  {
    id: "nolls-hut",
    name: "Noll's Hut",
    x: 23,
    y: 10,
    w: 4,
    h: 4,
    door: { x: 24, y: 13 },
    signColor: "#8ab87a",
    shopId: "nolls-wraps",
  },
  {
    id: "thornreach-general",
    name: "General Store",
    x: 30,
    y: 15,
    w: 5,
    h: 5,
    door: { x: 30, y: 17 },
    signColor: "#c9a227",
    shopId: "thornreach-general",
  },
  {
    id: "thornhearth-depot",
    name: "Depot",
    x: 18,
    y: 20,
    w: 5,
    h: 5,
    door: { x: THORNREACH_DEPOT.door.x, y: THORNREACH_DEPOT.door.y },
    signColor: "#c9b070",
  },
  {
    id: "perrin-oven",
    name: "Perrin's Oven",
    x: 27,
    y: 13,
    w: 3,
    h: 4,
    door: { x: 27, y: 15 },
    signColor: "#c97a4a",
    shopId: "perrin-oven",
  },
];

/** Plaza overlays — crates, lanterns, benches (walkable decorations). */
export const THORNREACH_PROPS: TownProp[] = [
  { kind: "lantern", x: 21, y: 14 },
  { kind: "lantern", x: 26, y: 14 },
  { kind: "lantern", x: 23, y: 21 },
  { kind: "lantern", x: 29, y: 21 },
  { kind: "barrel", x: 21, y: 16 },
  { kind: "barrel", x: 19, y: 17 },
  { kind: "crate", x: 29, y: 18 },
  { kind: "crate", x: 28, y: 19 },
  { kind: "bench", x: 23, y: 20 },
  { kind: "notice", x: 25, y: 16 },
  { kind: "stall", x: 28, y: 14 },
  { kind: "cobble-patch", x: 22, y: 18 },
  { kind: "cobble-patch", x: 26, y: 18 },
  { kind: "cobble-patch", x: 24, y: 16 },
  { kind: "cobble-patch", x: 24, y: 20 },
  { kind: "cobble-patch", x: 21, y: 19 },
  { kind: "cobble-patch", x: 27, y: 19 },
  { kind: "crate", x: 29, y: 19 },
  { kind: "barrel", x: 23, y: 19 },
];

const PLAZA = { x0: 19, y0: 14, x1: 29, y1: 22 };

function inBounds(map: WorldMap, x: number, y: number): boolean {
  return x > 0 && y > 0 && x < map.width - 1 && y < map.height - 1;
}

function isProtected(map: WorldMap, x: number, y: number): boolean {
  if (!inBounds(map, x, y)) return true;
  if (map.gates.some((g) => g.x === x && g.y === y)) return true;
  if (map.hollows.some((h) => h.x === x && h.y === y)) return true;
  const t = map.tiles[y]![x]!;
  return t === "gate" || t === "hollow" || t === "exit";
}

function setTile(map: WorldMap, x: number, y: number, kind: GroundTile): void {
  if (isProtected(map, x, y)) return;
  map.tiles[y]![x] = kind;
}

function stampBuilding(map: WorldMap, b: TownBuilding): void {
  for (let y = b.y; y < b.y + b.h; y++) {
    for (let x = b.x; x < b.x + b.w; x++) {
      if (!inBounds(map, x, y)) continue;
      const edge =
        x === b.x || y === b.y || x === b.x + b.w - 1 || y === b.y + b.h - 1;
      if (x === b.door.x && y === b.door.y) setTile(map, x, y, "door");
      else if (edge) setTile(map, x, y, "wall");
      else setTile(map, x, y, "floor");
    }
  }
  // Doorstep cobble so the entrance reads as a shop front.
  const dx = b.door.x;
  const dy = b.door.y;
  const stepCandidates = [
    { x: dx, y: dy + 1 },
    { x: dx, y: dy - 1 },
    { x: dx + 1, y: dy },
    { x: dx - 1, y: dy },
  ];
  for (const s of stepCandidates) {
    if (!inBounds(map, s.x, s.y)) continue;
    const t = map.tiles[s.y]![s.x]!;
    if (t === "wall" || t === "floor" || t === "door") continue;
    if (t === "flower") continue;
    setTile(map, s.x, s.y, "cobble");
  }
}

function stampPlaza(map: WorldMap): void {
  const sx = map.spawn.x;
  const sy = map.spawn.y;
  for (let y = PLAZA.y0; y <= PLAZA.y1; y++) {
    for (let x = PLAZA.x0; x <= PLAZA.x1; x++) {
      if (x === sx && y === sy) {
        setTile(map, x, y, "flower");
        continue;
      }
      setTile(map, x, y, "cobble");
    }
  }
  // Short cobble spokes so the square meets the east-west road.
  for (let x = PLAZA.x0 - 2; x <= PLAZA.x1 + 2; x++) {
    if (x === sx) continue;
    setTile(map, x, sy, "cobble");
  }
}

export function stampThornreachTown(map: WorldMap): void {
  if (map.kind !== "overworld" || map.continentId !== "thornreach") return;
  stampPlaza(map);
  for (const b of THORNREACH_BUILDINGS) stampBuilding(map, b);
  // Fountain stays a flower tile even if a building step overwrote it.
  setTile(map, map.spawn.x, map.spawn.y, "flower");
}

export function buildingsOnContinent(id: ContinentId): TownBuilding[] {
  return id === "thornreach" ? THORNREACH_BUILDINGS : [];
}

export function propsOnContinent(id: ContinentId): TownProp[] {
  return id === "thornreach" ? THORNREACH_PROPS : [];
}

export function townBlockedTiles(map: WorldMap): { x: number; y: number }[] {
  if (map.kind !== "overworld" || map.continentId !== "thornreach") return [];
  const out: { x: number; y: number }[] = [];
  for (let y = 1; y < map.height - 1; y++) {
    for (let x = 1; x < map.width - 1; x++) {
      if (isTownStructureTile(map.tiles[y]![x]!)) out.push({ x, y });
    }
  }
  // Keep the square itself pest-free (fountain + cobble).
  for (let y = PLAZA.y0; y <= PLAZA.y1; y++) {
    for (let x = PLAZA.x0; x <= PLAZA.x1; x++) {
      out.push({ x, y });
    }
  }
  return out;
}

export function buildingAtDoor(
  continentId: ContinentId,
  x: number,
  y: number,
): TownBuilding | undefined {
  return buildingsOnContinent(continentId).find(
    (b) => b.door.x === x && b.door.y === y,
  );
}
