/** Creature sprite drawing (keeps enemies.ts AI untouched). Original Vale art. */
import type { Enemy } from "@/game/enemies";
import { isHollowBoss } from "@/game/enemies";
import {
  drawCreatureSprite,
  creatureWalkFrame,
  getCreatureSheet,
  CREATURE_FRAME,
  type CreatureKindId,
} from "@/game/gfx/creatures";
import { creatureHitLeft, drawSilhouetteFlash, tickCreatureHits } from "@/game/gfx/hitFlash";
import { drawContactShadow } from "@/game/gfx/contactShadow";
import { rimStrengthForDistance } from "@/game/gfx/directionalRim";
import type { DepthItem } from "@/game/gfx/depth";
import { flushDepth } from "@/game/gfx/depth";
import { TILE } from "@/game/world";

function creatureSpriteId(id: string): CreatureKindId {
  return id as CreatureKindId;
}

let _animT = 0;
let _gfxDt = 1 / 60;

type ShadowTrail = { x: number; y: number; px: number; py: number };
const _trails = new Map<string, ShadowTrail>();

/** Advance shared creature anim clock (call once per render frame). */
export function tickEnemyGfx(dt: number): void {
  _animT += dt;
  _gfxDt = dt;
  tickCreatureHits(dt);
}

function creatureDrawSize(id: string, radius: number): number {
  if (id === "ashveil-ember") return Math.max(40, Math.min(64, Math.round(radius * 3.4)));
  return Math.max(28, Math.min(56, Math.round(radius * 3.1)));
}

/** Short lag opposite the step so the blob stays on the ground while the sprite leads. */
function shadowTrail(id: string, x: number, y: number): { x: number; y: number } {
  const prev = _trails.get(id);
  let tx = 0;
  let ty = 0;
  if (prev) {
    const dx = x - prev.px;
    const dy = y - prev.py;
    const mag = Math.hypot(dx, dy);
    if (mag > 0.2 && mag < 48) {
      const cap = Math.min(2.6, mag * 0.55);
      tx = (-dx / mag) * cap;
      ty = (-dy / mag) * cap;
    }
    const ease = 1 - Math.exp(-14 * _gfxDt);
    tx = prev.x + (tx - prev.x) * ease;
    ty = prev.y + (ty - prev.y) * ease;
  }
  _trails.set(id, { x: tx, y: ty, px: x, py: y });
  return { x: tx, y: ty };
}

function hashId(id: string): number {
  let n = 0;
  for (let i = 0; i < id.length; i++) n = (n * 33 + id.charCodeAt(i)) | 0;
  return (n >>> 0) / 4294967296;
}

function paintCreatureHit(
  ctx: CanvasRenderingContext2D,
  e: Enemy,
  sx: number,
  sy: number,
  frame: number,
): void {
  const left = creatureHitLeft(e);
  if (left <= 0) return;
  const size = creatureDrawSize(e.kind.id, e.kind.radius);
  const sheet = getCreatureSheet(
    creatureSpriteId(e.kind.id),
    e.kind.color,
    e.kind.colorDark,
    false,
    frame,
  );
  drawSilhouetteFlash(
    ctx,
    sheet,
    0,
    0,
    CREATURE_FRAME,
    CREATURE_FRAME,
    Math.floor(sx - size / 2),
    Math.floor(sy - size / 2 - 2),
    size,
    size,
    left,
  );
}

export function collectEnemyDepthItems(
  enemies: Enemy[],
  originX: number,
  originY: number,
  groundShift: { x: number; y: number } = { x: 0, y: 0 },
  /** World position. Creatures past a few tiles skip the rim. */
  player?: { x: number; y: number },
): DepthItem[] {
  const items: DepthItem[] = [];
  const seen = new Set<string>();
  for (const e of enemies) {
    seen.add(e.id);
    const sx = Math.floor(e.x - originX);
    const sy = Math.floor(e.y - originY);
    const trail = shadowTrail(e.id, e.x, e.y);
    const shiftX = groundShift.x + trail.x;
    const shiftY = groundShift.y + trail.y;
    items.push({
      y: e.y,
      x: e.x,
      draw: (ctx) => {
        const size = creatureDrawSize(e.kind.id, e.kind.radius);
        const footY = sy + size * 0.34;
        const floating = e.kind.id === "shade-wisp";
        if (e.ai === "dead") {
          const fade = Math.max(0, e.corpseT / 1.4);
          drawContactShadow(
            ctx,
            sx + shiftX,
            footY + shiftY,
            size * 0.42,
            size * 0.15,
            fade * 0.4,
          );
          ctx.globalAlpha = fade * 0.55;
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
          paintCreatureHit(ctx, e, sx, sy, 0);
          return;
        }
        // Wider soft penumbra around the sprite's tighter contact so the oval reads as ground.
        drawContactShadow(
          ctx,
          sx + shiftX,
          footY + shiftY,
          size * (floating ? 0.34 : e.kind.id === "ashveil-ember" ? 0.64 : 0.58),
          size * (floating ? 0.12 : 0.22),
          floating ? 0.2 : 0.36,
        );
        const moving = e.ai === "chase" || e.ai === "idle";
        const frame = creatureWalkFrame(_animT + hashId(e.id) * 4, moving);
        const rim = player
          ? rimStrengthForDistance(Math.hypot(e.x - player.x, e.y - player.y), TILE)
          : 1;
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
          rim,
        );
        paintCreatureHit(ctx, e, sx, sy, frame);
      },
    });
  }
  for (const id of _trails.keys()) {
    if (!seen.has(id)) _trails.delete(id);
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
    const label = `${e.kind.name} · ${e.kind.rank}`;
    const tw = ctx.measureText(label).width;
    const lx = sx - tw / 2 - 3;
    const ly = sy - e.kind.radius - 23;
    ctx.fillStyle = "rgba(12, 13, 11, 0.78)";
    ctx.fillRect(lx, ly, tw + 6, 11);
    ctx.fillStyle = boss ? "#e8c878" : "#e8e6d9";
    ctx.fillText(label, sx, sy - e.kind.radius - 14);
    const ratio = e.hp / e.kind.maxHp;
    const barW = boss ? 28 : 18;
    const barH = boss ? 4 : 3;
    const bx = sx - barW / 2;
    const by = sy - e.kind.radius - 10;
    ctx.fillStyle = "#1a1410";
    ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
    ctx.fillStyle = boss ? "#4a2818" : "#1a1c16";
    ctx.fillRect(bx, by, barW, barH);
    ctx.fillStyle = ratio > 0.35 ? (boss ? "#e07030" : "#c45c3e") : "#a03030";
    ctx.fillRect(bx, by, barW * ratio, barH);
    if (boss || ratio <= 0.35) {
      ctx.fillStyle = "rgba(248,200,80,0.55)";
      ctx.fillRect(bx, by, barW * ratio, 1);
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
