/**
 * Original procedural plaza props (crates, barrels, benches, lanterns).
 * Vale art only — not CipSoft / Tibia sprites.
 */
import { makeCanvas, ctx2d, px, shadeHex, mixHex, paintVolume, addPixelVolume } from "@/game/gfx/canvasUtil";
import { TILE_PX } from "@/game/gfx/tiles";
import type { TownPropKind } from "@/game/world/town";

type Sheet = HTMLCanvasElement | OffscreenCanvas;
const cache = new Map<string, Sheet>();

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

function paintLantern(ctx: CanvasRenderingContext2D): void {
  const post = "#3a3020";
  const flame = "#e8c060";
  const glass = mixHex("#c9a227", "#f0e8a0", 0.4);
  px(ctx, 15, 14, post, 2, 14);
  px(ctx, 12, 8, post, 8, 7);
  px(ctx, 13, 9, glass, 6, 5);
  px(ctx, 15, 10, flame, 2, 3);
  px(ctx, 12, 7, post, 8, 2);
}

function paintStall(ctx: CanvasRenderingContext2D): void {
  const cloth = "#c97a4a";
  const pole = "#3a2a18";
  const dark = shadeHex(cloth, 0.7);
  px(ctx, 6, 16, pole, 2, 12);
  px(ctx, 24, 16, pole, 2, 12);
  px(ctx, 4, 8, dark, 24, 10);
  px(ctx, 5, 9, cloth, 22, 7);
  paintVolume(ctx, 5, 9, 22, 7, cloth, 1.16, 0.74);
  px(ctx, 5, 9, "#e8d8a0", 22, 2);
}

function paintNotice(ctx: CanvasRenderingContext2D): void {
  const post = "#3a3020";
  const board = "#c8b890";
  const ink = "#2a2418";
  px(ctx, 15, 16, post, 2, 12);
  px(ctx, 8, 6, shadeHex(board, 0.7), 16, 14);
  px(ctx, 9, 7, board, 14, 12);
  px(ctx, 11, 10, ink, 10, 1);
  px(ctx, 11, 13, ink, 8, 1);
  px(ctx, 11, 16, ink, 6, 1);
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

function paintProp(kind: TownPropKind): Sheet {
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
      paintLantern(ctx);
      break;
    case "stall":
      paintStall(ctx);
      break;
    case "notice":
      paintNotice(ctx);
      break;
    case "cobble-patch":
      paintCobblePatch(ctx);
      break;
  }
  if (kind !== "cobble-patch") addPixelVolume(ctx, TILE_PX, TILE_PX, 0.1, 0.16);
  return c;
}

export function getPropSheet(kind: TownPropKind): Sheet {
  let sheet = cache.get(kind);
  if (!sheet) {
    sheet = paintProp(kind);
    cache.set(kind, sheet);
  }
  return sheet;
}
