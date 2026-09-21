/**
 * Grove-local leaf, ash, and needle drift.
 * World-locked and sparse so it hangs under ashwood and sorts with the canopy.
 * Screen-space dust and bloom stay in viewOverlay; the general mote pool stays
 * in atmosphere.ts. This pass does not share either list.
 * Original Vale pixels only — not CipSoft.
 * Alpha stays low; wayfinding is drawn later and stays readable.
 */
import { TILE, type WorldMap } from "@/game/world";
import type { DepthItem } from "@/game/gfx/depth";

type DriftKind = "leaf" | "ash" | "needle";

type Drift = {
  x: number;
  y: number;
  h: number;
  vx: number;
  vy: number;
  kind: DriftKind;
  life: number;
  maxLife: number;
  seed: number;
  active: boolean;
};

type Anchor = { x: number; y: number };

const DRIFT_MAX = 18;
const DRIFTS: Drift[] = [];
const ANCHORS: Anchor[] = [];

let realm = "";
let anchorCamX = Number.NaN;
let anchorCamY = Number.NaN;

function rand(): number {
  return Math.random();
}

function tileAt(map: WorldMap, tx: number, ty: number): string | null {
  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return null;
  return map.tiles[ty]![tx] ?? null;
}

/** Playable ashwood. The map frame is a solid stone ring, not a grove. */
function isCanopy(map: WorldMap, tx: number, ty: number): boolean {
  if (tx <= 0 || ty <= 0 || tx >= map.width - 1 || ty >= map.height - 1) return false;
  return tileAt(map, tx, ty) === "stone";
}

/** Canopy with a canopy neighbor — grove air, not a lone trunk. */
function inGrove(map: WorldMap, tx: number, ty: number): boolean {
  if (!isCanopy(map, tx, ty)) return false;
  return (
    isCanopy(map, tx + 1, ty) ||
    isCanopy(map, tx - 1, ty) ||
    isCanopy(map, tx, ty + 1) ||
    isCanopy(map, tx, ty - 1)
  );
}

function refreshAnchors(
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
): void {
  ANCHORS.length = 0;
  const startTX = Math.max(0, Math.floor(originX / TILE) - 1);
  const startTY = Math.max(0, Math.floor(originY / TILE) - 1);
  const endTX = Math.min(map.width - 1, Math.ceil((originX + viewW) / TILE) + 1);
  const endTY = Math.min(map.height - 1, Math.ceil((originY + viewH) / TILE) + 1);
  const hits: Anchor[] = [];
  for (let ty = startTY; ty <= endTY; ty++) {
    for (let tx = startTX; tx <= endTX; tx++) {
      if (!inGrove(map, tx, ty)) continue;
      hits.push({ x: (tx + 0.5) * TILE, y: (ty + 0.62) * TILE });
    }
  }
  const step = Math.max(1, Math.ceil(hits.length / 24));
  for (let i = 0; i < hits.length; i += step) ANCHORS.push(hits[i]!);
  anchorCamX = originX;
  anchorCamY = originY;
}

function ensurePool(): void {
  while (DRIFTS.length < DRIFT_MAX) {
    DRIFTS.push({
      x: 0,
      y: 0,
      h: 0,
      vx: 0,
      vy: 0,
      kind: "leaf",
      life: 0,
      maxLife: 1,
      seed: rand() * 20,
      active: false,
    });
  }
}

function activeCount(): number {
  if (ANCHORS.length === 0) return 0;
  return Math.min(DRIFT_MAX, 2 + ANCHORS.length);
}

function respawn(m: Drift): void {
  const a = ANCHORS[(rand() * ANCHORS.length) | 0];
  if (!a) {
    m.active = false;
    m.life = 0;
    return;
  }
  const roll = rand();
  const kind: DriftKind = roll < 0.4 ? "leaf" : roll < 0.75 ? "ash" : "needle";
  m.kind = kind;
  m.x = a.x + (rand() - 0.35) * 26;
  m.y = a.y + (rand() - 0.45) * 18;
  m.seed = rand() * 20;
  m.active = true;
  if (kind === "leaf") {
    m.h = 16 + rand() * 16;
    m.vx = -4 + rand() * 8;
    m.vy = 6 + rand() * 7;
    m.maxLife = 5 + rand() * 4;
  } else if (kind === "ash") {
    m.h = 12 + rand() * 16;
    m.vx = -2 + rand() * 6;
    m.vy = 2.5 + rand() * 4;
    m.maxLife = 6.5 + rand() * 4.5;
  } else {
    m.h = 10 + rand() * 12;
    m.vx = -2 + rand() * 4;
    m.vy = 12 + rand() * 8;
    m.maxLife = 3 + rand() * 2.5;
  }
  m.life = m.maxLife;
}

function windAt(timeSec: number): number {
  return 5 + Math.sin(timeSec * 0.29) * 9 + Math.sin(timeSec * 0.07) * 3;
}

/** Advance grove drift. No-op off the overworld so hollows keep their own air. */
export function tickAshDrift(
  dt: number,
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  timeSec: number,
): void {
  ensurePool();
  if (map.kind !== "overworld") {
    realm = "";
    anchorCamX = Number.NaN;
    for (const m of DRIFTS) m.active = false;
    return;
  }
  const nextRealm = map.continentId;
  const jumped =
    Number.isNaN(anchorCamX) ||
    Math.abs(originX - anchorCamX) > 48 ||
    Math.abs(originY - anchorCamY) > 48;
  if (realm !== nextRealm || jumped) {
    if (realm !== nextRealm) {
      for (const m of DRIFTS) m.active = false;
    }
    realm = nextRealm;
    refreshAnchors(map, originX, originY, viewW, viewH);
  }

  const step = Math.max(0, Math.min(0.05, dt));
  const n = activeCount();
  const wind = windAt(timeSec);
  const margin = 56;
  for (let i = 0; i < DRIFTS.length; i++) {
    const m = DRIFTS[i]!;
    if (i >= n) {
      m.active = false;
      continue;
    }
    if (!m.active || m.life <= 0) {
      respawn(m);
      continue;
    }
    m.life -= step;
    const gust = 0.85 + 0.15 * Math.sin(timeSec * 0.29 + m.seed);
    m.x += (m.vx + wind) * step;
    m.y += m.vy * gust * step;
    if (m.kind === "leaf") {
      m.h += Math.sin(timeSec * 2.1 + m.seed) * step * 9;
      m.h = Math.max(6, Math.min(34, m.h));
    } else if (m.kind === "ash") {
      m.h += Math.sin(timeSec * 1.3 + m.seed) * step * 4;
      m.h = Math.max(4, Math.min(30, m.h));
    } else {
      m.h = Math.max(2, m.h - step * 5);
    }
    const outside =
      m.x < originX - margin ||
      m.y < originY - margin ||
      m.x > originX + viewW + margin ||
      m.y > originY + viewH + margin;
    if (m.life <= 0 || outside) respawn(m);
  }
}

function fadeOf(m: Drift): number {
  const inn = Math.min(1, (m.maxLife - m.life) / 0.45);
  const out = Math.min(1, m.life / 0.7);
  return Math.max(0, Math.min(inn, out));
}

function drawDrift(
  ctx: CanvasRenderingContext2D,
  m: Drift,
  sx: number,
  sy: number,
  timeSec: number,
): void {
  const fade = fadeOf(m);
  if (fade < 0.04) return;
  const py = sy - Math.round(m.h);
  ctx.fillStyle = `rgba(8, 10, 6, ${0.14 * fade})`;
  ctx.fillRect(sx + 1, sy + 1, 2, 1);

  if (m.kind === "leaf") {
    const wobble = Math.sin(timeSec * 2.6 + m.seed);
    const tilt = wobble > 0 ? 0 : 1;
    ctx.fillStyle = `rgba(58, 74, 40, ${0.42 * fade})`;
    ctx.fillRect(sx + tilt, py + 2, 1, 1);
    ctx.fillStyle = `rgba(92, 124, 68, ${0.58 * fade})`;
    ctx.fillRect(sx + tilt, py, 3, 1);
    ctx.fillStyle = `rgba(62, 86, 46, ${0.5 * fade})`;
    ctx.fillRect(sx + 1 - tilt, py + 1, 2, 1);
    // One bright tip, only on the turn, so the existing bloom can lift it.
    if (wobble > 0.72) {
      ctx.fillStyle = `rgba(228, 242, 220, ${0.92 * fade})`;
      ctx.fillRect(sx + 2 + tilt, py, 1, 1);
    }
    return;
  }

  if (m.kind === "ash") {
    ctx.fillStyle = `rgba(148, 142, 130, ${0.38 * fade})`;
    ctx.fillRect(sx, py, 2, 1);
    ctx.fillStyle = `rgba(86, 82, 74, ${0.32 * fade})`;
    ctx.fillRect(sx, py, 1, 1);
    if (Math.sin(timeSec * 1.35 + m.seed) > 0.86) {
      ctx.fillStyle = `rgba(236, 228, 210, ${0.88 * fade})`;
      ctx.fillRect(sx + 1, py, 1, 1);
    }
    return;
  }

  const lean = Math.sin(timeSec * 3.1 + m.seed) > 0 ? 1 : 0;
  ctx.fillStyle = `rgba(48, 62, 34, ${0.58 * fade})`;
  ctx.fillRect(sx, py, 1, 1);
  ctx.fillRect(sx + lean, py + 1, 1, 2);
  ctx.fillStyle = `rgba(168, 186, 140, ${0.36 * fade})`;
  ctx.fillRect(sx, py, 1, 1);
}

/** Y-sorted grove drift. Ground speck stays put; the pixel rides above it. */
export function collectAshDriftDepthItems(
  originX: number,
  originY: number,
  timeSec: number,
): DepthItem[] {
  const items: DepthItem[] = [];
  for (const m of DRIFTS) {
    if (!m.active || m.life <= 0) continue;
    const sx = Math.floor(m.x - originX);
    const sy = Math.floor(m.y - originY);
    items.push({
      y: m.y,
      x: m.x,
      draw: (ctx) => drawDrift(ctx, m, sx, sy, timeSec),
    });
  }
  return items;
}
