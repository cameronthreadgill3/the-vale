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

function creatureSpriteId(id: string): CreatureKindId {
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
          const fade = Math.max(0, e.corpseT / 1.4);
          ctx.globalAlpha = fade * 0.55;
          drawSoftShadow(ctx, sx, sy + 2, e.kind.radius * 0.9, e.kind.radius * 0.35, 0.4);
          ctx.fillStyle = e.kind.colorDark;
          ctx.beginPath();
          ctx.ellipse(sx, sy + 2, e.kind.radius * 0.9, e.kind.radius * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
          if (isHollowBoss(e.kind.id)) {
            ctx.globalAlpha = fade * 0.45;
            ctx.fillStyle = "#e07030";
            ctx.beginPath();
            ctx.ellipse(sx, sy + 1, e.kind.radius * 0.35, e.kind.radius * 0.18, 0, 0, Math.PI * 2);
            ctx.fill();
          }
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
    ctx.fillText(`${e.kind.name} · ${e.kind.rank}`, sx, sy - e.kind.radius - 14);
    const ratio = e.hp / e.kind.maxHp;
    const barW = boss ? 26 : 16;
    const barH = boss ? 4 : 3;
    const bx = sx - barW / 2;
    const by = sy - e.kind.radius - 10;
    if (boss) {
      ctx.fillStyle = "#1a1410";
      ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
      ctx.fillStyle = "#4a2818";
      ctx.fillRect(bx, by, barW, barH);
      ctx.fillStyle = ratio > 0.35 ? "#e07030" : "#a03030";
      ctx.fillRect(bx, by, barW * ratio, barH);
      ctx.fillStyle = "rgba(248,200,80,0.55)";
      ctx.fillRect(bx, by, barW * ratio, 1);
    } else {
      ctx.fillStyle = "#1a1c16";
      ctx.fillRect(bx, by, barW, barH);
      ctx.fillStyle = ratio > 0.35 ? "#c45c3e" : "#a03030";
      ctx.fillRect(bx, by, barW * ratio, barH);
    }
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
