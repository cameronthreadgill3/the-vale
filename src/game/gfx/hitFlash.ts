/**
 * Brief white/red hit flash for the walker and creatures.
 * Tints a sprite's own pixels on a tiny scratch canvas — no shader.
 * Creature hits are tracked here so attack wind-up (Enemy.flash) stays a telegraph.
 */

import { makeCanvas, ctx2d } from "@/game/gfx/canvasUtil";

/** Readable flicker window (seconds). Presentation only. */
export const HIT_FLASH_SEC = 0.28;

const creatureHits = new Map<object, number>();

/** Start (or restart) a damage flash for a creature that just took a hit. */
export function punchCreatureHit(enemy: object): void {
  creatureHits.set(enemy, HIT_FLASH_SEC);
}

export function tickCreatureHits(dt: number): void {
  if (dt <= 0) return;
  for (const [enemy, left] of creatureHits) {
    const next = left - dt;
    if (next <= 0) creatureHits.delete(enemy);
    else creatureHits.set(enemy, next);
  }
}

export function creatureHitLeft(enemy: object): number {
  return creatureHits.get(enemy) ?? 0;
}

const SCRATCH_MAX = 96;

type Scratch = {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  ctx: CanvasRenderingContext2D;
  size: number;
};

let scratch: Scratch | null = null;

function scratchOf(need: number): Scratch {
  const size = Math.max(SCRATCH_MAX, Math.ceil(need));
  if (scratch && scratch.size >= size) return scratch;
  const canvas = makeCanvas(size, size);
  scratch = { canvas, ctx: ctx2d(canvas), size };
  return scratch;
}

/** White, red, white, red — fat outline at the start, then a fade. */
export function hitFlashStyle(left: number): { color: string; alpha: number; spread: number } {
  const u = Math.max(0, Math.min(1, left / HIT_FLASH_SEC));
  const age = Math.max(0, HIT_FLASH_SEC - left);
  const white = Math.floor(age / 0.07) % 2 === 0;
  const color = white ? "#fff4ea" : "#ff3b32";
  const alpha = u > 0.35 ? 0.92 : 0.92 * (u / 0.35);
  const spread = u > 0.62 ? 2 : 1;
  return { color, alpha, spread };
}

/**
 * Outline pulse plus a see-through body flicker.
 * `left` is seconds remaining in the flash window.
 */
export function drawSilhouetteFlash(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  srcX: number,
  srcY: number,
  srcW: number,
  srcH: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  left: number,
): void {
  if (left <= 0 || dw < 2 || dh < 2 || srcW < 1 || srcH < 1) return;
  const { color, alpha, spread } = hitFlashStyle(left);
  const s = scratchOf(Math.max(dw, dh));
  const g = s.ctx;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 1;
  g.clearRect(0, 0, s.size, s.size);
  g.imageSmoothingEnabled = false;
  g.drawImage(source, srcX, srcY, srcW, srcH, 0, 0, dw, dh);
  g.globalCompositeOperation = "source-in";
  g.fillStyle = color;
  g.fillRect(0, 0, dw, dh);
  g.globalCompositeOperation = "source-over";

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = alpha;
  const img = s.canvas;
  ctx.drawImage(img, 0, 0, dw, dh, dx - spread, dy, dw, dh);
  ctx.drawImage(img, 0, 0, dw, dh, dx + spread, dy, dw, dh);
  ctx.drawImage(img, 0, 0, dw, dh, dx, dy - spread, dw, dh);
  ctx.drawImage(img, 0, 0, dw, dh, dx, dy + spread, dw, dh);
  ctx.globalAlpha = alpha * 0.5;
  ctx.drawImage(img, 0, 0, dw, dh, dx, dy, dw, dh);
  ctx.restore();
}

/** Stand-in orb when a class sheet is not ready. */
export function drawOrbHitFlash(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  left: number,
): void {
  if (left <= 0) return;
  const { color, alpha, spread } = hitFlashStyle(left);
  ctx.save();
  ctx.globalAlpha = Math.min(0.95, alpha);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius + spread + 1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = alpha * 0.45;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
