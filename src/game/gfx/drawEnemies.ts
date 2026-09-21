/** Creature sprite drawing (keeps enemies.ts AI untouched). Original Vale art. */
import type { Enemy } from "@/game/enemies";
import { drawCreatureSprite, creatureWalkFrame } from "@/game/gfx/creatures";
import { drawSoftShadow } from "@/game/gfx/canvasUtil";

let _animT = 0;

/** Advance shared creature anim clock (call once per render frame). */
export function tickEnemyGfx(dt: number): void {
  _animT += dt;
}

export function drawEnemies(
  ctx: CanvasRenderingContext2D,
  enemies: Enemy[],
  originX: number,
  originY: number,
): void {
  // Y-sort enemies for depth
  const sorted = enemies.slice().sort((a, b) => a.y - b.y);
  for (const e of sorted) {
    const sx = Math.floor(e.x - originX);
    const sy = Math.floor(e.y - originY);
    if (e.ai === "dead") {
      ctx.globalAlpha = Math.max(0, e.corpseT / 1.4) * 0.55;
      drawSoftShadow(ctx, sx, sy + 2, e.kind.radius * 0.9, e.kind.radius * 0.35, 0.4);
      ctx.fillStyle = e.kind.colorDark;
      ctx.beginPath();
      ctx.ellipse(sx, sy + 2, e.kind.radius * 0.9, e.kind.radius * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      continue;
    }
    const moving = e.ai === "chase" || e.ai === "attack";
    const frame = creatureWalkFrame(_animT, moving);
    drawCreatureSprite(
      ctx,
      e.kind.id,
      e.kind.color,
      e.kind.colorDark,
      sx,
      sy,
      e.kind.radius,
      e.flash > 0,
      frame,
    );
    ctx.font = "9px \"IBM Plex Mono\", ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#c9c4a8";
    ctx.fillText(
      `${e.kind.name} · ${e.kind.rank}`,
      sx,
      sy - e.kind.radius - 12,
    );
    const ratio = e.hp / e.kind.maxHp;
    ctx.fillStyle = "#1a1c16";
    ctx.fillRect(sx - 8, sy - e.kind.radius - 8, 16, 3);
    ctx.fillStyle = ratio > 0.35 ? "#c45c3e" : "#a03030";
    ctx.fillRect(sx - 8, sy - e.kind.radius - 8, 16 * ratio, 3);
  }
}
