/** Draw cached procedural tiles onto the game canvas (edges, shores, path contact, anim). */
import type { BiomePalette } from "@/game/continents";
import type { GroundTile, WorldMap } from "@/game/world";
import { TILE } from "@/game/world";
import {
  getTileSheet,
  getGrassEdgeSheet,
  getGrassSpillSheet,
  getGrassCornerSheet,
  getHardLipSheet,
  getPathContactSheet,
  getHardCornerSheet,
  getTreeDuffSheet,
  getWaterShoreSheet,
  paletteColor,
  tileVariantAt,
  fountainFrameAt,
  TILE_PX,
  type CornerDir,
  type EdgeDir,
  type TileMode,
} from "@/game/gfx/tiles";
import { drawSoftShadow, GROUND_SHADOW_ALPHA } from "@/game/gfx/canvasUtil";

/** Subtle classic-client grid (optional). */
export const DRAW_TILE_GRID = true;

const EDGE_HARD = new Set<GroundTile>([
  "path",
  "cobble",
  "dirt",
  "water",
  "wall",
  "floor",
  "door",
  "gate",
  "hollow",
  "exit",
]);
const GRASS = new Set<GroundTile>(["grass", "grassAlt"]);
/** Walkway tiles that take a grass lip so turf reads above the path. */
const SPILL_ON = new Set<GroundTile>(["path", "cobble", "dirt", "wall", "floor", "door"]);
const LAND = new Set<GroundTile>([
  "grass",
  "grassAlt",
  "dirt",
  "path",
  "cobble",
  "stone",
  "flower",
  "wall",
  "floor",
  "door",
  "gate",
  "hollow",
  "exit",
]);
/** Plaza / interior walkways that take contact occlusion from adjacent structures. */
const CONTACT_GROUND = new Set<GroundTile>(["path", "cobble", "dirt", "floor"]);
const STRUCTURE_OCCLUDERS = new Set<GroundTile>(["wall", "door", "gate"]);

const CARDINALS: { dir: EdgeDir; dx: number; dy: number }[] = [
  { dir: "n", dx: 0, dy: -1 },
  { dir: "s", dx: 0, dy: 1 },
  { dir: "w", dx: -1, dy: 0 },
  { dir: "e", dx: 1, dy: 0 },
];

const CORNERS: { corner: CornerDir; dx: number; dy: number; a: EdgeDir; b: EdgeDir }[] = [
  { corner: "nw", dx: -1, dy: -1, a: "n", b: "w" },
  { corner: "ne", dx: 1, dy: -1, a: "n", b: "e" },
  { corner: "sw", dx: -1, dy: 1, a: "s", b: "w" },
  { corner: "se", dx: 1, dy: 1, a: "s", b: "e" },
];

function neighbor(
  map: WorldMap | undefined,
  tx: number,
  ty: number,
  dx: number,
  dy: number,
): GroundTile | null {
  if (!map) return null;
  const x = tx + dx;
  const y = ty + dy;
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) return null;
  return map.tiles[y]![x]!;
}

function blit(
  ctx: CanvasRenderingContext2D,
  sheet: CanvasImageSource,
  sx: number,
  sy: number,
): void {
  ctx.drawImage(sheet, sx, sy, TILE + 1, TILE + 1);
}

/** Soft contact where turf overhangs a walkway. Light from the north-west. */
const TURF_OCCLUSION: Record<
  EdgeDir,
  { ox: number; oy: number; rx: number; ry: number; alpha: number }
> = {
  n: { ox: TILE / 2, oy: 5, rx: 15, ry: 3.4, alpha: 0.18 },
  w: { ox: 5, oy: TILE / 2 + 2, rx: 3.4, ry: 12, alpha: 0.14 },
  s: { ox: TILE / 2 + 1, oy: TILE - 4, rx: 14, ry: 2.8, alpha: 0.1 },
  e: { ox: TILE - 4, oy: TILE / 2 + 2, rx: 2.8, ry: 11, alpha: 0.1 },
};

const CORNER_OCCLUSION: Record<CornerDir, { ox: number; oy: number }> = {
  nw: { ox: 7, oy: 7 },
  ne: { ox: TILE - 6, oy: 8 },
  sw: { ox: 8, oy: TILE - 5 },
  se: { ox: TILE - 5, oy: TILE - 4 },
};

function drawTurfOcclusion(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  hit: Record<EdgeDir, boolean>,
): void {
  for (const dir of ["n", "w", "s", "e"] as const) {
    if (!hit[dir]) continue;
    const o = TURF_OCCLUSION[dir];
    drawSoftShadow(ctx, sx + o.ox, sy + o.oy, o.rx, o.ry, o.alpha);
  }
}

export function drawTile(
  ctx: CanvasRenderingContext2D,
  kind: GroundTile,
  pal: BiomePalette,
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  map?: WorldMap,
  timeSec = 0,
): void {
  const color = paletteColor(pal, kind);
  const variant = tileVariantAt(tx, ty);
  const mode: TileMode = map?.kind === "hollow" ? "hollow" : "overworld";
  const anim =
    kind === "flower" ||
    kind === "water" ||
    (kind === "stone" && mode === "hollow")
      ? fountainFrameAt(timeSec)
      : 0;
  const sheet = getTileSheet(kind, color, variant, anim, mode);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sheet as CanvasImageSource, sx, sy, TILE + 1, TILE + 1);

  if (kind === "stone" && mode === "overworld") {
    drawSoftShadow(ctx, sx + TILE / 2, sy + TILE - 1, 14, 6, 0.36);
  }
  if (kind === "flower") {
    drawSoftShadow(ctx, sx + TILE / 2, sy + TILE - 4, 15, 6, 0.3);
  }
  if (kind === "gate") {
    drawSoftShadow(ctx, sx + TILE / 2, sy + TILE - 1, 16, 6, 0.36);
  }
  if (kind === "door") {
    drawSoftShadow(ctx, sx + TILE / 2, sy + TILE - 2, 13, 5, 0.32);
  }
  if (kind === "hollow" || kind === "exit") {
    drawSoftShadow(ctx, sx + TILE / 2, sy + TILE - 1, 15, 6, 0.34);
  }

  if (GRASS.has(kind)) {
    const gColor = paletteColor(pal, "grass");
    const edgeHit: Record<EdgeDir, boolean> = { n: false, s: false, e: false, w: false };
    for (const { dir, dx, dy } of CARDINALS) {
      const n = neighbor(map, tx, ty, dx, dy);
      if (n && EDGE_HARD.has(n)) {
        blit(ctx, getGrassEdgeSheet(gColor, dir, variant) as CanvasImageSource, sx, sy);
        edgeHit[dir] = true;
      } else if (n === "stone" && mode === "overworld") {
        blit(ctx, getTreeDuffSheet(gColor, dir, variant) as CanvasImageSource, sx, sy);
      }
    }
    for (const { corner, dx, dy, a, b } of CORNERS) {
      if (edgeHit[a] || edgeHit[b]) continue;
      const n = neighbor(map, tx, ty, dx, dy);
      if (n && EDGE_HARD.has(n)) {
        blit(ctx, getGrassCornerSheet(gColor, corner, variant) as CanvasImageSource, sx, sy);
      }
    }
  } else if (SPILL_ON.has(kind)) {
    const gColor = paletteColor(pal, "grass");
    const turfHit: Record<EdgeDir, boolean> = { n: false, s: false, e: false, w: false };
    const walkway = kind === "path" || kind === "cobble" || kind === "dirt";
    for (const { dir, dx, dy } of CARDINALS) {
      const n = neighbor(map, tx, ty, dx, dy);
      if (n && GRASS.has(n)) {
        turfHit[dir] = true;
        if (walkway) {
          blit(ctx, getHardLipSheet(color, dir, variant) as CanvasImageSource, sx, sy);
          blit(ctx, getPathContactSheet(color, dir, variant) as CanvasImageSource, sx, sy);
        }
      }
    }
    if (walkway) {
      // Soft contact under the blades so the lip highlight stays readable.
      drawTurfOcclusion(ctx, sx, sy, turfHit);
      for (const { corner, dx, dy, a, b } of CORNERS) {
        if (turfHit[a] || turfHit[b]) continue;
        const n = neighbor(map, tx, ty, dx, dy);
        if (n && GRASS.has(n)) {
          blit(ctx, getHardCornerSheet(color, corner, variant) as CanvasImageSource, sx, sy);
          const o = CORNER_OCCLUSION[corner];
          drawSoftShadow(ctx, sx + o.ox, sy + o.oy, 6, 3.2, 0.13);
        }
      }
    }
    for (const dir of ["n", "s", "e", "w"] as const) {
      if (!turfHit[dir]) continue;
      blit(ctx, getGrassSpillSheet(gColor, dir, variant) as CanvasImageSource, sx, sy);
    }
  }

  if (kind === "water") {
    const wColor = paletteColor(pal, "water");
    for (const { dir, dx, dy } of CARDINALS) {
      const n = neighbor(map, tx, ty, dx, dy);
      if (n && LAND.has(n)) {
        blit(ctx, getWaterShoreSheet(wColor, dir, variant, anim) as CanvasImageSource, sx, sy);
      }
    }
  }

  if (CONTACT_GROUND.has(kind) && map) {
    const alpha = kind === "floor" ? 0.18 : GROUND_SHADOW_ALPHA * 0.82;
    const n = neighbor(map, tx, ty, 0, -1);
    if (n && STRUCTURE_OCCLUDERS.has(n)) {
      drawSoftShadow(ctx, sx + TILE / 2, sy + 1, 18, 5, alpha);
    }
    const s = neighbor(map, tx, ty, 0, 1);
    if (s && STRUCTURE_OCCLUDERS.has(s)) {
      drawSoftShadow(ctx, sx + TILE / 2, sy + TILE - 2, 18, 5, alpha * 0.85);
    }
    const w = neighbor(map, tx, ty, -1, 0);
    if (w && STRUCTURE_OCCLUDERS.has(w)) {
      drawSoftShadow(ctx, sx + 1, sy + TILE / 2 + 3, 5, 12, alpha * 0.72);
    }
    const e = neighbor(map, tx, ty, 1, 0);
    if (e && STRUCTURE_OCCLUDERS.has(e)) {
      drawSoftShadow(ctx, sx + TILE - 1, sy + TILE / 2 + 3, 5, 12, alpha * 0.72);
    }
  }

  if (DRAW_TILE_GRID && (kind === "grass" || kind === "grassAlt" || kind === "dirt")) {
    ctx.fillStyle = "rgba(0,0,0,0.10)";
    ctx.fillRect(sx, sy, TILE + 1, 1);
    ctx.fillRect(sx, sy, 1, TILE + 1);
  }
}

export { TILE_PX, fountainFrameAt };
