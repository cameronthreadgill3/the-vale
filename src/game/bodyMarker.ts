/** Session-only player death bones — temporary, procedural, original Vale art. */

import type { ContinentId } from "@/game/continents";
import { TILE, type WorldMap } from "@/game/world";
import { makeCanvas, ctx2d, px, drawSoftShadow } from "@/game/gfx/canvasUtil";
import type { DepthItem } from "@/game/gfx/depth";

/** How long the corpse stain stays after death (real time, including off-map). */
export const BODY_MARKER_FADE_SEC = 40;
/** Walk this close to count as finding the body. */
export const BODY_MARKER_APPROACH_TILES = 1.55;
/** After finding it, walk this far to clear (walkaway). */
export const BODY_MARKER_LEAVE_TILES = 3.2;
/** Brief pause on the death tile before continent spawn remount. */
export const DEATH_KICK_DELAY_MS = 480;

export interface BodyMarkerSite {
  continentId: ContinentId;
  hollowIndex: number | null;
  x: number;
  y: number;
}

type LiveMarker = BodyMarkerSite & {
  bornAt: number;
  seen: boolean;
};

let live: LiveMarker | null = null;
let sheet: HTMLCanvasElement | OffscreenCanvas | null = null;

const SHEET_W = 18;
const SHEET_H = 12;

export function placeBodyMarker(site: BodyMarkerSite, now = performance.now()): void {
  live = { ...site, bornAt: now, seen: false };
}

export function clearBodyMarker(): void {
  live = null;
}

export function getBodyMarker(): LiveMarker | null {
  return live;
}

function markerMatchesMap(map: WorldMap, marker: LiveMarker): boolean {
  return (
    marker.continentId === map.continentId &&
    marker.hollowIndex === map.hollowIndex
  );
}

function alphaFor(now: number, bornAt: number): number {
  const age = (now - bornAt) / 1000;
  if (age >= BODY_MARKER_FADE_SEC) return 0;
  const hold = BODY_MARKER_FADE_SEC * 0.55;
  if (age <= hold) return 0.92;
  return 0.92 * (1 - (age - hold) / (BODY_MARKER_FADE_SEC - hold));
}

/** Fade out, or clear once the walker finds the tile and leaves it. */
export function tickBodyMarker(
  map: WorldMap,
  player: { x: number; y: number },
  now = performance.now(),
): void {
  if (!live) return;
  if ((now - live.bornAt) / 1000 >= BODY_MARKER_FADE_SEC) {
    live = null;
    return;
  }
  if (!markerMatchesMap(map, live)) return;
  const dist = Math.hypot(player.x - live.x, player.y - live.y) / TILE;
  if (dist <= BODY_MARKER_APPROACH_TILES) live.seen = true;
  else if (live.seen && dist > BODY_MARKER_LEAVE_TILES) live = null;
}

function bonesSheet(): HTMLCanvasElement | OffscreenCanvas {
  if (sheet) return sheet;
  const c = makeCanvas(SHEET_W, SHEET_H);
  const g = ctx2d(c);
  const out = "#1c1a16";
  const dark = "#5a5448";
  const bone = "#d4ccb4";
  const lite = "#eee8d4";

  // Crossed femurs (pixel, not CipSoft).
  const boneA: Array<[number, number]> = [
    [1, 2], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8],
    [12, 3], [13, 2], [14, 2], [15, 2],
  ];
  const boneB: Array<[number, number]> = [
    [15, 8], [14, 8], [13, 7], [12, 6], [11, 5], [10, 4], [9, 4],
    [3, 8], [2, 8], [1, 8], [2, 7],
  ];
  for (const [x, y] of [...boneA, ...boneB]) {
    px(g, x, y + 1, out, 2, 2);
  }
  for (const [x, y] of boneA) px(g, x, y, dark, 2, 2);
  for (const [x, y] of boneB) px(g, x, y, dark, 2, 2);
  for (const [x, y] of boneA) px(g, x, y, bone);
  for (const [x, y] of boneB) px(g, x, y, bone);
  px(g, 2, 2, lite);
  px(g, 14, 2, lite);
  px(g, 2, 8, lite);
  px(g, 14, 8, lite);

  // Small skull at the crossing.
  px(g, 7, 3, out, 5, 5);
  px(g, 8, 3, bone, 3, 4);
  px(g, 8, 4, lite, 3, 1);
  px(g, 8, 5, "#2a2420");
  px(g, 10, 5, "#2a2420");
  px(g, 9, 6, dark);

  sheet = c;
  return c;
}

function drawBones(ctx: CanvasRenderingContext2D, sx: number, sy: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  drawSoftShadow(ctx, sx, sy + 3, 9, 4, 0.45 * alpha);
  ctx.fillStyle = "rgba(72, 36, 28, 0.28)";
  ctx.beginPath();
  ctx.ellipse(sx, sy + 3, 8, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  const img = bonesSheet();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    img as CanvasImageSource,
    Math.floor(sx - SHEET_W / 2),
    Math.floor(sy - SHEET_H / 2),
  );
  ctx.restore();
}

export function collectBodyMarkerDepthItem(
  map: WorldMap,
  originX: number,
  originY: number,
  now = performance.now(),
): DepthItem | null {
  if (!live || !markerMatchesMap(map, live)) return null;
  const a = alphaFor(now, live.bornAt);
  if (a <= 0.02) return null;
  const marker = live;
  const sx = Math.floor(marker.x - originX);
  const sy = Math.floor(marker.y - originY);
  return {
    y: marker.y + 8,
    x: marker.x,
    draw: (ctx) => drawBones(ctx, sx, sy, a),
  };
}
