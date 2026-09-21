/** Creature sprite drawing (keeps enemies.ts AI untouched). Original Vale art. */
import type { Enemy } from "@/game/enemies";
import { isHollowBoss } from "@/game/enemies";
import {
  drawCreatureSprite,
  creatureWalkFrame,
  type CreatureKindId,
} from "@/game/gfx/creatures";
import { drawSoftShadow } from "@/game/gfx/canvasUtil";
import type { DepthItem } from "@/game/gfx/depth";
import { flushDepth } from "@/game/gfx/depth";

/** Reuse the shade-wisp silhouette for the hollow boss stub — no new art files. */
function creatureSpriteId(id: string): CreatureKindId {
  if (id === "ashveil-ember") return "shade-wisp";
  return id as CreatureKindId;
}

let _animT = 0;

/** Advance shared creature anim clock (call once per render frame). */
export function tickEnemyGfx(dt: number): void {
  _animT += dt;
}

function hashId(id: string): number {
  let n = 0;
  for (let i = 0; i < id.length; i++) n = (n * 33 + id.charCodeAt(i)) | 0;
  return (n >>> 0) / 4294967296;
}

export function collectEnemyDepthItems(
  enemies: Enemy[],
  originX: number,
  originY: number,
): DepthItem[] {
  const items: DepthItem[] = [];
  for (const e of enemies) {
    const sx = Math.floor(e.x - originX);
    const sy = Math.floor(e.y - originY);
    items.push({
      y: e.y,
      x: e.x,
      draw: (ctx) => {
        if (e.ai === "dead") {
          ctx.globalAlpha = Math.max(0, e.corpseT / 1.4) * 0.55;
          drawSoftShadow(ctx, sx, sy + 2, e.kind.radius * 0.9, e.kind.radius * 0.35, 0.4);
          ctx.fillStyle = e.kind.colorDark;
          ctx.beginPath();
          ctx.ellipse(sx, sy + 2, e.kind.radius * 0.9, e.kind.radius * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          return;
        }
        const moving = e.ai === "chase" || e.ai === "idle";
        const frame = creatureWalkFrame(_animT + hashId(e.id) * 4, moving);
        drawCreatureSprite(
          ctx,
          creatureSpriteId(e.kind.id),
          e.kind.color,
          e.kind.colorDark,
          sx,
          sy,
          e.kind.radius,
          e.flash > 0,
          frame,
        );
      },
    });
  }
  return items;
}

export function drawEnemyChrome(
  ctx: CanvasRenderingContext2D,
  enemies: Enemy[],
  originX: number,
  originY: number,
): void {
  ctx.font = "9px \"IBM Plex Mono\", ui-monospace, monospace";
  ctx.textAlign = "center";
  for (const e of enemies) {
    if (e.ai === "dead") continue;
    const sx = Math.floor(e.x - originX);
    const sy = Math.floor(e.y - originY);
    const boss = isHollowBoss(e.kind.id);
    ctx.fillStyle = boss ? "#e8c878" : "#c9c4a8";
    ctx.fillText(`${e.kind.name} · ${e.kind.rank}`, sx, sy - e.kind.radius - 12);
    const ratio = e.hp / e.kind.maxHp;
    const barW = boss ? 22 : 16;
    ctx.fillStyle = "#1a1c16";
    ctx.fillRect(sx - barW / 2, sy - e.kind.radius - 8, barW, 3);
    ctx.fillStyle = ratio > 0.35 ? "#c45c3e" : "#a03030";
    ctx.fillRect(sx - barW / 2, sy - e.kind.radius - 8, barW * ratio, 3);
  }
}

export function drawEnemies(
  ctx: CanvasRenderingContext2D,
  enemies: Enemy[],
  originX: number,
  originY: number,
): void {
  flushDepth(ctx, collectEnemyDepthItems(enemies, originX, originY));
  drawEnemyChrome(ctx, enemies, originX, originY);
}
