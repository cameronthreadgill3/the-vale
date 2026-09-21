/** Shared world map types and constants. */

import type { ContinentId, BiomePalette } from "@/game/continents";

export const TILE = 32;
export const MAP_W = 48;
export const MAP_H = 36;
export const HOLLOW_W = 28;
export const HOLLOW_H = 22;

export type GroundTile =
  | "grass"
  | "grassAlt"
  | "dirt"
  | "path"
  | "cobble"
  | "stone"
  | "water"
  | "flower"
  | "wall"
  | "floor"
  | "door"
  | "gate"
  | "hollow"
  | "exit";

export interface GateMarker {
  x: number;
  y: number;
  targetContinentId: ContinentId;
}

export interface HollowMarker {
  x: number;
  y: number;
  index: number;
}

export interface WorldMap {
  kind: "overworld" | "hollow";
  continentId: ContinentId;
  hollowIndex: number | null;
  width: number;
  height: number;
  tiles: GroundTile[][];
  palette: BiomePalette;
  /** Darker overlay for hollows (0-1). */
  darkness: number;
  gates: GateMarker[];
  hollows: HollowMarker[];
  /** Exit tile inside a hollow (overworld return). */
  exit: { x: number; y: number } | null;
  spawn: { x: number; y: number };
  /** Overworld tile to return to after exiting this hollow. */
  returnTile: { x: number; y: number } | null;
}

export function isSolid(tile: GroundTile, kind: "overworld" | "hollow"): boolean {
  if (tile === "water" || tile === "stone" || tile === "wall") return true;
  void kind;
  return false;
}

/** Plaza houses — skip fauna and keep interiors walkable. */
export function isTownStructureTile(tile: GroundTile): boolean {
  return tile === "wall" || tile === "floor" || tile === "door";
}

export function clearArea(
  tiles: GroundTile[][],
  cx: number,
  cy: number,
  r: number,
  fill: GroundTile,
  w: number,
  h: number,
) {
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const tx = cx + dx;
      const ty = cy + dy;
      if (tx > 0 && ty > 0 && tx < w - 1 && ty < h - 1) {
        tiles[ty]![tx] = fill;
      }
    }
  }
}

export function placeWalkable(
  tiles: GroundTile[][],
  x: number,
  y: number,
  kind: GroundTile,
  w: number,
  h: number,
) {
  const cx = Math.max(2, Math.min(w - 3, x));
  const cy = Math.max(2, Math.min(h - 3, y));
  clearArea(tiles, cx, cy, 1, "path", w, h);
  tiles[cy]![cx] = kind;
  return { x: cx, y: cy };
}

/** Chebyshev / tile distance helper. */
export function nearTile(
  px: number,
  py: number,
  tx: number,
  ty: number,
  radius = 1.25,
): boolean {
  return Math.hypot(px - (tx + 0.5), py - (ty + 0.5)) <= radius;
}
