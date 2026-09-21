/**
 * Soft ambient-occlusion lick and a quiet rim bounce on plaza props,
 * building feet, eaves, and gate arches.
 * Drop shadows, door spill, and lantern wall glow stay as they are.
 * This pass only darkens the contact crease and lays a low amber on the
 * lit rim. Amber stays under the bloom knee (158) at full opacity.
 * Labels are drawn later, on their plate.
 * Canvas 2D ellipses and gradients. Original Vale pixels — not CipSoft.
 */
import { TILE, type WorldMap } from "@/game/world";
import {
  buildingsOnContinent,
  type TownBuilding,
  type TownProp,
  type TownPropKind,
} from "@/game/world/town";
import { warmFlamePulse } from "@/game/gfx/lampFlicker";

/** Same lip as the lantern wall wash. Weighted luma ≈ 144. */
const AMBER = "196, 136, 72";
const AMBER_MID = "168, 104, 48";
const CREASE = "6, 8, 5";
const CREASE_MID = "12, 16, 10";

type Spot = {
  x: number;
  y: number;
  rx: number;
  ry: number;
  a: number;
};

type PropVolume = {
  lick: Spot;
  /** Shade under a cloth canopy, above the ground crease. */
  under: Spot | null;
  rim: Spot | null;
};

const PROP_VOLUME: Record<TownPropKind, PropVolume | null> = {
  crate: {
    lick: { x: 16, y: 26, rx: 8, ry: 1.7, a: 0.28 },
    under: null,
    rim: { x: 12, y: 16, rx: 6, ry: 4.2, a: 0.11 },
  },
  barrel: {
    lick: { x: 16, y: 26, rx: 6.2, ry: 1.6, a: 0.28 },
    under: null,
    rim: { x: 13, y: 15, rx: 4.2, ry: 5, a: 0.1 },
  },
  bench: {
    lick: { x: 16, y: 25, rx: 11, ry: 1.6, a: 0.26 },
    under: null,
    rim: { x: 11, y: 18, rx: 8, ry: 1.8, a: 0.1 },
  },
  lantern: {
    lick: { x: 16, y: 27, rx: 3.2, ry: 1.35, a: 0.24 },
    under: null,
    rim: { x: 15, y: 20, rx: 2.1, ry: 3.2, a: 0.07 },
  },
  stall: {
    lick: { x: 16, y: 27, rx: 10, ry: 1.8, a: 0.24 },
    under: { x: 16, y: 16, rx: 10, ry: 2, a: 0.16 },
    rim: { x: 11, y: 10, rx: 8, ry: 2.1, a: 0.09 },
  },
  notice: {
    lick: { x: 16, y: 27, rx: 3.3, ry: 1.3, a: 0.22 },
    under: null,
    rim: { x: 10, y: 12, rx: 2.8, ry: 4, a: 0.06 },
  },
  "cobble-patch": null,
};

function softEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  core: string,
  mid: string,
  alpha: number,
  biasX: number,
  biasY: number,
): void {
  if (alpha <= 0.015 || rx < 0.8 || ry < 0.55) return;
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.translate(cx, cy);
  ctx.scale(rx, ry);
  const g = ctx.createRadialGradient(biasX, biasY, 0.05, 0, 0, 1);
  g.addColorStop(0, `rgba(${core}, ${alpha})`);
  g.addColorStop(0.48, `rgba(${mid}, ${alpha * 0.4})`);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function lick(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  alpha: number,
): void {
  softEllipse(ctx, cx, cy, rx, ry, CREASE, CREASE_MID, alpha, 0, 0.08);
}

function bounce(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  alpha: number,
): void {
  softEllipse(ctx, cx, cy, rx, ry, AMBER, AMBER_MID, alpha, -0.28, -0.34);
}

function inView(sx: number, sy: number, viewW: number, viewH: number): boolean {
  return sx >= -TILE * 2 && sy >= -TILE * 2 && sx <= viewW + TILE && sy <= viewH + TILE;
}

function overlapsView(
  x: number,
  y: number,
  w: number,
  h: number,
  viewW: number,
  viewH: number,
): boolean {
  return x < viewW + TILE && y < viewH + TILE && x + w > -TILE * 2 && y + h > -TILE * 2;
}

function spot(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  s: Spot,
  bounceLight: boolean,
  gain = 1,
): void {
  const alpha = s.a * gain;
  if (bounceLight) bounce(ctx, sx + s.x, sy + s.y, s.rx, s.ry, alpha);
  else lick(ctx, sx + s.x, sy + s.y, s.rx, s.ry, alpha);
}

/**
 * How much a prop's lit rim breathes with the nearest plaza lantern.
 * Posts and patches stay steady. Far props keep the ambient rim only.
 */
export function propRimGain(prop: TownProp, props: readonly TownProp[], timeSec: number): number {
  if (prop.kind === "lantern" || prop.kind === "cobble-patch") return 1;
  const reach = 3.4;
  let best = 0;
  let phase = 0;
  for (let i = 0; i < props.length; i++) {
    const other = props[i]!;
    if (other.kind !== "lantern") continue;
    const dist = Math.hypot(other.x - prop.x, other.y - prop.y);
    const t = 1 - dist / reach;
    if (t <= best) continue;
    best = t;
    phase = other.x * 0.73 + other.y * 0.41;
  }
  if (best <= 0) return 1;
  const pulse = warmFlamePulse(timeSec, phase);
  return 1 + best * best * 0.42 * pulse;
}

/** Crease where the prop meets the ground. Drawn under the sprite. */
export function drawPropContactAo(
  ctx: CanvasRenderingContext2D,
  kind: TownPropKind,
  sx: number,
  sy: number,
): void {
  const vol = PROP_VOLUME[kind];
  if (!vol) return;
  spot(ctx, sx, sy, vol.lick, false);
}

/** Shade on the underside of a stall cloth. Drawn on the sprite. */
export function drawPropCanopyShade(
  ctx: CanvasRenderingContext2D,
  kind: TownPropKind,
  sx: number,
  sy: number,
): void {
  const under = PROP_VOLUME[kind]?.under;
  if (!under) return;
  spot(ctx, sx, sy, under, false);
}

/** Warm rim on the lit side of a prop. `gain` is 1 away from lanterns. */
export function drawPropRimBounce(
  ctx: CanvasRenderingContext2D,
  kind: TownPropKind,
  sx: number,
  sy: number,
  gain = 1,
): void {
  const vol = PROP_VOLUME[kind];
  if (!vol?.rim) return;
  spot(ctx, sx, sy, vol.rim, true, gain);
}

function buildingFoot(ctx: CanvasRenderingContext2D, b: TownBuilding, originX: number, originY: number): void {
  const bx = Math.floor(b.x * TILE - originX);
  const by = Math.floor(b.y * TILE - originY);
  const bw = b.w * TILE;
  const bh = b.h * TILE;
  lick(ctx, bx + bw / 2, by + bh - 2, bw * 0.42, 2.5, 0.22);
  lick(ctx, bx + bw - 1, by + bh - 2, 2.4, 2.2, 0.14);
}

function doorCrevice(ctx: CanvasRenderingContext2D, sx: number, sy: number): void {
  lick(ctx, sx + 16, sy + 5, 7.5, 2, 0.16);
  lick(ctx, sx + 8, sy + 8, 2.4, 2.2, 0.1);
  lick(ctx, sx + 24, sy + 8, 2.4, 2.2, 0.09);
  bounce(ctx, sx + 10, sy + 14, 3.2, 5, 0.055);
}

function thresholdLick(ctx: CanvasRenderingContext2D, sx: number, sy: number): void {
  lick(ctx, sx + 16, sy + 28, 9, 1.8, 0.18);
}

function gateCrevice(ctx: CanvasRenderingContext2D, sx: number, sy: number): void {
  lick(ctx, sx + 16, sy + 9, 8.5, 2.6, 0.22);
  lick(ctx, sx + 10, sy + 11, 3, 2.2, 0.14);
  lick(ctx, sx + 22, sy + 11, 3, 2.2, 0.12);
  bounce(ctx, sx + 12, sy + 4, 7, 2.1, 0.08);
}

/**
 * Ground creases at building feet and gate thresholds.
 * Drawn before door spill so the warm pool sits on the darkened step.
 */
export function drawGroundContactAo(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
): void {
  if (map.kind !== "overworld") return;
  for (const b of buildingsOnContinent(map.continentId)) {
    const sx = Math.floor(b.x * TILE - originX);
    const sy = Math.floor(b.y * TILE - originY);
    if (!overlapsView(sx, sy, b.w * TILE, b.h * TILE, viewW, viewH)) continue;
    buildingFoot(ctx, b, originX, originY);
    const dx = Math.floor(b.door.x * TILE - originX);
    const dy = Math.floor(b.door.y * TILE - originY);
    if (inView(dx, dy, viewW, viewH)) thresholdLick(ctx, dx, dy);
  }
  for (const gate of map.gates) {
    const sx = Math.floor(gate.x * TILE - originX);
    const sy = Math.floor(gate.y * TILE - originY);
    if (!inView(sx, sy, viewW, viewH)) continue;
    thresholdLick(ctx, sx, sy);
  }
}

/**
 * Dark soffit under door lintels and gate arches, then a thin warm crown.
 * Drawn after the spill so the crevice stays dark and the opening stays warm.
 */
export function drawArchCrevice(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
): void {
  if (map.kind !== "overworld") return;
  for (const b of buildingsOnContinent(map.continentId)) {
    const sx = Math.floor(b.door.x * TILE - originX);
    const sy = Math.floor(b.door.y * TILE - originY);
    if (!inView(sx, sy, viewW, viewH)) continue;
    doorCrevice(ctx, sx, sy);
  }
  for (const gate of map.gates) {
    const sx = Math.floor(gate.x * TILE - originX);
    const sy = Math.floor(gate.y * TILE - originY);
    if (!inView(sx, sy, viewW, viewH)) continue;
    gateCrevice(ctx, sx, sy);
  }
}

/**
 * Feather under the roof overhang, then a west-weighted amber on the plaster
 * just below it. Call with the roof, after the wall wash.
 */
export function drawEaveVolume(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
): void {
  if (w < 4) return;
  const left = Math.floor(x);
  const top = Math.floor(y);
  const width = Math.ceil(w);
  const shade = ctx.createLinearGradient(left, top, left, top + 12);
  shade.addColorStop(0, "rgba(8, 10, 6, 0.2)");
  shade.addColorStop(0.42, "rgba(10, 12, 8, 0.07)");
  shade.addColorStop(1, "transparent");
  ctx.fillStyle = shade;
  ctx.fillRect(left, top, width, 12);
  const warm = ctx.createLinearGradient(left, top + 7, left + width * 0.72, top + 7);
  warm.addColorStop(0, "rgba(196, 136, 72, 0.075)");
  warm.addColorStop(1, "transparent");
  ctx.fillStyle = warm;
  ctx.fillRect(left + 2, top + 6, Math.ceil(width * 0.7), 4);
}

/** Quiet west-weighted bounce on the south facade, under the eave shadow. */
export function drawFacadeRim(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): void {
  if (bw < TILE || bh < TILE) return;
  const y = Math.floor(by + bh - TILE + 8);
  const warm = ctx.createLinearGradient(bx, y, bx + bw * 0.65, y);
  warm.addColorStop(0, "rgba(196, 136, 72, 0.07)");
  warm.addColorStop(1, "transparent");
  ctx.fillStyle = warm;
  ctx.fillRect(Math.floor(bx + 2), y, Math.ceil(bw * 0.62), 7);
}

/** Shade under a shop cloth, and a short warm lip on the lit edge. */
export function drawAwningVolume(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
): void {
  lick(ctx, sx + 14, sy + 8, 11, 2, 0.18);
  bounce(ctx, sx + 9, sy + 3, 8, 1.7, 0.065);
}
