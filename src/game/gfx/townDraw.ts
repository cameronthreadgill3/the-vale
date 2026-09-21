/** Draw Thornreach buildings signs + plaza props over ground tiles. */
import { TILE, type WorldMap } from "@/game/world";
import {
  buildingsOnContinent,
  propsOnContinent,
  type TownBuilding,
} from "@/game/world/town";
import { getPropSheet } from "@/game/gfx/props";
import { TILE_PX } from "@/game/gfx/tiles";
import { drawFloatingLabel } from "@/game/folkCanvas";
import { WAYFIND_LABEL_RANGE } from "@/game/wayfindingObjectives";

function drawRoofCap(
  ctx: CanvasRenderingContext2D,
  b: TownBuilding,
  originX: number,
  originY: number,
): void {
  const x = Math.floor(b.x * TILE - originX);
  const y = Math.floor(b.y * TILE - originY);
  const w = b.w * TILE;
  ctx.fillStyle = "rgba(42, 32, 20, 0.92)";
  ctx.beginPath();
  ctx.moveTo(x - 2, y + 6);
  ctx.lineTo(x + w / 2, y - 10);
  ctx.lineTo(x + w + 2, y + 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = b.signColor;
  ctx.fillRect(x + w / 2 - 6, y - 2, 12, 3);
}

function drawDoorSign(
  ctx: CanvasRenderingContext2D,
  b: TownBuilding,
  originX: number,
  originY: number,
): void {
  const sx = Math.floor((b.door.x + 0.5) * TILE - originX);
  const sy = Math.floor(b.door.y * TILE - originY);
  ctx.fillStyle = "#3a2a18";
  ctx.fillRect(sx - 10, sy - 8, 20, 8);
  ctx.fillStyle = b.signColor;
  ctx.fillRect(sx - 9, sy - 7, 18, 6);
}

export function drawTownOverlays(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  player: { x: number; y: number },
  originX: number,
  originY: number,
): void {
  if (map.kind !== "overworld") return;
  const buildings = buildingsOnContinent(map.continentId);
  const props = propsOnContinent(map.continentId);
  ctx.imageSmoothingEnabled = false;
  for (const p of props) {
    const sx = Math.floor(p.x * TILE - originX);
    const sy = Math.floor(p.y * TILE - originY);
    const sheet = getPropSheet(p.kind);
    ctx.drawImage(sheet as CanvasImageSource, sx, sy, TILE_PX + 1, TILE_PX + 1);
  }
  for (const b of buildings) {
    drawRoofCap(ctx, b, originX, originY);
    drawDoorSign(ctx, b, originX, originY);
  }
  const ptx = player.x / TILE;
  const pty = player.y / TILE;
  for (const b of buildings) {
    const dx = b.door.x + 0.5;
    const dy = b.door.y + 0.5;
    if (Math.hypot(ptx - dx, pty - dy) > WAYFIND_LABEL_RANGE) continue;
    const sx = Math.floor(dx * TILE - originX);
    const sy = Math.floor(dy * TILE - originY);
    drawFloatingLabel(ctx, sx, sy - 10, "Enter · " + b.name, b.signColor);
  }
}
