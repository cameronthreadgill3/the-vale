/**
 * Soft chimney wisps on Thornreach roofs, plus thin smoke over distant ashwood.
 * A frame loop — a few pixels rising and fading. No particle pool, no sheets.
 * Stacks sort with the building front so a crown to the north does not eat them.
 * Grove columns are drawn after the canopy, above the leaves, and birds still
 * pass in front. The plaza footprint stays clear of grove smoke.
 * Alphas stay low. Lantern flicker, fauna, and screen overlays keep their passes.
 * Original Vale pixels only — not CipSoft. Not combat smoke.
 */
import { TILE, type WorldMap } from "@/game/world";
import { buildingsOnContinent, type TownBuilding } from "@/game/world/town";
import { warmFlamePulse } from "@/game/gfx/lampFlicker";
import type { DepthItem } from "@/game/gfx/depth";

type Stack = {
  id: string;
  /** Pixels right of the roof peak. Negative sits on the lit slope. */
  peakDx: number;
  hearth: boolean;
};

/** Domestic roofs only. The depot stays a stone counter. */
const STACKS: readonly Stack[] = [
  { id: "perrin-oven", peakDx: 14, hearth: true },
  { id: "nolls-hut", peakDx: -16, hearth: false },
  { id: "watch-post", peakDx: 16, hearth: false },
  { id: "thornreach-general", peakDx: -18, hearth: false },
];

const SOOT = "186, 178, 166";
const HEARTH = "196, 176, 154";
const GROVE = "176, 180, 166";

type WispOpts = {
  rise: number;
  count: number;
  maxA: number;
  rgb: string;
  wind: number;
  thin: boolean;
};

function tileAt(map: WorldMap, tx: number, ty: number): string | null {
  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return null;
  return map.tiles[ty]![tx] ?? null;
}

/** Playable ashwood. The map frame is a stone ring, not a grove. */
function isCanopy(map: WorldMap, tx: number, ty: number): boolean {
  if (tx <= 0 || ty <= 0 || tx >= map.width - 1 || ty >= map.height - 1) return false;
  return tileAt(map, tx, ty) === "stone";
}

function idSeed(id: string): number {
  let n = 0;
  for (let i = 0; i < id.length; i++) n = (n + id.charCodeAt(i) * (i + 3)) % 97;
  return n / 17;
}

function windAt(timeSec: number): number {
  return Math.round(Math.sin(timeSec * 0.31) * 2 + Math.sin(timeSec * 0.11));
}

function buildingById(map: WorldMap, id: string): TownBuilding | undefined {
  const list = buildingsOnContinent(map.continentId);
  for (let i = 0; i < list.length; i++) {
    if (list[i]!.id === id) return list[i];
  }
  return undefined;
}

function stackGeom(
  b: TownBuilding,
  originX: number,
  originY: number,
  peakDx: number,
): { mouthX: number; top: number } {
  const x = Math.floor(b.x * TILE - originX);
  const y = Math.floor(b.y * TILE - originY);
  const w = b.w * TILE;
  const peakX = x + w / 2;
  const peakY = y - 10;
  const baseY = y + 6;
  const left = x - 2;
  const right = x + w + 2;
  const cx = peakX + peakDx;
  const span = cx <= peakX ? peakX - left : right - peakX;
  const t = span <= 0 ? 0 : Math.abs(cx - peakX) / span;
  const roofY = peakY + t * (baseY - peakY);
  return { mouthX: Math.round(cx), top: Math.round(roofY) - 11 };
}

function drawStack(
  ctx: CanvasRenderingContext2D,
  mouthX: number,
  top: number,
  hearth: boolean,
  timeSec: number,
  seed: number,
): void {
  const left = mouthX - 2;
  ctx.fillStyle = "#241c14";
  ctx.fillRect(left + 3, top, 2, 12);
  ctx.fillStyle = "#3a3024";
  ctx.fillRect(left, top, 4, 12);
  ctx.fillStyle = "#6a5840";
  ctx.fillRect(left, top, 1, 11);
  ctx.fillStyle = "#5a4a38";
  ctx.fillRect(left, top + 5, 4, 1);
  ctx.fillStyle = "#1c1610";
  ctx.fillRect(left - 1, top - 2, 7, 2);
  ctx.fillStyle = "#0c0a08";
  ctx.fillRect(left + 1, top - 1, 3, 2);
  if (!hearth) return;
  const pulse = warmFlamePulse(timeSec, seed);
  ctx.fillStyle = `rgba(232, 168, 88, ${0.42 * pulse})`;
  ctx.fillRect(mouthX, top - 1, 1, 1);
}

function drawRisingWisps(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  timeSec: number,
  seed: number,
  opts: WispOpts,
): void {
  const speed = opts.thin ? 0.11 : 0.17;
  for (let i = 0; i < opts.count; i++) {
    const t = (timeSec * speed + seed + i / opts.count) % 1;
    const inn = t < 0.16 ? t / 0.16 : 1;
    const a = inn * (1 - t) * opts.maxA;
    if (a < 0.03) continue;
    const sway = Math.round(Math.sin(timeSec * 0.72 + seed * 2 + i * 2.1) * (t * (opts.thin ? 2 : 3)));
    const px = x + opts.wind + sway;
    const py = y - Math.round(t * opts.rise);
    if (opts.thin) {
      ctx.fillStyle = `rgba(${opts.rgb}, ${a})`;
      ctx.fillRect(px, py, 2, 2);
      ctx.fillStyle = `rgba(${opts.rgb}, ${a * 0.4})`;
      ctx.fillRect(px + (sway >= 0 ? 2 : -1), py + 1, 1, 1);
      continue;
    }
    const wide = t > 0.45;
    ctx.fillStyle = `rgba(${opts.rgb}, ${a})`;
    ctx.fillRect(px, py, wide ? 3 : 2, 1);
    if (t < 0.72) {
      ctx.fillStyle = `rgba(${opts.rgb}, ${a * 0.5})`;
      ctx.fillRect(px + 1, py - 1, 1, 1);
    }
  }
}

/** Plaza houses and the square. Grove smoke stays outside this footprint. */
function inTown(tx: number, ty: number): boolean {
  return tx >= 16 && tx <= 35 && ty >= 9 && ty <= 24;
}

/**
 * Thin columns above distant ashwood. Call after the depth flush so crowns
 * stay behind the wisp, and before the high fauna so birds stay in front.
 */
export function drawDistantGroveSmoke(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  timeSec: number,
): void {
  if (map.kind !== "overworld" || map.continentId !== "thornreach") return;
  const startTX = Math.max(0, Math.floor(originX / TILE) - 1);
  const startTY = Math.max(0, Math.floor(originY / TILE) - 1);
  const endTX = Math.min(map.width - 1, Math.ceil((originX + viewW) / TILE) + 1);
  const endTY = Math.min(map.height - 1, Math.ceil((originY + viewH) / TILE) + 1);
  const camX = originX + viewW / 2;
  const camY = originY + viewH / 2;
  const wind = windAt(timeSec);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  for (let ty = startTY; ty <= endTY; ty++) {
    for (let tx = startTX; tx <= endTX; tx++) {
      if ((tx * 3 + ty * 5) % 7 !== 0) continue;
      if (!isCanopy(map, tx, ty) || inTown(tx, ty)) continue;
      const wx = (tx + 0.5) * TILE;
      const wy = (ty + 0.35) * TILE;
      const dx = wx - camX;
      const dy = wy - camY;
      const dist = Math.hypot(dx, dy);
      if (dist < 180 || dist > 820) continue;
      let depth = 1;
      if (dist < 280) depth = (dist - 180) / 100;
      else if (dist > 640) depth = Math.max(0, 1 - (dist - 640) / 180);
      const sx = Math.floor(wx - originX) + ((tx * 3) % 5) - 2;
      const sy = Math.floor(ty * TILE - originY) - 50;
      drawRisingWisps(ctx, sx, sy, timeSec, (tx * 0.17 + ty * 0.13) % 1, {
        rise: 24,
        count: 2,
        maxA: 0.62 * depth,
        rgb: GROVE,
        wind,
        thin: true,
      });
    }
  }
  ctx.restore();
}

/**
 * Roof stacks and the wisps leaving them.
 * Sort key is the building's south edge, so northern crowns draw first and
 * anyone standing south of the house still covers the smoke.
 */
export function collectChimneyDepthItems(
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  timeSec: number,
): DepthItem[] {
  if (map.kind !== "overworld" || map.continentId !== "thornreach") return [];
  const wind = windAt(timeSec);
  const items: DepthItem[] = [];
  for (let i = 0; i < STACKS.length; i++) {
    const stack = STACKS[i]!;
    const b = buildingById(map, stack.id);
    if (!b) continue;
    const geom = stackGeom(b, originX, originY, stack.peakDx);
    if (geom.mouthX < -24 || geom.mouthX > viewW + 24 || geom.top < -40 || geom.top > viewH + 24) {
      continue;
    }
    const seed = idSeed(stack.id);
    const mouthX = geom.mouthX;
    const top = geom.top;
    items.push({
      y: (b.y + b.h) * TILE,
      x: (b.x + b.w * 0.5) * TILE,
      draw: (ctx) => {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        drawStack(ctx, mouthX, top, stack.hearth, timeSec, seed);
        drawRisingWisps(ctx, mouthX, top - 2, timeSec, seed, {
          rise: stack.hearth ? 28 : 24,
          count: stack.hearth ? 3 : 2,
          maxA: stack.hearth ? 0.52 : 0.44,
          rgb: stack.hearth ? HEARTH : SOOT,
          wind,
          thin: false,
        });
        ctx.restore();
      },
    });
  }
  return items;
}
