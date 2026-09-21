/** Draw cached procedural tiles onto the game canvas (pass 2: edges + anim). */
import type { BiomePalette } from "@/game/continents";
import type { GroundTile, WorldMap } from "@/game/world";
import { TILE } from "@/game/world";
import {
  getTileSheet,
  getGrassEdgeSheet,
  paletteColor,
  tileVariantAt,
  fountainFrameAt,
  TILE_PX,
} from "@/game/gfx/tiles";

/** Subtle classic-client grid (optional). */
export const DRAW_TILE_GRID = true;

const HARD = new Set<GroundTile>(["path", "dirt", "water", "stone", "gate", "hollow", "exit"]);

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
  return map.tiles[y]![x]! as GroundTile;
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
  const anim =
    kind === "flower" || kind === "water" ? fountainFrameAt(timeSec) : 0;
  const sheet = getTileSheet(kind, color, variant, anim);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sheet as CanvasImageSource, sx, sy, TILE + 1, TILE + 1);

  // Grass/path soft edges toward harder tiles
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
  }

  if (DRAW_TILE_GRID && (kind === "grass" || kind === "grassAlt" || kind === "dirt")) {
    ctx.fillStyle = "rgba(0,0,0,0.10)";
    ctx.fillRect(sx, sy, TILE + 1, 1);
    ctx.fillRect(sx, sy, 1, TILE + 1);
  }
}

export { TILE_PX, fountainFrameAt };
