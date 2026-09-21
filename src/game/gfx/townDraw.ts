/**
 * Draw Thornreach buildings, signs, and plaza props over ground tiles.
 * Structure depth: roof bevel / under-eave, door-sign lip, south-facade contact.
 */
import { TILE, type WorldMap } from "@/game/world";
import {
  buildingsOnContinent,
  propsOnContinent,
  type TownBuilding,
  type TownPropKind,
} from "@/game/world/town";
import { getPropSheet } from "@/game/gfx/props";
import { TILE_PX } from "@/game/gfx/tiles";
import { drawSoftShadow, GROUND_SHADOW_ALPHA } from "@/game/gfx/canvasUtil";
import { drawFloatingLabel } from "@/game/folkCanvas";

/** Ground-contact ellipses matching player/cairn `drawSoftShadow` language. */
const PROP_SHADOW: Record<TownPropKind, { rx: number; ry: number; ox: number; oy: number } | null> = {
  crate: { rx: 10, ry: 4, ox: 16, oy: 25 },
  barrel: { rx: 8, ry: 4, ox: 16, oy: 25 },
  bench: { rx: 13, ry: 3.5, ox: 16, oy: 24 },
  lantern: { rx: 4, ry: 2.2, ox: 16, oy: 27 },
  stall: { rx: 13, ry: 5, ox: 16, oy: 27 },
  notice: { rx: 5, ry: 2.2, ox: 16, oy: 27 },
  "cobble-patch": null,
};

function drawRoofCap(
  ctx: CanvasRenderingContext2D,
  b: TownBuilding,
  originX: number,
  originY: number,
): void {
  const x = Math.floor(b.x * TILE - originX);
  const y = Math.floor(b.y * TILE - originY);
  const w = b.w * TILE;
  const peakX = x + w / 2;
  const peakY = y - 10;
  const left = x - 2;
  const right = x + w + 2;
  const baseY = y + 6;
  // under-eave occlusion onto the north facade
  drawSoftShadow(ctx, peakX, baseY + 4, w * 0.42, 5, 0.3);
  ctx.fillStyle = "rgba(12, 14, 8, 0.22)";
  ctx.fillRect(x + 1, y + 4, w - 2, 7);
  // SE slope (away from light)
  ctx.fillStyle = "rgba(32, 24, 14, 0.94)";
  ctx.beginPath();
  ctx.moveTo(peakX, peakY);
  ctx.lineTo(right, baseY);
  ctx.lineTo(peakX, baseY);
  ctx.closePath();
  ctx.fill();
  // NW slope (lit)
  ctx.fillStyle = "rgba(62, 48, 30, 0.94)";
  ctx.beginPath();
  ctx.moveTo(peakX, peakY);
  ctx.lineTo(left, baseY);
  ctx.lineTo(peakX, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(92, 72, 44, 0.9)";
  ctx.fillRect(Math.floor(peakX) - 1, peakY + 2, 2, Math.max(2, baseY - peakY - 6));
  ctx.fillStyle = b.signColor;
  ctx.fillRect(peakX - 6, y - 2, 12, 3);
  ctx.fillStyle = "rgba(240, 232, 200, 0.35)";
  ctx.fillRect(peakX - 6, y - 2, 12, 1);
}

function drawDoorSign(
  ctx: CanvasRenderingContext2D,
  b: TownBuilding,
  originX: number,
  originY: number,
): void {
  const sx = Math.floor((b.door.x + 0.5) * TILE - originX);
  const sy = Math.floor(b.door.y * TILE - originY);
  ctx.fillStyle = "rgba(8, 10, 6, 0.4)";
  ctx.fillRect(sx - 9, sy - 6, 20, 8);
  ctx.fillStyle = "#3a2a18";
  ctx.fillRect(sx - 10, sy - 8, 20, 8);
  ctx.fillStyle = "#5a4430";
  ctx.fillRect(sx - 10, sy - 8, 20, 1);
  ctx.fillRect(sx - 10, sy - 8, 1, 8);
  ctx.fillStyle = "#2a1c10";
  ctx.fillRect(sx - 10, sy - 1, 20, 1);
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
    const shadow = PROP_SHADOW[p.kind];
    if (shadow) {
      drawSoftShadow(ctx, sx + shadow.ox, sy + shadow.oy, shadow.rx, shadow.ry, GROUND_SHADOW_ALPHA);
    }
    const sheet = getPropSheet(p.kind);
    ctx.drawImage(sheet as CanvasImageSource, sx, sy, TILE_PX + 1, TILE_PX + 1);
  }
  for (const b of buildings) {
    const bx = Math.floor(b.x * TILE - originX);
    const by = Math.floor(b.y * TILE - originY);
    const bw = b.w * TILE;
    const bh = b.h * TILE;
    drawSoftShadow(ctx, bx + bw / 2, by + bh + 2, bw * 0.44, 7, 0.26);
    drawRoofCap(ctx, b, originX, originY);
    drawDoorSign(ctx, b, originX, originY);
  }
  const ptx = player.x / TILE;
  const pty = player.y / TILE;
  for (const b of buildings) {
    const dx = b.door.x + 0.5;
    const dy = b.door.y + 0.5;
    if (Math.hypot(ptx - dx, pty - dy) > 3.25) continue;
    const sx = Math.floor(dx * TILE - originX);
    const sy = Math.floor(dy * TILE - originY);
    drawFloatingLabel(ctx, sx, sy - 10, "Enter · " + b.name, b.signColor);
  }
}
