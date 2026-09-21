/** Brief procedural glints on loot floats / ground drops. Original Vale pixels. */

import { TILE } from "@/game/world";

/** Extra twinkle when the walker is this close (auto-pickup is already in range). */
export const LOOT_NEAR_TILES = 2.2;
const MAX_SPARKLES = 10;
const GOLD = "#c9a227";
const GOLD_LITE = "#f4e8b0";
const ITEM = "#d8c878";
const ITEM_LITE = "#fff8d8";

export type LootSparkleKind = "gold" | "item";

interface LootSparkle {
  x: number;
  y: number;
  groundY: number;
  life: number;
  maxLife: number;
  kind: LootSparkleKind;
  seed: number;
}

const sparks: LootSparkle[] = [];

export function spawnLootSparkle(
  x: number,
  y: number,
  kind: LootSparkleKind,
): void {
  if (sparks.length >= MAX_SPARKLES) sparks.shift();
  const maxLife = kind === "gold" ? 0.52 : 0.68;
  sparks.push({
    x,
    y,
    groundY: y + 16,
    life: maxLife,
    maxLife,
    kind,
    seed: (x * 12.9898 + y * 78.233) % (Math.PI * 2),
  });
}

export function tickLootSparkles(dt: number): void {
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i]!;
    s.life -= dt;
    if (s.life <= 0) sparks.splice(i, 1);
  }
}

function px(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  alpha: number,
  w = 1,
  h = 1,
): void {
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
}

/** Tiny 4-arm glint (1–2px). */
function star(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  alpha: number,
  arm = 1,
): void {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  px(ctx, ix, iy, color, alpha);
  if (arm <= 0) return;
  px(ctx, ix - arm, iy, color, alpha * 0.7);
  px(ctx, ix + arm, iy, color, alpha * 0.7);
  px(ctx, ix, iy - arm, color, alpha * 0.7);
  px(ctx, ix, iy + arm, color, alpha * 0.7);
}

export function drawLootSparkles(
  ctx: CanvasRenderingContext2D,
  originX: number,
  originY: number,
  player: { x: number; y: number },
): void {
  if (sparks.length === 0) return;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  for (const s of sparks) {
    const near =
      Math.hypot(player.x - s.x, player.y - s.groundY) / TILE <= LOOT_NEAR_TILES;
    const u = 1 - s.life / s.maxLife;
    const fade = Math.max(0, Math.min(1, s.life * 2.4));
    const a = fade * (near ? 1 : 0.62);
    const lite = s.kind === "gold" ? GOLD_LITE : ITEM_LITE;
    const mid = s.kind === "gold" ? GOLD : ITEM;
    const sx = s.x - originX;
    const gy = s.groundY - originY;
    const rise = s.y - originY - u * 9;

    // Ground drop glint — two cream pixels at the corpse feet.
    px(ctx, sx, gy, mid, a * 0.85, 2, 1);
    px(ctx, sx + 1, gy - 1, lite, a * (near ? 0.95 : 0.55));
    if (near) {
      px(ctx, sx - 1, gy, lite, a * 0.45);
      px(ctx, sx + 2, gy, mid, a * 0.4);
    }

    const n = near ? 4 : 3;
    for (let i = 0; i < n; i++) {
      const ang = s.seed + i * 2.05 + u * 3.4;
      const rad = 2.5 + i * 1.6 + (near ? 1.2 : 0);
      star(
        ctx,
        sx + Math.cos(ang) * rad,
        rise + Math.sin(ang) * rad * 0.55,
        i === 0 ? lite : mid,
        a * (i === 0 ? 1 : 0.72),
        near && i === 0 ? 1 : 0,
      );
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}
