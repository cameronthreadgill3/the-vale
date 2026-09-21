/**
 * Draw Thornreach buildings, signs, and plaza props over ground tiles.
 * Structure depth: roof bevel / under-eave, door-sign lip, south-facade contact.
 * A thin AO crease and a low amber rim sit on props, eaves, and awnings.
 * Ambient motion stays on the prop sheets: cloth sway, hanging signs, lantern flame.
 * The lantern glass pulse is a few additive pixels on that same cycle.
 */
import { TILE, type WorldMap } from "@/game/world";
import {
  buildingsOnContinent,
  propsOnContinent,
  type TownBuilding,
  type TownProp,
  type TownPropKind,
} from "@/game/world/town";
import {
  getAwningSheet,
  getBannerSheet,
  getPropSheet,
  propFlameFrame,
  propSwayFrame,
  propSwayLean,
} from "@/game/gfx/props";
import { TILE_PX } from "@/game/gfx/tiles";
import { drawSoftShadow, GROUND_SHADOW_ALPHA } from "@/game/gfx/canvasUtil";
import {
  drawAwningVolume,
  drawEaveVolume,
  drawFacadeRim,
  drawPropContactAo,
  drawPropCanopyShade,
  drawPropRimBounce,
  propRimGain,
} from "@/game/gfx/contactAo";
import { drawLanternGlassFlicker } from "@/game/gfx/lampFlicker";
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
  drawEaveVolume(ctx, left, y + 9, right - left);
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

function windPhase(id: string): number {
  let n = 0;
  for (let i = 0; i < id.length; i++) n = (n + id.charCodeAt(i) * (i + 1)) | 0;
  return Math.abs(n % 5) * 0.7;
}

/** Wall tile beside the door, so the banner does not sit on the shop sign. */
function bannerTile(b: TownBuilding): { x: number; y: number } {
  const dx = b.door.x;
  const dy = b.door.y;
  const onSide = dx === b.x || dx === b.x + b.w - 1;
  if (onSide) {
    const y = dy + 1 < b.y + b.h ? dy + 1 : dy - 1;
    return { x: dx, y };
  }
  const x = dx + 1 < b.x + b.w ? dx + 1 : dx - 1;
  return { x, y: dy };
}

function drawDoorSign(
  ctx: CanvasRenderingContext2D,
  b: TownBuilding,
  originX: number,
  originY: number,
  frame: number,
): void {
  const sx = Math.floor((b.door.x + 0.5) * TILE - originX);
  const sy = Math.floor(b.door.y * TILE - originY);
  const lean = propSwayLean(frame);
  ctx.fillStyle = "#3a2a18";
  ctx.fillRect(sx - 1, sy - 10, 2, 2);
  ctx.fillStyle = "rgba(8, 10, 6, 0.4)";
  ctx.fillRect(sx - 9 + lean, sy - 6, 20, 8);
  ctx.fillStyle = "#3a2a18";
  ctx.fillRect(sx - 10 + lean, sy - 8, 20, 8);
  ctx.fillStyle = "#5a4430";
  ctx.fillRect(sx - 10 + lean, sy - 8, 20, 1);
  ctx.fillRect(sx - 10 + lean, sy - 8, 1, 8);
  ctx.fillStyle = "#2a1c10";
  ctx.fillRect(sx - 10 + lean, sy - 1, 20, 1);
  ctx.fillStyle = b.signColor;
  ctx.fillRect(sx - 9 + lean, sy - 7, 18, 6);
}

function drawShopAwning(
  ctx: CanvasRenderingContext2D,
  b: TownBuilding,
  originX: number,
  originY: number,
  frame: number,
): void {
  if (!b.shopId) return;
  const sheet = getAwningSheet(b.signColor, frame);
  const sx = Math.floor((b.door.x + 0.5) * TILE - originX) - 14;
  const sy = Math.floor(b.door.y * TILE - originY) - 20;
  ctx.drawImage(sheet as CanvasImageSource, sx, sy);
  drawAwningVolume(ctx, sx, sy);
}

function drawFacadeBanner(
  ctx: CanvasRenderingContext2D,
  b: TownBuilding,
  originX: number,
  originY: number,
  frame: number,
): void {
  const tile = bannerTile(b);
  const sheet = getBannerSheet(b.signColor, frame);
  const sx = Math.floor(tile.x * TILE - originX) + 11;
  const sy = Math.floor(tile.y * TILE - originY) + 2;
  ctx.drawImage(sheet as CanvasImageSource, sx, sy);
}

function drawLanternFlicker(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  timeSec: number,
  phase: number,
): void {
  drawLanternGlassFlicker(ctx, sx, sy, timeSec, phase);
}

function propFrame(kind: TownPropKind, timeSec: number, phase: number): number {
  if (kind === "lantern") return propFlameFrame(timeSec, phase);
  if (kind === "stall" || kind === "notice") return propSwayFrame(timeSec, phase);
  return 0;
}

function drawPlazaProp(
  ctx: CanvasRenderingContext2D,
  p: TownProp,
  props: readonly TownProp[],
  originX: number,
  originY: number,
  timeSec: number,
): void {
  const sx = Math.floor(p.x * TILE - originX);
  const sy = Math.floor(p.y * TILE - originY);
  const phase = p.x * 0.73 + p.y * 0.41;
  const shadow = PROP_SHADOW[p.kind];
  if (shadow) {
    drawSoftShadow(ctx, sx + shadow.ox, sy + shadow.oy, shadow.rx, shadow.ry, GROUND_SHADOW_ALPHA);
    drawPropContactAo(ctx, p.kind, sx, sy);
  }
  const sheet = getPropSheet(p.kind, propFrame(p.kind, timeSec, phase));
  ctx.drawImage(sheet as CanvasImageSource, sx, sy, TILE_PX + 1, TILE_PX + 1);
  if (p.kind === "lantern") drawLanternFlicker(ctx, sx, sy, timeSec, phase);
  if (shadow) {
    drawPropCanopyShade(ctx, p.kind, sx, sy);
    drawPropRimBounce(ctx, p.kind, sx, sy, propRimGain(p, props, timeSec));
  }
}

export function drawTownOverlays(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  player: { x: number; y: number },
  originX: number,
  originY: number,
  timeSec = 0,
): void {
  if (map.kind !== "overworld") return;
  const buildings = buildingsOnContinent(map.continentId);
  const props = propsOnContinent(map.continentId);
  ctx.imageSmoothingEnabled = false;
  for (const p of props) {
    drawPlazaProp(ctx, p, props, originX, originY, timeSec);
  }
  for (const b of buildings) {
    const bx = Math.floor(b.x * TILE - originX);
    const by = Math.floor(b.y * TILE - originY);
    const bw = b.w * TILE;
    const bh = b.h * TILE;
    const sway = propSwayFrame(timeSec, windPhase(b.id));
    drawSoftShadow(ctx, bx + bw / 2, by + bh + 2, bw * 0.44, 7, 0.26);
    drawFacadeRim(ctx, bx, by, bw, bh);
    drawRoofCap(ctx, b, originX, originY);
    drawShopAwning(ctx, b, originX, originY, sway);
    drawFacadeBanner(ctx, b, originX, originY, sway);
    drawDoorSign(ctx, b, originX, originY, sway);
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
