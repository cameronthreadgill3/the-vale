/**
 * Tiny dust and ash puffs at the walker's feet.
 * Procedural pixels only — short life, a handful of specks, no sheets.
 * Dirt and worn path kick them up. Cobble, plaza stone, and grass stay quiet.
 * Original Vale pixels, not CipSoft.
 */
import type { Facing } from "@/game/playerSprites";
import { PLAYER_SPRITE_SIZE } from "@/game/playerSprites";
import { TILE, type GroundTile, type WorldMap } from "@/game/world";

/** Tiles that throw a puff. Cobble is plaza stone and is intentionally absent. */
const DUSTY: ReadonlySet<GroundTile> = new Set(["dirt", "path"]);

const POOL = 12;
const SPECKS = 3;
const LIFE = 0.26;
/**
 * Sole line. The contact blob sits a little higher; the boot pixels land here
 * once the 32px frame is drawn at PLAYER_SPRITE_SIZE.
 */
const FOOT_DROP = PLAYER_SPRITE_SIZE * 0.35 + 2;

const TONES = ["#e4d8c4", "#b7a48a", "#7d6a52"] as const;

type Puff = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  tone: 0 | 1 | 2;
  w: number;
  alive: boolean;
};

const puffs: Puff[] = Array.from({ length: POOL }, () => ({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  life: 0,
  maxLife: 1,
  tone: 0,
  w: 1,
  alive: false,
}));

let lastStep = -1;
let viewX = 0;
let viewY = 0;

export function groundKicksDust(tile: GroundTile | null | undefined): boolean {
  return tile != null && DUSTY.has(tile);
}

function tileAt(map: WorldMap, x: number, y: number): GroundTile | null {
  const tx = Math.floor(x / TILE);
  const ty = Math.floor(y / TILE);
  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return null;
  return map.tiles[ty]?.[tx] ?? null;
}

function acquire(): Puff {
  for (const p of puffs) {
    if (!p.alive) return p;
  }
  let oldest = puffs[0]!;
  for (const p of puffs) {
    if (p.life < oldest.life) oldest = p;
  }
  return oldest;
}

function spawnPuff(x: number, y: number, facing: Facing): void {
  let backX = 0;
  let backY = 0;
  if (facing === "east") backX = -1;
  else if (facing === "west") backX = 1;
  else if (facing === "south") backY = -1;
  else backY = 1;
  const sideX = backX === 0 ? 1 : 0;
  const sideY = backY === 0 ? 1 : 0;

  for (let i = 0; i < SPECKS; i++) {
    const p = acquire();
    const side = (i - 1) * 10;
    const life = LIFE + i * 0.04;
    p.x = x + backX * 5 + sideX * side;
    p.y = y + backY * 3 + sideY * side * 0.65;
    p.vx = backX * (16 + i * 7) + sideX * (i - 1) * 10;
    p.vy = backY * (12 + i * 5) + sideY * (i - 1) * 8 - 11 - i;
    p.life = life;
    p.maxLife = life;
    p.tone = i as 0 | 1 | 2;
    p.w = i === 1 ? 2 : 1;
    p.alive = true;
  }
}

export function tickFootstepDust(args: {
  dt: number;
  map: WorldMap;
  x: number;
  y: number;
  moving: boolean;
  walkPhase: number;
  facing: Facing;
  paused: boolean;
  stepDist: number;
  originX: number;
  originY: number;
}): void {
  const { dt, map, x, y, moving, walkPhase, facing, paused, stepDist, originX, originY } = args;
  viewX = originX;
  viewY = originY;

  for (const p of puffs) {
    if (!p.alive) continue;
    p.life -= dt;
    if (p.life <= 0) {
      p.alive = false;
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 24 * dt;
  }

  const step = Math.floor(walkPhase / 2);
  const crossed = moving && step !== lastStep;
  if (!moving) lastStep = -1;
  else lastStep = step;

  if (!crossed || paused || stepDist > TILE * 1.5) return;
  if (!groundKicksDust(tileAt(map, x, y))) return;
  spawnPuff(x, y + FOOT_DROP, facing);
}

/** Screen-space specks. Call after the walker so the puff sits on the sole, under the later light passes. */
export function drawFootstepDust(ctx: CanvasRenderingContext2D): void {
  let any = false;
  for (const p of puffs) {
    if (p.alive) {
      any = true;
      break;
    }
  }
  if (!any) return;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  for (const p of puffs) {
    if (!p.alive) continue;
    const u = p.life / p.maxLife;
    const alpha = u * u * 0.72;
    if (alpha < 0.04) continue;
    const sx = Math.floor(p.x - viewX);
    const sy = Math.floor(p.y - viewY);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = TONES[p.tone];
    ctx.fillRect(sx, sy, p.w, 1);
    if (p.w === 1 && u > 0.45) {
      ctx.globalAlpha = alpha * 0.45;
      ctx.fillRect(sx + (p.tone === 0 ? 1 : -1), sy - 1, 1, 1);
    }
  }
  ctx.restore();
}
