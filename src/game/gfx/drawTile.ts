/** Draw cached procedural tiles onto the game canvas. */
import type { BiomePalette } from "@/game/continents";
import type { GroundTile } from "@/game/world";
import { TILE } from "@/game/world";
import {
  getTileSheet,
  paletteColor,
  tileVariantAt,
  TILE_PX,
} from "@/game/gfx/tiles";

/** Subtle classic-client grid (optional). */
export const DRAW_TILE_GRID = true;

export function drawTile(
  ctx: CanvasRenderingContext2D,
  kind: GroundTile,
  pal: BiomePalette,
  sx: number,
  sy: number,
  tx: number,
  ty: number,
): void {
  const color = paletteColor(pal, kind);
  const variant = tileVariantAt(tx, ty);
  const sheet = getTileSheet(kind, color, variant);
  ctx.imageSmoothingEnabled = false;
  // TILE may equal TILE_PX (32); draw 1px oversized to seal seams
  ctx.drawImage(sheet as CanvasImageSource, sx, sy, TILE + 1, TILE + 1);

  if (DRAW_TILE_GRID && (kind === "grass" || kind === "grassAlt" || kind === "dirt")) {
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(sx, sy, TILE + 1, 1);
    ctx.fillRect(sx, sy, 1, TILE + 1);
  }
}

export { TILE_PX };
