/**
 * Soft directional rim for a sprite already drawn.
 * Light sits north-west, the same way as the key light: a warm band on the
 * lit edge, a quieter cool band on the far side. Both are the sprite's own
 * alpha, so the contact shadow underneath is left alone.
 * Tiny scratch canvases only — no new sheets, no shader.
 * Original Vale pixels. First Story.
 */

import { ctx2d, makeCanvas } from "@/game/gfx/canvasUtil";

/** Matches the key-light warm stop. */
const WARM = "rgb(255, 214, 164)";
/** Matches the key-light cool stop. */
const COOL = "rgb(48, 78, 98)";

/** Full strength inside this many tiles; gone past the outer band. */
const FULL_TILES = 4.5;
const FAR_TILES = 8.5;

const PAD = 4;

/**
 * 1 beside the walker, easing out so a rat across the field does not pay for a rim.
 * `tile` is world pixels per tile (32 in the Vale).
 */
export function rimStrengthForDistance(distPx: number, tile = 32): number {
  const scale = tile > 0 ? tile : 32;
  const full = scale * FULL_TILES;
  const far = scale * FAR_TILES;
  if (distPx <= full) return 1;
  if (distPx >= far) return 0;
  const t = (distPx - full) / (far - full);
  return 1 - t * t;
}

type Buf = {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  ctx: CanvasRenderingContext2D;
  size: number;
};

let spriteBuf: Buf | null = null;
let rimBuf: Buf | null = null;

function bufOf(slot: "sprite" | "rim", need: number): Buf {
  const size = Math.max(80, Math.ceil(need));
  const cur = slot === "sprite" ? spriteBuf : rimBuf;
  if (cur && cur.size >= size) return cur;
  const canvas = makeCanvas(size, size);
  const next: Buf = { canvas, ctx: ctx2d(canvas), size };
  if (slot === "sprite") spriteBuf = next;
  else rimBuf = next;
  return next;
}

/**
 * Keep the part of the sprite copy that the punch does not cover, then tint it.
 * Offsets are in screen pixels. A south-east punch leaves the north-west edge.
 */
function extract(
  rim: Buf,
  sprite: Buf,
  drawX: number,
  drawY: number,
  punchX: number,
  punchY: number,
  color: string,
): void {
  const g = rim.ctx;
  const n = rim.size;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  g.globalCompositeOperation = "source-over";
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, n, n);
  g.drawImage(sprite.canvas, drawX, drawY);
  g.globalCompositeOperation = "destination-out";
  g.drawImage(sprite.canvas, punchX, punchY);
  g.globalCompositeOperation = "source-in";
  g.fillStyle = color;
  g.fillRect(0, 0, n, n);
  g.globalCompositeOperation = "source-over";
}

function blit(
  ctx: CanvasRenderingContext2D,
  rim: Buf,
  dx: number,
  dy: number,
  alpha: number,
): void {
  if (alpha <= 0.01) return;
  ctx.globalAlpha = alpha;
  ctx.drawImage(rim.canvas, dx, dy);
}

/**
 * Overlay a soft north-west rim on a sprite just drawn at (dx, dy, dw, dh).
 * `strength` is 0–1. Distant callers should pass 0 and skip the scratch work.
 */
export function drawDirectionalRim(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  strength = 1,
): void {
  if (strength <= 0.02 || dw < 2 || dh < 2 || sw < 1 || sh < 1) return;
  const side = Math.max(dw, dh) + PAD * 2;
  const sprite = bufOf("sprite", side);
  const rim = bufOf("rim", side);
  const g = sprite.ctx;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  g.globalCompositeOperation = "source-over";
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, sprite.size, sprite.size);
  g.drawImage(source, sx, sy, sw, sh, PAD, PAD, dw, dh);

  const originX = dx - PAD;
  const originY = dy - PAD;
  const s = strength > 1 ? 1 : strength;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // Warm light, feathered a few pixels into the body so the form turns.
  extract(rim, sprite, 0, 0, 4, 4, WARM);
  blit(ctx, rim, originX, originY, 0.1 * s);
  extract(rim, sprite, 0, 0, 2, 2, WARM);
  blit(ctx, rim, originX, originY, 0.22 * s);

  // Cool far side. Quieter than the light so the vignette still owns the dark.
  extract(rim, sprite, 0, 0, -2, -2, COOL);
  blit(ctx, rim, originX, originY, 0.16 * s);

  // Outside catch toward the light, plus one softer step past the silhouette.
  extract(rim, sprite, -2, -2, 0, 0, WARM);
  blit(ctx, rim, originX, originY, 0.2 * s);
  blit(ctx, rim, originX - 1, originY - 1, 0.08 * s);

  ctx.restore();
}

/** Stand-in orb when a class sheet is not ready. Same light, no sheet. */
export function drawOrbDirectionalRim(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  strength = 1,
): void {
  if (strength <= 0.02 || radius < 2) return;
  const s = strength > 1 ? 1 : strength;
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = `rgba(255, 214, 164, ${(0.5 * s).toFixed(3)})`;
  ctx.beginPath();
  ctx.arc(x - 1, y - 1, radius - 1, Math.PI * 1.02, Math.PI * 1.48);
  ctx.stroke();
  ctx.strokeStyle = `rgba(48, 78, 98, ${(0.32 * s).toFixed(3)})`;
  ctx.beginPath();
  ctx.arc(x + 1, y + 1, radius - 1, Math.PI * 0.08, Math.PI * 0.52);
  ctx.stroke();
  ctx.restore();
}
