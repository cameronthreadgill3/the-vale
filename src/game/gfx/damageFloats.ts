/**
 * Presentation pass for combat float texts.
 * Numbers, gold, and heals stay as spawned; this only changes rise, hold, fade, and contrast.
 * Spawn vy must stay -28 — that is the fresh-float mark from gameLoop / gameLoopCombat.
 */

import type { FloatText } from "@/game/enemies";

/** vy written by pushFloat. Exact match means this text has not been eased yet. */
const SPAWN_VY = -28;
/** Extra read time after the assembled updater has already ticked life once. */
const EXTRA_LIFE = 0.45;
/** Instant step so the number clears the sprite on the hit frame. */
const POP_KICK = -8;
/** Fast rise, then ease toward DRIFT_VY. */
const POP_VY = -50;
const DRIFT_VY = -10;
const EASE = 3.6;
/** Life below this fades out. Above it the glyph stays solid. */
const FADE_TAIL = 0.38;

export function easeCombatFloats(texts: FloatText[], dt: number): void {
  for (const t of texts) {
    if (t.vy === SPAWN_VY) {
      t.life += EXTRA_LIFE;
      t.y += POP_KICK;
      t.vy = POP_VY;
      continue;
    }
    if (dt > 0) {
      t.vy += (DRIFT_VY - t.vy) * (1 - Math.exp(-EASE * dt));
    }
  }
}

function readAlpha(life: number): number {
  if (life >= FADE_TAIL) return 1;
  const u = Math.max(0, life / FADE_TAIL);
  return u * u * (3 - 2 * u);
}

function isCompactFigure(text: string): boolean {
  return /^[+-]?\d+g?$/.test(text);
}

/**
 * Dark halo + hold-then-fade. Drawn above bloom so the glyphs stay sharp.
 */
export function drawCombatFloats(
  ctx: CanvasRenderingContext2D,
  texts: FloatText[],
  originX: number,
  originY: number,
): void {
  if (texts.length === 0) return;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  for (const t of texts) {
    const alpha = readAlpha(t.life);
    if (alpha <= 0.01) continue;
    const x = Math.floor(t.x - originX);
    const y = Math.floor(t.y - originY);
    const figure = isCompactFigure(t.text);
    ctx.font = figure
      ? 'bold 14px Figtree, system-ui, sans-serif'
      : 'bold 12px Figtree, system-ui, sans-serif';
    ctx.globalAlpha = alpha;
    ctx.lineWidth = figure ? 3 : 2.5;
    ctx.strokeStyle = "#14110e";
    ctx.strokeText(t.text, x, y);
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, x, y);
  }
  ctx.restore();
}
