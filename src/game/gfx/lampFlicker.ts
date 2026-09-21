/**
 * Warm glass-and-flame flicker for plaza lanterns and ashwood path lamps.
 * The four-frame cycle stays on the prop sheets. This pass only adds a
 * small additive pulse and the path-lamp posts. Alphas stay low so
 * wayfinding labels keep the read. Canvas 2D pixels only — not CipSoft.
 */
import { TILE, type WorldMap } from "@/game/world";
import { tileVariantAt } from "@/game/gfx/tiles";
import {
  LANTERN_FLAME,
  LANTERN_GLASS,
  LANTERN_GLASS_CATCH,
  LANTERN_INNER,
  PROP_FLAME_FRAMES,
  propFlameFrame,
} from "@/game/gfx/props";
import { ctx2d, drawSoftShadow, makeCanvas, px, shadeHex } from "@/game/gfx/canvasUtil";
import type { DepthItem } from "@/game/gfx/depth";

type Sheet = HTMLCanvasElement | OffscreenCanvas;

const LAMP_W = 10;
const LAMP_H = 16;
const lampCache = new Map<number, Sheet>();

/**
 * Irregular warm breath. Same three sines the hollow torch spots already use,
 * so plaza glass and path lamps share one cadence.
 */
export function warmFlamePulse(timeSec: number, seed: number): number {
  return (
    0.76 +
    0.12 * Math.sin(timeSec * 7.1 + seed * 1.7) +
    0.08 * Math.sin(timeSec * 13.4 + seed * 2.3) +
    0.05 * Math.sin(timeSec * 23.0 + seed * 0.9)
  );
}

function tileAt(map: WorldMap, tx: number, ty: number): string | null {
  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return null;
  return map.tiles[ty]![tx]!;
}

/** Interior ashwood (stone), skipping the map-edge wall. */
function groveBeside(map: WorldMap, tx: number, ty: number): { dx: number; dy: number } | null {
  const dirs = [
    { dx: 0, dy: -1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
  ];
  for (const d of dirs) {
    const x = tx + d.dx;
    const y = ty + d.dy;
    if (x <= 0 || y <= 0 || x >= map.width - 1 || y >= map.height - 1) continue;
    if (tileAt(map, x, y) === "stone") return d;
  }
  return null;
}

function pathNeighbors(map: WorldMap, tx: number, ty: number): number {
  let n = 0;
  if (tileAt(map, tx - 1, ty) === "path") n++;
  if (tileAt(map, tx + 1, ty) === "path") n++;
  if (tileAt(map, tx, ty - 1) === "path") n++;
  if (tileAt(map, tx, ty + 1) === "path") n++;
  return n;
}

/** Grove-edge post, or a steady beat along a path run. Plaza square stays dark. */
function rawPathLamp(map: WorldMap, tx: number, ty: number): boolean {
  if (tileAt(map, tx, ty) !== "path") return false;
  if (map.kind === "hollow") return (tx + ty) % 11 === 0;
  const dx = tx - map.spawn.x;
  const dy = ty - map.spawn.y;
  if (dx * dx + dy * dy <= 36) return false;
  if (groveBeside(map, tx, ty) && tileVariantAt(tx, ty) % 2 === 0) return true;
  if (pathNeighbors(map, tx, ty) < 2) return false;
  return (tx * 3 + ty * 5) % 8 === 0;
}

/**
 * Path posts that should carry a lamp.
 * Overworld: ashwood-edge glass, plus lamps along a walk, clear of the fountain.
 * A west or north neighbor already lit is skipped so posts don't clump.
 * Hollow: the same path tiles that already take a torch spot.
 */
export function isPathLamp(map: WorldMap, tx: number, ty: number): boolean {
  if (!rawPathLamp(map, tx, ty)) return false;
  if (map.kind === "hollow") return true;
  if (rawPathLamp(map, tx - 1, ty) || rawPathLamp(map, tx, ty - 1)) return false;
  return true;
}

/**
 * Post stands on the open path, opposite the ashwood crown, so the glass
 * is not buried in the canopy. Hollow spots stay on the existing torch pool.
 */
function stakeOffset(map: WorldMap, tx: number, ty: number): { ox: number; oy: number } {
  const grove = map.kind === "overworld" ? groveBeside(map, tx, ty) : null;
  if (!grove) return { ox: 11, oy: 7 };
  if (grove.dx < 0) return { ox: 20, oy: 8 };
  if (grove.dx > 0) return { ox: 2, oy: 8 };
  return { ox: 11, oy: 8 };
}

function paintPathLamp(ctx: CanvasRenderingContext2D, frame: number): void {
  const i = frame % PROP_FLAME_FRAMES;
  const post = "#3a3020";
  const iron = "#1a1814";
  const glass = LANTERN_GLASS[i]!;
  const flame = LANTERN_FLAME[i]!;
  const inner = LANTERN_INNER[i]!;
  const flick = i % 2;
  px(ctx, 4, 8, iron, 2, 8);
  px(ctx, 3, 14, post, 4, 2);
  px(ctx, 2, 3, post, 6, 6);
  px(ctx, 3, 4, glass, 4, 4);
  const catchX = flick === 0 ? 3 : 5;
  px(ctx, catchX, 4, LANTERN_GLASS_CATCH[i]!, 1, 1);
  px(ctx, flick === 0 ? 5 : 3, 7, shadeHex(glass, 0.72), 1, 1);
  px(ctx, 4, 5 - flick, flame, 2, 2 + flick);
  px(ctx, 4, 6, inner, 2, 1);
  px(ctx, 2, 2, post, 6, 2);
}

function pathLampSheet(frame: number): Sheet {
  const f = ((frame % PROP_FLAME_FRAMES) + PROP_FLAME_FRAMES) % PROP_FLAME_FRAMES;
  let sheet = lampCache.get(f);
  if (!sheet) {
    sheet = makeCanvas(LAMP_W, LAMP_H);
    paintPathLamp(ctx2d(sheet), f);
    lampCache.set(f, sheet);
  }
  return sheet;
}

type GlassBox = { x: number; y: number; w: number; h: number };

/**
 * Additive glass body, the existing flame core, and a one-pixel catch.
 * `strength` scales the whole pulse so path lamps stay quieter than the plaza.
 */
function drawGlassFlicker(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  timeSec: number,
  phase: number,
  glass: GlassBox,
  core: GlassBox,
  strength: number,
): void {
  const pulse = warmFlamePulse(timeSec, phase);
  const flick = propFlameFrame(timeSec, phase) % 2;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.1 * strength * pulse;
  ctx.fillStyle = "#f0c878";
  ctx.fillRect(sx + glass.x, sy + glass.y, glass.w, glass.h);
  ctx.globalAlpha = 0.22 * strength * pulse;
  ctx.fillStyle = "#f0d060";
  ctx.fillRect(sx + core.x, sy + core.y, core.w, core.h);
  ctx.globalAlpha = 0.4 * strength * pulse;
  ctx.fillStyle = "#fff4c8";
  ctx.fillRect(sx + core.x + flick, sy + core.y, 1, 1);
  ctx.restore();
}

/** Plaza lantern: same 4×4 core as before, plus a glass pane around it. */
export function drawLanternGlassFlicker(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  timeSec: number,
  phase: number,
): void {
  drawGlassFlicker(
    ctx,
    sx,
    sy,
    timeSec,
    phase,
    { x: 13, y: 9, w: 6, h: 5 },
    { x: 14, y: 9, w: 4, h: 4 },
    1,
  );
}

export type PathLamp = {
  /** Flame center, world pixels. */
  x: number;
  y: number;
  footY: number;
  sx: number;
  sy: number;
  phase: number;
};

const LAMP_CAP_OVERWORLD = 14;
const LAMP_CAP_HOLLOW = 10;

/** Visible path lamps. Capped so the pulse stays a handful of gradients. */
export function pathLampsInView(
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
): PathLamp[] {
  const startTX = Math.max(0, Math.floor(originX / TILE) - 1);
  const startTY = Math.max(0, Math.floor(originY / TILE) - 1);
  const endTX = Math.min(map.width - 1, Math.ceil((originX + viewW) / TILE) + 1);
  const endTY = Math.min(map.height - 1, Math.ceil((originY + viewH) / TILE) + 1);
  const cap = map.kind === "hollow" ? LAMP_CAP_HOLLOW : LAMP_CAP_OVERWORLD;
  const out: PathLamp[] = [];
  for (let ty = startTY; ty <= endTY; ty++) {
    for (let tx = startTX; tx <= endTX; tx++) {
      if (!isPathLamp(map, tx, ty)) continue;
      const off = stakeOffset(map, tx, ty);
      const sx = Math.floor(tx * TILE - originX) + off.ox;
      const sy = Math.floor(ty * TILE - originY) + off.oy;
      out.push({
        x: tx * TILE + off.ox + 5,
        y: ty * TILE + off.oy + 6,
        footY: ty * TILE + off.oy + LAMP_H,
        sx,
        sy,
        phase: tx * 0.73 + ty * 0.41,
      });
      if (out.length >= cap) return out;
    }
  }
  return out;
}

/**
 * Soft warm pool on the path. Quieter and smaller than a plaza lantern
 * so ashwood shade and labels still own the tile.
 */
export function drawPathLampGlow(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  timeSec: number,
): void {
  if (map.kind !== "overworld") return;
  const lamps = pathLampsInView(map, originX, originY, viewW, viewH);
  for (const lamp of lamps) {
    const lx = Math.floor(lamp.x - originX);
    const ly = Math.floor(lamp.y - originY);
    if (lx < -32 || ly < -32 || lx > viewW + 32 || ly > viewH + 32) continue;
    const pulse = warmFlamePulse(timeSec, lamp.phase);
    const g = ctx.createRadialGradient(lx, ly, 2, lx, ly, 28);
    g.addColorStop(0, `rgba(255, 176, 80, ${0.14 * pulse})`);
    g.addColorStop(0.5, `rgba(220, 120, 40, ${0.05 * pulse})`);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(lx - 28, ly - 28, 56, 56);
  }
}

/** Y-sorted posts so a grove canopy can sit in front of a lamp to the north. */
export function collectPathLampDepthItems(
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  timeSec: number,
): DepthItem[] {
  const lamps = pathLampsInView(map, originX, originY, viewW, viewH);
  const items: DepthItem[] = [];
  for (const lamp of lamps) {
    const frame = propFlameFrame(timeSec, lamp.phase);
    const sheet = pathLampSheet(frame);
    const { sx, sy, phase, footY, x } = lamp;
    items.push({
      y: footY,
      x,
      draw: (c) => {
        c.imageSmoothingEnabled = false;
        drawSoftShadow(c, sx + 5, sy + 15, 4, 2, 0.28);
        c.drawImage(sheet as CanvasImageSource, sx, sy);
        drawGlassFlicker(
          c,
          sx,
          sy,
          timeSec,
          phase,
          { x: 2, y: 3, w: 6, h: 5 },
          { x: 3, y: 4, w: 4, h: 3 },
          0.72,
        );
      },
    });
  }
  return items;
}
