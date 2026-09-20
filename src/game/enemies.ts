/** Hostile creatures — seeded spawns, simple aggro AI, draw + floating damage. */

import { WORLD_SEED, type ContinentId } from "@/game/continents";
import { rngFrom, randInt, type Rng } from "@/game/rng";
import { TILE, isSolid, type WorldMap } from "@/game/world";

export type EnemyKindId =
  | "briar-mite"
  | "hollow-rat"
  | "moss-creeper"
  | "shade-wisp";

export interface EnemyKind {
  id: EnemyKindId;
  name: string;
  color: string;
  colorDark: string;
  radius: number;
  level: number;
  maxHp: number;
  attack: number;
  speed: number;
  aggroRange: number;
  attackRange: number;
  attackCooldown: number;
  xpBase: number;
  goldMin: number;
  goldMax: number;
}

export const ENEMY_KINDS: Record<EnemyKindId, EnemyKind> = {
  "briar-mite": {
    id: "briar-mite",
    name: "Briar Mite",
    color: "#8a6a3a",
    colorDark: "#4a3820",
    radius: 7,
    level: 1,
    maxHp: 18,
    attack: 4,
    speed: 55,
    aggroRange: 3.2,
    attackRange: 0.9,
    attackCooldown: 1.2,
    xpBase: 12,
    goldMin: 1,
    goldMax: 3,
  },
  "hollow-rat": {
    id: "hollow-rat",
    name: "Hollow Rat",
    color: "#7a6a5a",
    colorDark: "#3a3028",
    radius: 8,
    level: 2,
    maxHp: 28,
    attack: 6,
    speed: 70,
    aggroRange: 4,
    attackRange: 0.95,
    attackCooldown: 1.1,
    xpBase: 22,
    goldMin: 2,
    goldMax: 5,
  },
  "moss-creeper": {
    id: "moss-creeper",
    name: "Moss Creeper",
    color: "#4a7a48",
    colorDark: "#243a22",
    radius: 10,
    level: 4,
    maxHp: 45,
    attack: 9,
    speed: 48,
    aggroRange: 4.5,
    attackRange: 1.05,
    attackCooldown: 1.3,
    xpBase: 40,
    goldMin: 3,
    goldMax: 8,
  },
  "shade-wisp": {
    id: "shade-wisp",
    name: "Shade Wisp",
    color: "#6a5a8a",
    colorDark: "#2a2238",
    radius: 9,
    level: 6,
    maxHp: 38,
    attack: 11,
    speed: 85,
    aggroRange: 5.5,
    attackRange: 1.2,
    attackCooldown: 1.0,
    xpBase: 55,
    goldMin: 4,
    goldMax: 12,
  },
};

export type EnemyAi = "idle" | "chase" | "attack" | "dead";

export interface Enemy {
  id: string;
  kind: EnemyKind;
  x: number;
  y: number;
  hp: number;
  ai: EnemyAi;
  attackCd: number;
  wanderT: number;
  wanderDx: number;
  wanderDy: number;
  flash: number;
  corpseT: number;
}

export interface FloatText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  vy: number;
}

export interface Projectile {
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
  life: number;
  style: "bolt" | "magic";
}

function walkable(map: WorldMap, tx: number, ty: number): boolean {
  if (tx <= 0 || ty <= 0 || tx >= map.width - 1 || ty >= map.height - 1) return false;
  const tile = map.tiles[ty]![tx]!;
  if (isSolid(tile, map.kind)) return false;
  if (tile === "gate" || tile === "hollow" || tile === "exit") return false;
  return true;
}

function tryPlace(
  rng: Rng,
  map: WorldMap,
  blocked: Set<string>,
  minDistFromSpawn: number,
): { x: number; y: number } | null {
  const spawn = map.spawn;
  for (let attempt = 0; attempt < 40; attempt++) {
    const tx = randInt(rng, 2, map.width - 3);
    const ty = randInt(rng, 2, map.height - 3);
    if (!walkable(map, tx, ty)) continue;
    if (blocked.has(`${tx},${ty}`)) continue;
    if (Math.hypot(tx - spawn.x, ty - spawn.y) < minDistFromSpawn) continue;
    blocked.add(`${tx},${ty}`);
    return { x: (tx + 0.5) * TILE, y: (ty + 0.5) * TILE };
  }
  return null;
}

/** Seeded enemies for the current map. Hollows are dense; overworld gets edge pests. */
export function spawnEnemies(
  map: WorldMap,
  continentId: ContinentId,
  blockedTiles: { x: number; y: number }[],
): Enemy[] {
  const hollowPart =
    map.kind === "hollow" ? `hollow-${map.hollowIndex ?? 0}` : "overworld";
  const seed = `${WORLD_SEED}|foes|${continentId}|${hollowPart}`;
  const rng = rngFrom(seed);
  const blocked = new Set(blockedTiles.map((t) => `${t.x},${t.y}`));
  const out: Enemy[] = [];
  let serial = 0;

  const add = (kindId: EnemyKindId, minDist: number) => {
    const pos = tryPlace(rng, map, blocked, minDist);
    if (!pos) return;
    const kind = ENEMY_KINDS[kindId];
    out.push({
      id: `${kindId}-${serial++}`,
      kind,
      x: pos.x,
      y: pos.y,
      hp: kind.maxHp,
      ai: "idle",
      attackCd: 0,
      wanderT: rng() * 2,
      wanderDx: 0,
      wanderDy: 0,
      flash: 0,
      corpseT: 0,
    });
  };

  if (map.kind === "hollow") {
    const depth = (map.hollowIndex ?? 0) + 1;
    const rats = 3 + randInt(rng, 0, 2);
    const creepers = 1 + randInt(rng, 0, depth > 1 ? 2 : 1);
    const wisps = depth >= 2 ? randInt(rng, 0, 2) : randInt(rng, 0, 1);
    for (let i = 0; i < rats; i++) add("hollow-rat", 3);
    for (let i = 0; i < creepers; i++) add("moss-creeper", 4);
    for (let i = 0; i < wisps; i++) add("shade-wisp", 5);
  } else {
    const pests = 2 + randInt(rng, 0, 2);
    for (let i = 0; i < pests; i++) add("briar-mite", 8);
  }

  return out;
}

function canStep(map: WorldMap, x: number, y: number, radius: number): boolean {
  const samples = [
    [x - radius, y - radius],
    [x + radius, y - radius],
    [x - radius, y + radius],
    [x + radius, y + radius],
  ] as const;
  for (const [px, py] of samples) {
    const tx = Math.floor(px / TILE);
    const ty = Math.floor(py / TILE);
    if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return false;
    if (isSolid(map.tiles[ty]![tx]!, map.kind)) return false;
  }
  return true;
}

export interface EnemyUpdateResult {
  playerDamage: number;
}

export function updateEnemies(
  enemies: Enemy[],
  map: WorldMap,
  playerX: number,
  playerY: number,
  dt: number,
  rng: () => number,
): EnemyUpdateResult {
  let playerDamage = 0;
  for (const e of enemies) {
    if (e.flash > 0) e.flash = Math.max(0, e.flash - dt);
    if (e.ai === "dead") {
      e.corpseT -= dt;
      continue;
    }
    e.attackCd = Math.max(0, e.attackCd - dt);
    const dx = playerX - e.x;
    const dy = playerY - e.y;
    const dist = Math.hypot(dx, dy) / TILE;
    const kind = e.kind;

    if (dist <= kind.aggroRange) {
      e.ai = dist <= kind.attackRange ? "attack" : "chase";
    } else if (e.ai !== "idle") {
      e.ai = "idle";
    }

    if (e.ai === "chase") {
      const len = Math.hypot(dx, dy) || 1;
      const step = kind.speed * dt;
      const nx = e.x + (dx / len) * step;
      const ny = e.y + (dy / len) * step;
      if (canStep(map, nx, ny, kind.radius * 0.6)) {
        e.x = nx;
        e.y = ny;
      } else if (canStep(map, nx, e.y, kind.radius * 0.6)) {
        e.x = nx;
      } else if (canStep(map, e.x, ny, kind.radius * 0.6)) {
        e.y = ny;
      }
    } else if (e.ai === "idle") {
      e.wanderT -= dt;
      if (e.wanderT <= 0) {
        e.wanderT = 1.2 + rng() * 2;
        const ang = rng() * Math.PI * 2;
        e.wanderDx = Math.cos(ang);
        e.wanderDy = Math.sin(ang);
      }
      const step = kind.speed * 0.35 * dt;
      const nx = e.x + e.wanderDx * step;
      const ny = e.y + e.wanderDy * step;
      if (canStep(map, nx, ny, kind.radius * 0.6)) {
        e.x = nx;
        e.y = ny;
      } else {
        e.wanderT = 0;
      }
    } else if (e.ai === "attack") {
      if (e.attackCd <= 0 && dist <= kind.attackRange + 0.15) {
        e.attackCd = kind.attackCooldown;
        const raw = kind.attack + kind.level * 0.8;
        const roll = 0.85 + rng() * 0.3;
        playerDamage += Math.max(1, Math.floor(raw * roll));
        e.flash = 0.12;
      }
    }
  }
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i]!;
    if (e.ai === "dead" && e.corpseT <= 0) enemies.splice(i, 1);
  }
  return { playerDamage };
}

export function killEnemy(e: Enemy): void {
  e.ai = "dead";
  e.hp = 0;
  e.corpseT = 1.4;
  e.flash = 0.2;
}

export function nearestEnemyInRange(
  enemies: Enemy[],
  px: number,
  py: number,
  rangeTiles: number,
): Enemy | null {
  let best: Enemy | null = null;
  let bestD = rangeTiles * TILE + 0.01;
  for (const e of enemies) {
    if (e.ai === "dead") continue;
    const d = Math.hypot(e.x - px, e.y - py);
    if (d <= bestD) {
      bestD = d;
      best = e;
    }
  }
  return best;
}

export function enemyAtCursor(
  enemies: Enemy[],
  worldX: number,
  worldY: number,
  maxDist = TILE * 0.75,
): Enemy | null {
  let best: Enemy | null = null;
  let bestD = maxDist;
  for (const e of enemies) {
    if (e.ai === "dead") continue;
    const d = Math.hypot(e.x - worldX, e.y - worldY);
    if (d <= bestD) {
      bestD = d;
      best = e;
    }
  }
  return best;
}

export function updateFloatTexts(texts: FloatText[], dt: number): void {
  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i]!;
    t.life -= dt;
    t.y += t.vy * dt;
    if (t.life <= 0) texts.splice(i, 1);
  }
}

export function updateProjectiles(projectiles: Projectile[], dt: number): void {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i]!;
    p.life -= dt;
    p.x += (p.tx - p.x) * Math.min(1, 14 * dt);
    p.y += (p.ty - p.y) * Math.min(1, 14 * dt);
    if (p.life <= 0) projectiles.splice(i, 1);
  }
}

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
    ctx.fillStyle = e.flash > 0 ? "#f0e8d0" : e.kind.color;
    ctx.beginPath();
    ctx.arc(sx, sy, e.kind.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = e.kind.colorDark;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const ratio = e.hp / e.kind.maxHp;
    ctx.fillStyle = "#1a1c16";
    ctx.fillRect(sx - 8, sy - e.kind.radius - 6, 16, 3);
    ctx.fillStyle = ratio > 0.35 ? "#c45c3e" : "#a03030";
    ctx.fillRect(sx - 8, sy - e.kind.radius - 6, 16 * ratio, 3);
  }
}

export function drawFloatTexts(
  ctx: CanvasRenderingContext2D,
  texts: FloatText[],
  originX: number,
  originY: number,
): void {
  ctx.textAlign = "center";
  ctx.font = "bold 12px Figtree, system-ui, sans-serif";
  for (const t of texts) {
    ctx.globalAlpha = Math.max(0, Math.min(1, t.life * 2));
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, Math.floor(t.x - originX), Math.floor(t.y - originY));
  }
  ctx.globalAlpha = 1;
}

export function drawProjectiles(
  ctx: CanvasRenderingContext2D,
  projectiles: Projectile[],
  originX: number,
  originY: number,
): void {
  for (const p of projectiles) {
    const sx = Math.floor(p.x - originX);
    const sy = Math.floor(p.y - originY);
    ctx.strokeStyle = p.color;
    ctx.fillStyle = p.color;
    ctx.lineWidth = p.style === "magic" ? 2.5 : 2;
    if (p.style === "magic") {
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const ang = Math.atan2(p.ty - p.y, p.tx - p.x);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx - Math.cos(ang) * 10, sy - Math.sin(ang) * 10);
      ctx.stroke();
    }
  }
}
