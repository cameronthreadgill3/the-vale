/** Draw Thornreach buildings signs + plaza props over ground tiles. */
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
    const shadow = PROP_SHADOW[p.kind];
    if (shadow) {
      drawSoftShadow(ctx, sx + shadow.ox, sy + shadow.oy, shadow.rx, shadow.ry, GROUND_SHADOW_ALPHA);
    }
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
    if (Math.hypot(ptx - dx, pty - dy) > 3.25) continue;
    const sx = Math.floor(dx * TILE - originX);
    const sy = Math.floor(dy * TILE - originY);
    drawFloatingLabel(ctx, sx, sy - 10, "Enter · " + b.name, b.signColor);
  }
}
