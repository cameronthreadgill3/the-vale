/**
 * Lightweight atmosphere overlays — vignette, ashwood umbra/silver, hollow torch spots,
 * plus a premium depth/motion/light layer (parallax haze, motes, warm/cool zones).
 * Plaza lanterns and ashwood path lamps share one warm pulse, kept under labels.
 */
import { TILE, type WorldMap } from "@/game/world";
import { propsOnContinent } from "@/game/world/town";
import { fountainFrameAt, tileVariantAt } from "@/game/gfx/tiles";
import { drawSoftShadow } from "@/game/gfx/canvasUtil";
import { drawPathLampGlow, warmFlamePulse } from "@/game/gfx/lampFlicker";
import type { DepthItem } from "@/game/gfx/depth";

/** Soft screen vignette; alpha kept modest so HUD / labels stay clear. */
export function drawVignette(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  viewH: number,
  strength = 0.24,
): void {
  const cx = viewW / 2;
  const cy = viewH / 2;
  const r = Math.hypot(cx, cy) * 0.94;
  const g = ctx.createRadialGradient(cx, cy, r * 0.42, cx, cy, r);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.72, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(10,14,8,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, viewW, viewH);
}

/** Ground umbra under ashwood plus a faint north silver rim — overworld only. */
function stoneNeighbors(map: WorldMap, tx: number, ty: number): number {
  let n = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const x = tx + dx;
      const y = ty + dy;
      if (x < 0 || y < 0 || x >= map.width || y >= map.height) continue;
      if (map.tiles[y]![x] === "stone") n++;
    }
  }
  return n;
}

export function drawAshwoodTint(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
): void {
  if (map.kind !== "overworld") return;
  const startTX = Math.max(0, Math.floor(originX / TILE) - 1);
  const startTY = Math.max(0, Math.floor(originY / TILE) - 1);
  const endTX = Math.min(map.width - 1, Math.ceil((originX + viewW) / TILE) + 1);
  const endTY = Math.min(map.height - 1, Math.ceil((originY + viewH) / TILE) + 1);
  ctx.save();
  for (let ty = startTY; ty <= endTY; ty++) {
    for (let tx = startTX; tx <= endTX; tx++) {
      if (map.tiles[ty]![tx] !== "stone") continue;
      const sx = Math.floor(tx * TILE - originX);
      const sy = Math.floor(ty * TILE - originY);
      const grove = stoneNeighbors(map, tx, ty);
      // Local pooling — open grass stays brighter; groves sit lower without a muddy wash.
      const core = 0.2 + Math.min(0.08, grove * 0.012);
      const radius = 34 + grove * 3;
      const umbra = ctx.createRadialGradient(sx + 16, sy + 24, 3, sx + 18, sy + 28, radius);
      umbra.addColorStop(0, `rgba(8, 14, 8, ${core})`);
      umbra.addColorStop(0.52, `rgba(12, 20, 10, ${core * 0.42})`);
      umbra.addColorStop(1, "transparent");
      ctx.fillStyle = umbra;
      ctx.fillRect(sx - 18, sy - 2, TILE + 40, TILE + 36);
      if (grove >= 3) {
        const pool = ctx.createRadialGradient(sx + 18, sy + 30, 6, sx + 18, sy + 34, 48);
        pool.addColorStop(0, "rgba(8, 14, 8, 0.1)");
        pool.addColorStop(1, "transparent");
        ctx.fillStyle = pool;
        ctx.fillRect(sx - 20, sy + 8, TILE + 44, TILE + 28);
      }
      ctx.globalAlpha = 0.055;
      const silver = ctx.createRadialGradient(sx + 16, sy + 4, 3, sx + 16, sy + 4, 34);
      silver.addColorStop(0, "#d4e4d4");
      silver.addColorStop(1, "transparent");
      ctx.fillStyle = silver;
      ctx.fillRect(sx - 10, sy - 18, TILE + 20, TILE + 16);
      ctx.globalAlpha = 1;
      // Flat crown contact under the leaves, south of the silver rim.
      // Weaker in dense groves so the round umbra still does the pooling.
      const crown = Math.max(0.1, 0.2 - grove * 0.012);
      drawSoftShadow(ctx, sx + 18, sy + 16, 20 + Math.min(4, grove), 7, crown);
    }
  }
  ctx.restore();
}

function walkable(map: WorldMap, tx: number, ty: number): boolean {
  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return false;
  const k = map.tiles[ty]![tx];
  return k !== "stone" && k !== "water";
}

/** Warm torch spots in hollows (plus player light already in darkness pass). */
export function drawHollowTorchSpots(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  player: { x: number; y: number },
  timeSec: number,
): void {
  if (map.kind !== "hollow" && map.darkness <= 0) return;
  const spots: { x: number; y: number; wall: boolean }[] = [
    { x: map.spawn.x * TILE, y: map.spawn.y * TILE, wall: false },
  ];
  const startTX = Math.max(0, Math.floor(originX / TILE));
  const startTY = Math.max(0, Math.floor(originY / TILE));
  const endTX = Math.min(map.width - 1, Math.ceil((originX + viewW) / TILE));
  const endTY = Math.min(map.height - 1, Math.ceil((originY + viewH) / TILE));
  let found = 0;
  for (let ty = startTY; ty <= endTY && found < 10; ty++) {
    for (let tx = startTX; tx <= endTX && found < 10; tx++) {
      const k = map.tiles[ty]![tx];
      const wallTorch =
        k === "stone" &&
        tileVariantAt(tx, ty) % 3 === 0 &&
        (walkable(map, tx + 1, ty) ||
          walkable(map, tx - 1, ty) ||
          walkable(map, tx, ty + 1) ||
          walkable(map, tx, ty - 1));
      if (k === "hollow" || k === "exit" || (k === "path" && (tx + ty) % 11 === 0) || wallTorch) {
        spots.push({
          x: (tx + 0.5) * TILE,
          y: (ty + 0.4) * TILE,
          wall: Boolean(wallTorch),
        });
        found++;
      }
    }
  }
  spots.push({ x: player.x, y: player.y, wall: false });
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < spots.length; i++) {
    const s = spots[i]!;
    const sx = Math.floor(s.x - originX);
    const sy = Math.floor(s.y - originY);
    const flicker = warmFlamePulse(timeSec, i);
    const isPlayer = i === spots.length - 1;
    const r = (isPlayer ? 74 : s.wall ? 56 : 48) * flicker;
    const g = ctx.createRadialGradient(sx, sy, 2, sx, sy, r);
    g.addColorStop(0, `rgba(255,190,90,${0.26 * flicker})`);
    g.addColorStop(0.35, `rgba(220,110,32,${0.1 * flicker})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  drawHollowDungeonMarkers(ctx, map, originX, originY);
}

/** Clearer surface exit + deepest-chamber mark (no new tile kinds). */
export function drawHollowDungeonMarkers(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  originX: number,
  originY: number,
): void {
  if (map.kind !== "hollow") return;
  ctx.save();
  if (map.exit) {
    const ex = Math.floor((map.exit.x + 0.5) * TILE - originX);
    const ey = Math.floor((map.exit.y + 0.5) * TILE - originY);
    ctx.strokeStyle = "rgba(240, 208, 96, 0.82)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ex, ey, 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(240, 208, 96, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ex, ey, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = 'bold 10px "IBM Plex Mono", ui-monospace, monospace';
    ctx.textAlign = "center";
    ctx.fillStyle = "#f0d060";
    ctx.fillText("↑ Surface", ex, ey - 22);
  }
  if (map.bossChamber) {
    const bx = Math.floor((map.bossChamber.x + 0.5) * TILE - originX);
    const by = Math.floor((map.bossChamber.y + 0.5) * TILE - originY);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const glow = ctx.createRadialGradient(bx, by + 6, 2, bx, by + 6, 38);
    glow.addColorStop(0, "rgba(255,140,50,0.22)");
    glow.addColorStop(0.45, "rgba(150,70,180,0.10)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(bx, by + 6, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "rgba(224, 112, 48, 0.72)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.arc(bx, by, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(170, 120, 220, 0.42)";
    ctx.beginPath();
    ctx.arc(bx, by, 28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = '9px "IBM Plex Mono", ui-monospace, monospace';
    ctx.textAlign = "center";
    ctx.fillStyle = "#e8c8a0";
    ctx.fillText("Ashveil chamber", bx, by - 30);
  }
  ctx.restore();
}

type HazeBlob = { x: number; y: number; r: number; warm: boolean };

/** Stable far-field puffs. They scroll slower than the ground so the map has a back layer. */
const HAZE: HazeBlob[] = Array.from({ length: 12 }, (_, i) => {
  let n = (i * 374761393 + 668265263) | 0;
  n = (n ^ (n >>> 13)) * 1274126177;
  n = (n ^ (n >>> 16)) >>> 0;
  return {
    x: 80 + (n % 1400),
    y: 60 + ((n >>> 11) % 1000),
    r: 110 + (n % 70),
    warm: (n & 3) === 0,
  };
});

/**
 * Far haze locked more to the camera than the ground (parallax ~0.4).
 * Sits under props and actors so roofs and creatures read in front of it.
 */
export function drawParallaxHaze(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  timeSec: number,
): void {
  const p = 0.4;
  const camX = originX + viewW / 2;
  const camY = originY + viewH / 2;
  const hollow = map.kind === "hollow";
  ctx.save();
  for (let i = 0; i < HAZE.length; i++) {
    const h = HAZE[i]!;
    const drift = Math.sin(timeSec * 0.18 + i) * 14;
    const sx = viewW / 2 + (h.x + drift - camX) * p;
    const sy = viewH / 2 + (h.y - camY) * p;
    if (sx < -h.r || sy < -h.r || sx > viewW + h.r || sy > viewH + h.r) continue;
    const g = ctx.createRadialGradient(sx, sy, h.r * 0.15, sx, sy, h.r);
    if (hollow) {
      g.addColorStop(0, "rgba(120, 150, 170, 0.07)");
    } else if (h.warm) {
      g.addColorStop(0, "rgba(220, 180, 120, 0.055)");
    } else {
      g.addColorStop(0, "rgba(160, 190, 200, 0.08)");
    }
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(sx - h.r, sy - h.r, h.r * 2, h.r * 2);
  }
  ctx.restore();
}

function tileKind(map: WorldMap, tx: number, ty: number): string | null {
  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return null;
  return map.tiles[ty]![tx] ?? null;
}

/** Pixel-snapped travel in [0, span). */
function drift(timeSec: number, speed: number, seed: number, span: number): number {
  const s = Math.max(1, span);
  const n = Math.floor(timeSec * speed + seed);
  return ((n % s) + s) % s;
}

/**
 * Soft highlight on a water tile. Two short streaks plus a rare sparkle,
 * and a foam glint where the tile meets land. Low alpha, inside the tile.
 */
function drawWaterShimmer(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  timeSec: number,
): void {
  const frame = fountainFrameAt(timeSec);
  const span = TILE - 12;
  for (let i = 0; i < 2; i++) {
    const len = 4 + ((tx + i + frame) % 3);
    const col = drift(timeSec, i === 0 ? 8 : 5, tx * 9 + ty * 4 + i * 13, span - len);
    const row = 4 + ((tx * 5 + ty * 3 + frame * 4 + i * 11) % (TILE - 10));
    ctx.fillStyle = i === 0 ? "rgba(214, 238, 255, 0.26)" : "rgba(176, 208, 224, 0.16)";
    ctx.fillRect(sx + 3 + col, sy + row, len, 1);
  }
  if (((Math.floor(timeSec * 3) + tx * 3 + ty) % 5) === frame) {
    const sparkX = 4 + ((tx * 7 + frame * 5) % 22);
    const sparkY = 4 + ((ty * 5 + frame * 3) % 22);
    ctx.fillStyle = "rgba(236, 248, 255, 0.38)";
    ctx.fillRect(sx + sparkX, sy + sparkY, 1, 1);
  }
  const shores: { dx: number; dy: number }[] = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];
  ctx.fillStyle = "rgba(220, 240, 248, 0.24)";
  for (let i = 0; i < shores.length; i++) {
    const e = shores[i]!;
    const n = tileKind(map, tx + e.dx, ty + e.dy);
    if (n === null || n === "water") continue;
    const slide = drift(timeSec, 6, tx * 3 + ty + i * 7, TILE - 10);
    if (e.dy !== 0) {
      const y = e.dy < 0 ? 1 : TILE - 2;
      ctx.fillRect(sx + 2 + slide, sy + y, 5, 1);
    } else {
      const x = e.dx < 0 ? 1 : TILE - 2;
      ctx.fillRect(sx + x, sy + 2 + slide, 1, 5);
    }
  }
}

/**
 * Ripple and sparkle on the plaza fountain basin only.
 * The wayfinding label sits above the tile, so this stays in the pool (y ≥ 18).
 */
function drawFountainBasinShimmer(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  timeSec: number,
): void {
  const frame = fountainFrameAt(timeSec);
  const bands = [
    { x: 8, y: 19 + (frame % 3), w: 7, color: "rgba(232, 246, 255, 0.4)" },
    { x: 17, y: 23 + ((frame + 1) % 3), w: 6, color: "rgba(200, 228, 240, 0.28)" },
  ];
  for (const b of bands) {
    ctx.fillStyle = b.color;
    ctx.fillRect(sx + b.x, sy + b.y, b.w, 1);
  }
  const sparks: [number, number][] = [
    [9 + (frame % 2), 21],
    [21 - (frame % 2), 22],
    [12 + (frame % 3), 25],
  ];
  ctx.fillStyle = "rgba(255, 252, 245, 0.45)";
  for (const [x, y] of sparks) {
    if (((x + y + frame) & 1) === 0) ctx.fillRect(sx + x, sy + y, 1, 1);
  }
}

/**
 * Cool water, a warm fountain pool, lantern glow, and continuous shimmer
 * on top of the baked water/fountain frames.
 */
export function drawSurfaceLight(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  timeSec: number,
): void {
  const startTX = Math.max(0, Math.floor(originX / TILE) - 1);
  const startTY = Math.max(0, Math.floor(originY / TILE) - 1);
  const endTX = Math.min(map.width - 1, Math.ceil((originX + viewW) / TILE) + 1);
  const endTY = Math.min(map.height - 1, Math.ceil((originY + viewH) / TILE) + 1);
  ctx.save();
  for (let ty = startTY; ty <= endTY; ty++) {
    for (let tx = startTX; tx <= endTX; tx++) {
      const kind = map.tiles[ty]![tx];
      const sx = Math.floor(tx * TILE - originX);
      const sy = Math.floor(ty * TILE - originY);
      if (kind === "water") {
        ctx.fillStyle = "rgba(24, 52, 74, 0.1)";
        ctx.fillRect(sx, sy, TILE, TILE);
        drawWaterShimmer(ctx, map, sx, sy, tx, ty, timeSec);
      } else if (kind === "flower") {
        const fountain = map.spawn.x === tx && map.spawn.y === ty;
        if (fountain) {
          const pulse = 0.82 + 0.18 * Math.sin(timeSec * 2.4);
          const g = ctx.createRadialGradient(sx + 16, sy + 18, 2, sx + 16, sy + 18, 28);
          g.addColorStop(0, `rgba(255, 220, 160, ${0.16 * pulse})`);
          g.addColorStop(1, "transparent");
          ctx.fillStyle = g;
          ctx.fillRect(sx - 8, sy - 4, TILE + 16, TILE + 12);
          drawFountainBasinShimmer(ctx, sx, sy, timeSec);
          for (let i = 0; i < 3; i++) {
            const t = (timeSec * 0.85 + i * 0.33) % 1;
            ctx.fillStyle = `rgba(240, 248, 255, ${0.55 * (1 - t)})`;
            ctx.fillRect(sx + 11 + i * 4, Math.floor(sy + 18 - t * 16), 2, 2);
          }
        } else {
          const tw = 0.2 + 0.35 * (0.5 + 0.5 * Math.sin(timeSec * 3.2 + tx * 1.7 + ty));
          ctx.fillStyle = `rgba(255, 220, 150, ${tw})`;
          ctx.fillRect(sx + 6 + (tx % 6), sy + 8 + (ty % 5), 2, 2);
        }
      }
    }
  }
  if (map.kind === "overworld") {
    for (const prop of propsOnContinent(map.continentId)) {
      if (prop.kind !== "lantern") continue;
      const lx = Math.floor(prop.x * TILE + 16 - originX);
      const ly = Math.floor(prop.y * TILE + 10 - originY);
      if (lx < -40 || ly < -40 || lx > viewW + 40 || ly > viewH + 40) continue;
      const phase = prop.x * 0.73 + prop.y * 0.41;
      const pulse = warmFlamePulse(timeSec, phase);
      const g = ctx.createRadialGradient(lx, ly, 2, lx, ly, 40);
      g.addColorStop(0, `rgba(255, 176, 80, ${0.2 * pulse})`);
      g.addColorStop(0.45, `rgba(220, 120, 40, ${0.07 * pulse})`);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(lx - 40, ly - 40, 80, 80);
    }
    drawPathLampGlow(ctx, map, originX, originY, viewW, viewH, timeSec);
  }
  ctx.restore();
}

/**
 * Screen-space key from the north-west and a cool fill opposite.
 * Drawn after actors and before labels so chrome stays untinted.
 */
export function drawKeyLight(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  viewH: number,
): void {
  ctx.save();
  const g = ctx.createLinearGradient(0, 0, viewW, viewH);
  g.addColorStop(0, "rgba(255, 214, 164, 0.075)");
  g.addColorStop(0.42, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(48, 78, 98, 0.08)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, viewW, viewH);
  ctx.restore();
}

type MoteKind = "leaf" | "dust" | "ember";

type Mote = {
  x: number;
  y: number;
  h: number;
  vx: number;
  vy: number;
  kind: MoteKind;
  life: number;
  seed: number;
};

const MOTES: Mote[] = [];
const MOTE_COUNT = 40;
let moteRealm: string | null = null;

function rand(): number {
  return Math.random();
}

function respawnMote(
  m: Mote,
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
): void {
  m.x = originX - 24 + rand() * (viewW + 48);
  m.y = originY - 24 + rand() * (viewH + 48);
  m.life = 3.5 + rand() * 6;
  m.seed = rand() * 20;
  const tx = Math.floor(m.x / TILE);
  const ty = Math.floor(m.y / TILE);
  const under = tileKind(map, tx, ty);
  if (map.kind === "hollow") {
    m.kind = rand() < 0.28 ? "ember" : "dust";
    m.h = 8 + rand() * 16;
    m.vx = -4 + rand() * 8;
    m.vy = -6 + rand() * 4;
  } else if (under === "stone" || rand() < 0.42) {
    m.kind = "leaf";
    m.h = 12 + rand() * 20;
    m.vx = -8 + rand() * 18;
    m.vy = 10 + rand() * 16;
  } else {
    m.kind = "dust";
    m.h = 8 + rand() * 24;
    m.vx = -3 + rand() * 6;
    m.vy = -5 + rand() * 4;
  }
}

/** Drift a small pool of leaves, dust, and cave embers. Call once per frame. */
export function tickMotes(
  dt: number,
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
): void {
  const realm = `${map.kind}:${map.continentId}`;
  if (moteRealm !== realm) {
    moteRealm = realm;
    for (const m of MOTES) m.life = 0;
  }
  while (MOTES.length < MOTE_COUNT) {
    const m: Mote = { x: 0, y: 0, h: 0, vx: 0, vy: 0, kind: "dust", life: 0, seed: 0 };
    respawnMote(m, map, originX, originY, viewW, viewH);
    MOTES.push(m);
  }
  const margin = 64;
  for (const m of MOTES) {
    m.life -= dt;
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    if (m.kind === "leaf") m.h = Math.max(3, m.h - dt * 4);
    else m.h += Math.sin(m.seed + m.life * 2) * dt * 6;
    const outside =
      m.x < originX - margin ||
      m.y < originY - margin ||
      m.x > originX + viewW + margin ||
      m.y > originY + viewH + margin;
    if (m.life <= 0 || outside) respawnMote(m, map, originX, originY, viewW, viewH);
  }
}

/** Y-sorted motes. The speck stays on the ground; the pixel rides above it. */
export function collectMoteDepthItems(
  originX: number,
  originY: number,
  timeSec: number,
): DepthItem[] {
  const items: DepthItem[] = [];
  for (const m of MOTES) {
    const sx = Math.floor(m.x - originX);
    const sy = Math.floor(m.y - originY);
    const h = Math.round(m.h);
    items.push({
      y: m.y,
      x: m.x,
      draw: (ctx) => {
        ctx.fillStyle = "rgba(8, 10, 6, 0.28)";
        ctx.fillRect(sx + 1, sy + 1, 2, 1);
        const py = sy - h;
        if (m.kind === "leaf") {
          const tilt = Math.sin(timeSec * 3 + m.seed) > 0 ? 0 : 1;
          ctx.fillStyle = "rgba(78, 110, 52, 0.9)";
          ctx.fillRect(sx - tilt, py, 3, 2);
          ctx.fillStyle = "rgba(186, 206, 120, 0.75)";
          ctx.fillRect(sx, py, 1, 1);
        } else if (m.kind === "ember") {
          const a = 0.35 + 0.4 * (0.5 + 0.5 * Math.sin(timeSec * 6 + m.seed));
          ctx.fillStyle = `rgba(255, 170, 70, ${a})`;
          ctx.fillRect(sx, py, 2, 2);
        } else {
          const a = 0.25 + 0.4 * (0.5 + 0.5 * Math.sin(timeSec * 4 + m.seed));
          ctx.fillStyle = `rgba(230, 222, 196, ${a})`;
          ctx.fillRect(sx, py, 1, 1);
        }
      },
    });
  }
  return items;
}
