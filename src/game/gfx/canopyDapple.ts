/**
 * Soft dappled light and shadow freckles on the open floor under ashwood.
 * Drawn with the grove umbra, after that pool and before actors, lamps, and
 * the screen bloom. World-locked, no particle list — the same breeze periods
 * as grove leaf drift, held to a few pixels, plus the crown's own sway.
 * Sage stays under the bloom knee at full opacity, so this pass does not feed
 * the screen bloom. Leaf tips, lamps, and door spill keep that glow.
 * Wayfinding labels are drawn later on an opaque plate.
 * Canvas 2D only. Original Vale pixels — not CipSoft.
 */
import { TILE, type WorldMap } from "@/game/world";

type Speck = readonly [number, number, number, number];

/** Offsets from the tile origin, on the open ring beside the crown. */
const SLOTS: readonly [number, number][] = [
  [8, 36],
  [20, 42],
  [28, 48],
  [16, 50],
  [36, 36],
  [44, 44],
  [54, 18],
  [58, 28],
  [-22, 18],
  [-16, 30],
  [-14, 40],
  [-6, 46],
];

const LIGHT_SHAPES: readonly (readonly Speck[])[] = [
  [
    [0, 0, 2, 1],
    [2, 1, 1, 1],
    [-1, 1, 2, 1],
  ],
  [
    [0, 0, 1, 2],
    [1, 1, 2, 1],
    [0, 2, 1, 1],
  ],
  [
    [0, 0, 3, 1],
    [1, -1, 1, 1],
    [2, 1, 1, 1],
  ],
  [
    [-1, 0, 2, 1],
    [1, 1, 2, 1],
    [0, 2, 1, 1],
  ],
];

const SHADE_SHAPES: readonly (readonly Speck[])[] = [
  [
    [0, 0, 2, 2],
    [2, 1, 1, 1],
  ],
  [
    [0, 0, 3, 1],
    [1, 1, 2, 1],
  ],
  [
    [0, 1, 2, 1],
    [1, 0, 1, 2],
    [-1, 2, 2, 1],
  ],
  [
    [0, 0, 2, 1],
    [1, 1, 2, 2],
  ],
];

/** Sage light. Weighted luma stays ≤ 149, under the bloom knee of 158. */
const LIGHT_PIX = "136, 154, 144";
const LIGHT_SOFT = "112, 134, 122";
const SHADE = "5, 9, 6";

function hash2(tx: number, ty: number): number {
  let n = (Math.imul(tx, 374761393) + Math.imul(ty, 668265263)) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return (n ^ (n >>> 16)) >>> 0;
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

function groveNeighbors(map: WorldMap, tx: number, ty: number): number {
  let n = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      if (tileAt(map, tx + dx, ty + dy) === "stone") n++;
    }
  }
  return n;
}

/** Grass, dirt, and ashwood path. Plaza cobble, doors, and water stay out. */
function isFloor(kind: string | null): boolean {
  return kind === "grass" || kind === "grassAlt" || kind === "dirt" || kind === "path";
}

/**
 * Slow floor travel on the grove breeze, then the crown sway from the canopy pass
 * (sin 1.25 / 0.85) so a patch ticks with its leaves.
 */
function driftOf(timeSec: number, tx: number, ty: number, seed: number): { x: number; y: number } {
  const along = Math.sin(timeSec * 0.29 + seed) * 4.2 + Math.sin(timeSec * 0.07) * 2;
  const across = Math.sin(timeSec * 0.11 + seed * 1.3) * 1.8;
  const sway = Math.sin(timeSec * 1.25 + tx * 1.7 + ty * 0.55) * 2;
  const bob = Math.sin(timeSec * 0.85 + ty * 1.4 + tx * 0.3);
  return { x: Math.round(along + sway), y: Math.round(across + bob) };
}

function fillSoft(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  core: string,
  mid: string,
): void {
  const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, radius);
  g.addColorStop(0, core);
  g.addColorStop(0.55, mid);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
}

function fillSpecks(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  specks: readonly Speck[],
  color: string,
): void {
  ctx.fillStyle = color;
  for (let i = 0; i < specks.length; i++) {
    const s = specks[i]!;
    ctx.fillRect(cx + s[0], cy + s[1], s[2], s[3]);
  }
}

function paintSpot(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  wx: number,
  wy: number,
  radius: number,
  soft: string,
  mid: string,
  specks: readonly Speck[],
  speck: string,
): void {
  const tx = Math.floor(wx / TILE);
  const ty = Math.floor(wy / TILE);
  if (!isFloor(tileAt(map, tx, ty))) return;
  const sx = Math.floor(wx - originX);
  const sy = Math.floor(wy - originY);
  if (sx < -radius || sy < -radius || sx > viewW + radius || sy > viewH + radius) return;
  fillSoft(ctx, sx, sy, radius, soft, mid);
  fillSpecks(ctx, sx, sy, specks, speck);
}

/**
 * One light freckle and its south-east shadow, drifting together.
 * Dense groves dim the light so the umbra pool still owns the shade.
 */
function paintPair(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  timeSec: number,
  tx: number,
  ty: number,
  slotIndex: number,
  grove: number,
  shape: number,
): void {
  const slot = SLOTS[slotIndex % SLOTS.length]!;
  const seed = ((hash2(tx, ty) % 628) + slotIndex * 17) / 100;
  const drift = driftOf(timeSec, tx, ty, seed);
  const breath = 0.9 + 0.1 * Math.sin(timeSec * 0.23 + seed);
  const crowd = grove >= 4 ? 0.72 : grove >= 2 ? 0.86 : 1;
  const shadeBoost = grove >= 3 ? 1.15 : 1;
  const pulse = Math.sin(timeSec * 0.23 + seed) > 0.55 ? 1 : 0;
  const wx = tx * TILE + slot[0] + drift.x;
  const wy = ty * TILE + slot[1] + drift.y;
  const lightR = (grove === 0 ? 13 : 11) + (slotIndex % 3) + pulse;
  const shadeR = 9 + (slotIndex % 3) + (grove >= 3 ? 2 : 0);
  const lightA = 0.2 * crowd * breath;
  const shadeA = Math.min(0.32, 0.22 * shadeBoost * breath);
  const specksL = LIGHT_SHAPES[shape % LIGHT_SHAPES.length]!;
  const specksS = SHADE_SHAPES[shape % SHADE_SHAPES.length]!;

  paintSpot(
    ctx,
    map,
    originX,
    originY,
    viewW,
    viewH,
    wx + 6,
    wy + 4,
    shadeR,
    `rgba(${SHADE}, ${shadeA})`,
    `rgba(${SHADE}, ${shadeA * 0.42})`,
    specksS,
    `rgba(${SHADE}, ${Math.min(0.62, 0.5 * shadeBoost * breath)})`,
  );
  paintSpot(
    ctx,
    map,
    originX,
    originY,
    viewW,
    viewH,
    wx,
    wy,
    lightR,
    `rgba(${LIGHT_SOFT}, ${lightA})`,
    `rgba(${LIGHT_SOFT}, ${lightA * 0.4})`,
    specksL,
    `rgba(${LIGHT_PIX}, ${0.66 * crowd * breath})`,
  );
}

/** Floor dapples around playable ashwood. No-op off the overworld. */
export function drawCanopyDapple(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  timeSec: number,
): void {
  if (map.kind !== "overworld") return;
  const startTX = Math.max(0, Math.floor(originX / TILE) - 1);
  const startTY = Math.max(0, Math.floor(originY / TILE) - 1);
  const endTX = Math.min(map.width - 1, Math.ceil((originX + viewW) / TILE) + 1);
  const endTY = Math.min(map.height - 1, Math.ceil((originY + viewH) / TILE) + 1);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  for (let ty = startTY; ty <= endTY; ty++) {
    for (let tx = startTX; tx <= endTX; tx++) {
      if (!isCanopy(map, tx, ty)) continue;
      const h = hash2(tx, ty);
      const grove = groveNeighbors(map, tx, ty);
      const pairs = grove >= 3 ? 2 : 1;
      let second = (h >>> 8) % SLOTS.length;
      const first = h % SLOTS.length;
      if (second === first) second = (first + 5) % SLOTS.length;
      paintPair(ctx, map, originX, originY, viewW, viewH, timeSec, tx, ty, first, grove, h & 3);
      if (pairs > 1) {
        paintPair(
          ctx,
          map,
          originX,
          originY,
          viewW,
          viewH,
          timeSec,
          tx,
          ty,
          second,
          grove,
          (h >>> 4) & 3,
        );
      }
    }
  }
  ctx.restore();
}
