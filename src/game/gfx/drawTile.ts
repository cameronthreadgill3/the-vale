/** Draw cached procedural tiles onto the game canvas (pass 3: edges, shores, anim). */
import type { BiomePalette } from "@/game/continents";
import type { GroundTile, WorldMap } from "@/game/world";
import { TILE } from "@/game/world";
import {
  getTileSheet,
  getGrassEdgeSheet,
  getGrassSpillSheet,
  getGrassCornerSheet,
  getHardLipSheet,
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
    for (const { dir, dx, dy } of CARDINALS) {
      const n = neighbor(map, tx, ty, dx, dy);
      if (n && GRASS.has(n)) {
        if (kind === "path" || kind === "cobble" || kind === "dirt") {
          blit(ctx, getHardLipSheet(color, dir, variant) as CanvasImageSource, sx, sy);
        }
        blit(ctx, getGrassSpillSheet(gColor, dir, variant) as CanvasImageSource, sx, sy);
      }
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
