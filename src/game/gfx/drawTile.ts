/** Draw cached procedural tiles onto the game canvas (pass 3: edges, shores, anim). */
import type { BiomePalette } from "@/game/continents";
import type { GroundTile, WorldMap } from "@/game/world";
import { TILE } from "@/game/world";
import {
  getTileSheet,
  getGrassEdgeSheet,
  getGrassSpillSheet,
  getWaterShoreSheet,
  paletteColor,
  tileVariantAt,
  fountainFrameAt,
  TILE_PX,
  type TileMode,
} from "@/game/gfx/tiles";
import { drawSoftShadow } from "@/game/gfx/canvasUtil";

/** Subtle classic-client grid (optional). */
export const DRAW_TILE_GRID = true;

const HARD = new Set<GroundTile>([
  "path",
  "cobble",
  "dirt",
  "water",
  "stone",
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
    drawSoftShadow(ctx, sx + TILE / 2, sy + TILE - 2, 13, 6, 0.34);
  }

  if (kind === "grass" || kind === "grassAlt") {
    const gColor = paletteColor(pal, "grass");
    const n = neighbor(map, tx, ty, 0, -1);
    const s = neighbor(map, tx, ty, 0, 1);
    const w = neighbor(map, tx, ty, -1, 0);
    const e = neighbor(map, tx, ty, 1, 0);
    if (n && HARD.has(n)) {
      ctx.drawImage(getGrassEdgeSheet(gColor, "n", variant) as CanvasImageSource, sx, sy, TILE + 1, TILE + 1);
    }
    if (s && HARD.has(s)) {
      ctx.drawImage(getGrassEdgeSheet(gColor, "s", variant) as CanvasImageSource, sx, sy, TILE + 1, TILE + 1);
    }
    if (w && HARD.has(w)) {
      ctx.drawImage(getGrassEdgeSheet(gColor, "w", variant) as CanvasImageSource, sx, sy, TILE + 1, TILE + 1);
    }
    if (e && HARD.has(e)) {
      ctx.drawImage(getGrassEdgeSheet(gColor, "e", variant) as CanvasImageSource, sx, sy, TILE + 1, TILE + 1);
    }
  } else if (SPILL_ON.has(kind)) {
    const gColor = paletteColor(pal, "grass");
    const n = neighbor(map, tx, ty, 0, -1);
    const s = neighbor(map, tx, ty, 0, 1);
    const w = neighbor(map, tx, ty, -1, 0);
    const e = neighbor(map, tx, ty, 1, 0);
    if (n && GRASS.has(n)) {
      ctx.drawImage(getGrassSpillSheet(gColor, "n", variant) as CanvasImageSource, sx, sy, TILE + 1, TILE + 1);
    }
    if (s && GRASS.has(s)) {
      ctx.drawImage(getGrassSpillSheet(gColor, "s", variant) as CanvasImageSource, sx, sy, TILE + 1, TILE + 1);
    }
    if (w && GRASS.has(w)) {
      ctx.drawImage(getGrassSpillSheet(gColor, "w", variant) as CanvasImageSource, sx, sy, TILE + 1, TILE + 1);
    }
    if (e && GRASS.has(e)) {
      ctx.drawImage(getGrassSpillSheet(gColor, "e", variant) as CanvasImageSource, sx, sy, TILE + 1, TILE + 1);
    }
  }

  if (kind === "water") {
    const wColor = paletteColor(pal, "water");
    const n = neighbor(map, tx, ty, 0, -1);
    const s = neighbor(map, tx, ty, 0, 1);
    const w = neighbor(map, tx, ty, -1, 0);
    const e = neighbor(map, tx, ty, 1, 0);
    if (n && LAND.has(n)) {
      ctx.drawImage(getWaterShoreSheet(wColor, "n", variant, anim) as CanvasImageSource, sx, sy, TILE + 1, TILE + 1);
    }
    if (s && LAND.has(s)) {
      ctx.drawImage(getWaterShoreSheet(wColor, "s", variant, anim) as CanvasImageSource, sx, sy, TILE + 1, TILE + 1);
    }
    if (w && LAND.has(w)) {
      ctx.drawImage(getWaterShoreSheet(wColor, "w", variant, anim) as CanvasImageSource, sx, sy, TILE + 1, TILE + 1);
    }
    if (e && LAND.has(e)) {
      ctx.drawImage(getWaterShoreSheet(wColor, "e", variant, anim) as CanvasImageSource, sx, sy, TILE + 1, TILE + 1);
    }
  }

  if (DRAW_TILE_GRID && (kind === "grass" || kind === "grassAlt" || kind === "dirt")) {
    ctx.fillStyle = "rgba(0,0,0,0.10)";
    ctx.fillRect(sx, sy, TILE + 1, 1);
    ctx.fillRect(sx, sy, 1, TILE + 1);
  }
}

export { TILE_PX, fountainFrameAt };
