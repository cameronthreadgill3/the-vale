/**
 * Original procedural plaza props (crates, barrels, benches, lanterns).
 * Ambient micro-motion is a few cached frames: lantern flame, stall valance,
 * hanging notice. Shop awnings and facade banners are the same pixel language.
 * Vale art only — not CipSoft / Tibia sprites.
 */
import { makeCanvas, ctx2d, px, shadeHex, mixHex, paintVolume, addPixelVolume } from "@/game/gfx/canvasUtil";
import { TILE_PX } from "@/game/gfx/tiles";
import type { TownPropKind } from "@/game/world/town";

type Sheet = HTMLCanvasElement | OffscreenCanvas;
const cache = new Map<string, Sheet>();

/** Matches hollow-torch / fountain step so plaza flames share that cadence. */
export const PROP_FLAME_FRAMES = 4;
/** Slow cloth cycle — one pixel of lean, then back through center. */
export const PROP_SWAY_FRAMES = 4;

const SWAY_LEAN = [0, 1, 0, -1] as const;

export function propFlameFrame(timeSec: number, phase = 0): number {
  const n = Math.floor(timeSec * 6 + phase);
  return ((n % PROP_FLAME_FRAMES) + PROP_FLAME_FRAMES) % PROP_FLAME_FRAMES;
}

export function propSwayFrame(timeSec: number, phase = 0): number {
  const n = Math.floor(timeSec * 1.6 + phase);
  return ((n % PROP_SWAY_FRAMES) + PROP_SWAY_FRAMES) % PROP_SWAY_FRAMES;
}

export function propSwayLean(frame: number): number {
  const f = ((frame % PROP_SWAY_FRAMES) + PROP_SWAY_FRAMES) % PROP_SWAY_FRAMES;
  return SWAY_LEAN[f]!;
}

function paintCrate(ctx: CanvasRenderingContext2D): void {
  const wood = "#6a5030";
  const dark = shadeHex(wood, 0.65);
  const lite = shadeHex(wood, 1.2);
  px(ctx, 8, 12, dark, 16, 14);
  px(ctx, 9, 13, wood, 14, 12);
  paintVolume(ctx, 9, 13, 14, 12, wood, 1.18, 0.72);
  px(ctx, 9, 13, lite, 14, 2);
  px(ctx, 9, 18, dark, 14, 1);
  px(ctx, 15, 13, dark, 1, 12);
  px(ctx, 9, 24, shadeHex(dark, 0.85), 14, 2);
}

function paintBarrel(ctx: CanvasRenderingContext2D): void {
  const wood = "#5a3a20";
  const dark = shadeHex(wood, 0.6);
  const band = "#8a8070";
  px(ctx, 10, 10, dark, 12, 16);
  px(ctx, 11, 11, wood, 10, 14);
  paintVolume(ctx, 11, 11, 10, 14, wood, 1.2, 0.7);
  px(ctx, 11, 14, band, 10, 2);
  px(ctx, 11, 20, band, 10, 2);
  px(ctx, 12, 12, shadeHex(wood, 1.2), 2, 12);
  px(ctx, 11, 24, shadeHex(dark, 0.85), 10, 2);
}

function paintBench(ctx: CanvasRenderingContext2D): void {
  const wood = "#6a5840";
  const dark = shadeHex(wood, 0.7);
  px(ctx, 4, 18, dark, 24, 4);
  px(ctx, 5, 17, wood, 22, 3);
  px(ctx, 6, 20, dark, 3, 6);
  px(ctx, 23, 20, dark, 3, 6);
}

function paintLantern(ctx: CanvasRenderingContext2D, frame: number): void {
  const post = "#3a3020";
  const glass = mixHex("#c9a227", "#f0e8a0", 0.4);
  const flames = ["#f0d060", "#e8a040", "#f8e080", "#d07020"] as const;
  const inners = ["#fff4c8", "#f0d060", "#fff8e0", "#e8a040"] as const;
  const i = frame % PROP_FLAME_FRAMES;
  const flame = flames[i]!;
  const inner = inners[i]!;
  const flick = i % 2;
  px(ctx, 15, 14, post, 2, 14);
  px(ctx, 12, 8, post, 8, 7);
  px(ctx, 13, 9, glass, 6, 5);
  px(ctx, 15, 10 - flick, flame, 2, 3 + flick);
  px(ctx, 15, 11, inner, 2, 2);
  if (i === 1) px(ctx, 14, 10, flame, 1, 1);
  if (i === 3) px(ctx, 17, 10, inner, 1, 1);
  px(ctx, 12, 7, post, 8, 2);
}

function paintStall(ctx: CanvasRenderingContext2D, frame: number): void {
  const cloth = "#c97a4a";
  const pole = "#3a2a18";
  const dark = shadeHex(cloth, 0.7);
  px(ctx, 6, 16, pole, 2, 12);
  px(ctx, 24, 16, pole, 2, 12);
  px(ctx, 4, 8, dark, 24, 7);
  px(ctx, 5, 9, cloth, 22, 5);
  paintVolume(ctx, 5, 9, 22, 5, cloth, 1.16, 0.74);
  px(ctx, 5, 9, "#e8d8a0", 22, 2);
  paintValance(ctx, 4, 15, 24, dark, cloth, frame);
}

function paintValance(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  dark: string,
  cloth: string,
  frame: number,
): void {
  const scallops = Math.max(1, Math.floor(w / 4));
  for (let i = 0; i < scallops; i++) {
    const dip = (i + frame) % 2;
    px(ctx, x + i * 4, y, dark, 4, 1 + dip);
    px(ctx, x + i * 4 + 1, y, cloth, 2, 1);
  }
}

function paintNotice(ctx: CanvasRenderingContext2D, frame: number): void {
  const post = "#3a3020";
  const board = "#c8b890";
  const ink = "#2a2418";
  const lean = propSwayLean(frame);
  px(ctx, 15, 3, post, 2, 2);
  px(ctx, 15 + lean, 5, post, 1, 2);
  px(ctx, 15, 16, post, 2, 12);
  px(ctx, 8 + lean, 6, shadeHex(board, 0.7), 16, 14);
  px(ctx, 9 + lean, 7, board, 14, 12);
  px(ctx, 11 + lean, 10, ink, 10, 1);
  px(ctx, 11 + lean, 13, ink, 8, 1);
  px(ctx, 11 + lean, 16, ink, 6, 1);
}

const BANNER_W = 10;
const BANNER_H = 18;
const AWNING_W = 28;
const AWNING_H = 12;

function paintBanner(ctx: CanvasRenderingContext2D, color: string, frame: number): void {
  const lean = propSwayLean(frame);
  const dark = shadeHex(color, 0.7);
  const lite = shadeHex(color, 1.16);
  const peg = "#3a2a18";
  px(ctx, 4, 0, peg, 2, 3);
  px(ctx, 2 + lean, 3, dark, 6, 12);
  px(ctx, 3 + lean, 4, color, 4, 10);
  paintVolume(ctx, 3 + lean, 4, 4, 10, color, 1.14, 0.72);
  px(ctx, 3 + lean, 4, lite, 4, 1);
  const tip = frame % 2;
  px(ctx, 2 + lean, 15, dark, 2, 1 + tip);
  px(ctx, 5 + lean, 15, color, 2, 2 - tip);
  px(ctx, 7 + lean, 15, dark, 1, 1 + (1 - tip));
}

function paintShopAwning(ctx: CanvasRenderingContext2D, color: string, frame: number): void {
  const dark = shadeHex(color, 0.68);
  const lite = shadeHex(color, 1.14);
  const pole = "#3a2a18";
  px(ctx, 1, 5, pole, 2, 6);
  px(ctx, 25, 5, pole, 2, 6);
  px(ctx, 0, 1, dark, AWNING_W, 5);
  px(ctx, 1, 2, color, AWNING_W - 2, 3);
  paintVolume(ctx, 1, 2, AWNING_W - 2, 3, color, 1.12, 0.75);
  px(ctx, 1, 2, lite, AWNING_W - 2, 1);
  paintValance(ctx, 0, 6, AWNING_W, dark, color, frame);
}

function paintCobblePatch(ctx: CanvasRenderingContext2D): void {
  const stone = "#5a4a34";
  const lite = shadeHex(stone, 1.25);
  const dark = shadeHex(stone, 0.65);
  px(ctx, 6, 8, dark, 8, 6);
  px(ctx, 7, 9, stone, 6, 4);
  px(ctx, 16, 14, dark, 9, 7);
  px(ctx, 17, 15, lite, 7, 5);
  px(ctx, 10, 20, stone, 7, 5);
}

function heldFrame(kind: TownPropKind, frame: number): number {
  if (kind === "lantern") {
    return ((frame % PROP_FLAME_FRAMES) + PROP_FLAME_FRAMES) % PROP_FLAME_FRAMES;
  }
  if (kind === "stall" || kind === "notice") {
    return ((frame % PROP_SWAY_FRAMES) + PROP_SWAY_FRAMES) % PROP_SWAY_FRAMES;
  }
  return 0;
}

function motionKey(kind: TownPropKind, frame: number): string {
  const f = heldFrame(kind, frame);
  return f === 0 && kind !== "lantern" && kind !== "stall" && kind !== "notice" ? kind : `${kind}:${f}`;
}

function paintProp(kind: TownPropKind, frame: number): Sheet {
  const c = makeCanvas(TILE_PX, TILE_PX);
  const ctx = ctx2d(c);
  switch (kind) {
    case "crate":
      paintCrate(ctx);
      break;
    case "barrel":
      paintBarrel(ctx);
      break;
    case "bench":
      paintBench(ctx);
      break;
    case "lantern":
      paintLantern(ctx, frame);
      break;
    case "stall":
      paintStall(ctx, frame);
      break;
    case "notice":
      paintNotice(ctx, frame);
      break;
    case "cobble-patch":
      paintCobblePatch(ctx);
      break;
  }
  if (kind !== "cobble-patch") addPixelVolume(ctx, TILE_PX, TILE_PX, 0.1, 0.16);
  return c;
}

export function getPropSheet(kind: TownPropKind, frame = 0): Sheet {
  const key = motionKey(kind, frame);
  let sheet = cache.get(key);
  if (!sheet) {
    sheet = paintProp(kind, heldFrame(kind, frame));
    cache.set(key, sheet);
  }
  return sheet;
}

function clothSheet(key: string, w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void): Sheet {
  let sheet = cache.get(key);
  if (!sheet) {
    sheet = makeCanvas(w, h);
    paint(ctx2d(sheet));
    cache.set(key, sheet);
  }
  return sheet;
}

export function getBannerSheet(color: string, frame: number): Sheet {
  const f = ((frame % PROP_SWAY_FRAMES) + PROP_SWAY_FRAMES) % PROP_SWAY_FRAMES;
  return clothSheet(`banner:${color}:${f}`, BANNER_W, BANNER_H, (ctx) => paintBanner(ctx, color, f));
}

export function getAwningSheet(color: string, frame: number): Sheet {
  const f = ((frame % PROP_SWAY_FRAMES) + PROP_SWAY_FRAMES) % PROP_SWAY_FRAMES;
  return clothSheet(`awning:${color}:${f}`, AWNING_W, AWNING_H, (ctx) => paintShopAwning(ctx, color, f));
}
