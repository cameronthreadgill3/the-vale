/** Creature sprite drawing (keeps enemies.ts AI untouched). Original Vale art. */
import type { Enemy } from "@/game/enemies";
import { drawCreatureSprite } from "@/game/gfx/creatures";

export function drawEnemies(
  ctx: CanvasRenderingContext2D,
  enemies: Enemy[],
  originX: number,
  originY: number,
): void {
  for (const e of enemies) {
    const sx = Math.floor(e.x - originX);
    const sy = Math.floor(e.y - originY);
    if (e.ai === "dead") {
      ctx.globalAlpha = Math.max(0, e.corpseT / 1.4) * 0.55;
      ctx.fillStyle = e.kind.colorDark;
      ctx.beginPath();
      ctx.ellipse(sx, sy + 2, e.kind.radius * 0.9, e.kind.radius * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      continue;
    }
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(sx, sy + e.kind.radius * 0.55, e.kind.radius * 0.8, e.kind.radius * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    drawCreatureSprite(
      ctx,
      e.kind.id,
      e.kind.color,
      e.kind.colorDark,
      sx,
      sy,
      e.kind.radius,
      e.flash > 0,
    );
    ctx.font = "9px Figtree, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#c9c4a8";
    ctx.fillText(
      `${e.kind.name} · ${e.kind.rank}`,
      sx,
      sy - e.kind.radius - 10,
    );
    const ratio = e.hp / e.kind.maxHp;
    ctx.fillStyle = "#1a1c16";
    ctx.fillRect(sx - 8, sy - e.kind.radius - 6, 16, 3);
    ctx.fillStyle = ratio > 0.35 ? "#c45c3e" : "#a03030";
    ctx.fillRect(sx - 8, sy - e.kind.radius - 6, 16 * ratio, 3);
  }
}
