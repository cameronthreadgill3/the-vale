/**
 * Original procedural 32×32 terrain sheets for The Vale.
 * Earthy greens/browns, cobble paths, water, ashwood, hollow stone, fountain.
 * NOT CipSoft / Tibia assets — handcrafted pixel patterns only.
 */
import type { BiomePalette } from "@/game/continents";
import type { GroundTile } from "@/game/world";
import { makeCanvas, ctx2d, px, shadeHex, mixHex } from "@/game/gfx/canvasUtil";

export const TILE_PX = 32;
export const TILE_VARIANTS = 4;

type Sheet = HTMLCanvasElement | OffscreenCanvas;

const sheetCache = new Map<string, Sheet>();

function hash2(tx: number, ty: number): number {
  let n = (tx * 374761393 + ty * 668265263) | 0;
  n = (n ^ (n >>> 13)) * 1274126177;
  return (n ^ (n >>> 16)) >>> 0;
}

function paintGrass(ctx: CanvasRenderingContext2D, base: string, variant: number): void {
  const dark = shadeHex(base, 0.72);
  const lite = shadeHex(base, 1.18);
  const mid = shadeHex(base, 0.92);
  for (let y = 0; y < TILE_PX; y++) {
    for (let x = 0; x < TILE_PX; x++) {
      const n = (x * 3 + y * 7 + variant * 11) & 7;
      px(ctx, x, y, n < 2 ? dark : n < 5 ? base : n === 5 ? mid : lite);
    }
  }
  // blade tufts
  for (let i = 0; i < 10; i++) {
    const x = (i * 7 + variant * 3) % 28 + 2;
    const y = (i * 11 + variant * 5) % 26 + 3;
    px(ctx, x, y, lite, 1, 3);
    px(ctx, x + 1, y + 1, dark, 1, 2);
  }
}

function paintDirt(ctx: CanvasRenderingContext2D, base: string, variant: number): void {
  const dark = shadeHex(base, 0.75);
  const lite = shadeHex(base, 1.15);
  for (let y = 0; y < TILE_PX; y++) {
    for (let x = 0; x < TILE_PX; x++) {
      const n = (x + y * 2 + variant) & 3;
      px(ctx, x, y, n === 0 ? dark : n === 1 ? lite : base);
    }
  }
  px(ctx, 4 + variant, 8, dark, 3, 2);
  px(ctx, 18, 20 + (variant % 3), dark, 4, 2);
}

function paintPath(ctx: CanvasRenderingContext2D, base: string, variant: number): void {
  // cobble
  const dark = shadeHex(base, 0.65);
  const lite = shadeHex(base, 1.25);
  const mortar = shadeHex(base, 0.45);
  ctx.fillStyle = mortar;
  ctx.fillRect(0, 0, TILE_PX, TILE_PX);
  const offsets = [
    [0, 0], [8, 0], [16, 0], [24, 0],
    [4, 8], [12, 8], [20, 8], [28, 8],
    [0, 16], [8, 16], [16, 16], [24, 16],
    [4, 24], [12, 24], [20, 24], [28, 24],
  ];
  for (let i = 0; i < offsets.length; i++) {
    const [ox, oy] = offsets[i]!;
    const shift = ((i + variant) % 3) - 1;
    const c = (i + variant) % 3 === 0 ? lite : (i + variant) % 3 === 1 ? base : dark;
    px(ctx, ox + shift, oy, c, 7, 7);
    px(ctx, ox + shift, oy, dark, 7, 1);
    px(ctx, ox + shift, oy, dark, 1, 7);
    px(ctx, ox + shift + 1, oy + 1, lite, 2, 1);
  }
}

function paintWater(ctx: CanvasRenderingContext2D, base: string, variant: number): void {
  const deep = shadeHex(base, 0.7);
  const foam = mixHex(base, "#a8c8d8", 0.45);
  const mid = shadeHex(base, 1.1);
  for (let y = 0; y < TILE_PX; y++) {
    for (let x = 0; x < TILE_PX; x++) {
      const wave = Math.sin((x + variant * 4) * 0.4 + y * 0.25) > 0.3;
      px(ctx, x, y, wave ? mid : deep);
    }
  }
  for (let i = 0; i < 4; i++) {
    const y = 6 + i * 7 + (variant % 2);
    px(ctx, 2 + i * 2, y, foam, 10, 1);
    px(ctx, 14 + i, y + 3, foam, 8, 1);
  }
}

function paintStoneAshwood(ctx: CanvasRenderingContext2D, base: string, variant: number): void {
  // ashwood trunk + silver-edged canopy (within 32×32)
  const bark = shadeHex(base, 0.85);
  const barkDark = shadeHex(base, 0.55);
  const barkLite = mixHex(base, "#6a7068", 0.35);
  const canopy = mixHex(base, "#2a5030", 0.55);
  const canopyLite = mixHex(canopy, "#c8d8c0", 0.35);
  const canopyDark = shadeHex(canopy, 0.7);
  // ground under tree
  ctx.fillStyle = shadeHex(base, 1.1);
  ctx.fillRect(0, 24, TILE_PX, 8);
  // trunk
  px(ctx, 13, 14, barkDark, 6, 14);
  px(ctx, 14, 12, bark, 4, 16);
  px(ctx, 15, 13, barkLite, 1, 12);
  // roots
  px(ctx, 11, 26, barkDark, 3, 2);
  px(ctx, 18, 26, barkDark, 3, 2);
  // canopy blobs
  const ox = (variant % 3) - 1;
  px(ctx, 6 + ox, 4, canopyDark, 20, 12);
  px(ctx, 8 + ox, 2, canopy, 16, 14);
  px(ctx, 10 + ox, 3, canopyLite, 4, 3);
  px(ctx, 18 + ox, 5, canopyLite, 3, 2);
  // silver edge leaves
  px(ctx, 7 + ox, 6, "#a8b8a0", 2, 1);
  px(ctx, 22 + ox, 8, "#a8b8a0", 2, 1);
  px(ctx, 14 + ox, 2, "#c8d8c0", 2, 1);
}

function paintFlowerFountain(ctx: CanvasRenderingContext2D, base: string, variant: number): void {
  // small plaza fountain / well (flower tiles near clearings)
  const stone = mixHex(base, "#5a5850", 0.5);
  const stoneDark = shadeHex(stone, 0.65);
  const water = mixHex(base, "#3a6a88", 0.55);
  const waterLite = mixHex(water, "#90c0d8", 0.4);
  // grass surround
  for (let y = 0; y < TILE_PX; y++) {
    for (let x = 0; x < TILE_PX; x++) {
      px(ctx, x, y, shadeHex(base, 0.9 + ((x + y + variant) & 1) * 0.08));
    }
  }
  // basin ring
  px(ctx, 6, 10, stoneDark, 20, 16);
  px(ctx, 7, 11, stone, 18, 14);
  px(ctx, 9, 13, water, 14, 10);
  px(ctx, 11, 15, waterLite, 10, 2);
  // center spout
  px(ctx, 14, 8, stone, 4, 8);
  px(ctx, 15, 6, waterLite, 2, 4);
  if (variant % 2 === 0) {
    px(ctx, 12, 7, waterLite, 1, 1);
    px(ctx, 19, 8, waterLite, 1, 1);
  }
}

function paintGate(ctx: CanvasRenderingContext2D, base: string, _variant: number): void {
  const dark = shadeHex(base, 0.45);
  const lite = mixHex(base, "#f0e8c0", 0.35);
  ctx.fillStyle = dark;
  ctx.fillRect(0, 0, TILE_PX, TILE_PX);
  px(ctx, 2, 2, base, 28, 28);
  px(ctx, 4, 4, dark, 24, 24);
  px(ctx, 6, 6, lite, 20, 20);
  px(ctx, 14, 4, dark, 4, 24);
  px(ctx, 8, 14, dark, 16, 4);
  // gold studs
  px(ctx, 8, 8, base, 2, 2);
  px(ctx, 22, 8, base, 2, 2);
  px(ctx, 8, 22, base, 2, 2);
  px(ctx, 22, 22, base, 2, 2);
}

function paintHollow(ctx: CanvasRenderingContext2D, base: string, variant: number): void {
  // dark stone portal
  const stone = mixHex(base, "#1a1814", 0.4);
  const stoneLite = shadeHex(stone, 1.35);
  const voidC = "#08060a";
  const rim = mixHex(base, "#c9a227", 0.25);
  for (let y = 0; y < TILE_PX; y++) {
    for (let x = 0; x < TILE_PX; x++) {
      px(ctx, x, y, (x + y + variant) & 1 ? stone : shadeHex(stone, 0.85));
    }
  }
  // arch
  px(ctx, 6, 8, stoneLite, 20, 20);
  px(ctx, 8, 10, voidC, 16, 16);
  px(ctx, 10, 12, shadeHex(base, 0.5), 12, 12);
  px(ctx, 12, 14, voidC, 8, 10);
  // rune rim
  px(ctx, 8, 8, rim, 16, 1);
  px(ctx, 8, 8, rim, 1, 16);
  px(ctx, 23, 8, rim, 1, 16);
  px(ctx, 8, 25, rim, 16, 1);
}

function paintExit(ctx: CanvasRenderingContext2D, base: string, _variant: number): void {
  const dark = shadeHex(base, 0.55);
  const lite = mixHex(base, "#e8d8a0", 0.4);
  ctx.fillStyle = dark;
  ctx.fillRect(0, 0, TILE_PX, TILE_PX);
  px(ctx, 4, 4, base, 24, 24);
  px(ctx, 6, 6, lite, 20, 20);
  px(ctx, 8, 8, dark, 16, 16);
  px(ctx, 10, 10, base, 12, 12);
  px(ctx, 14, 12, lite, 4, 10);
}

function paintTile(kind: GroundTile, color: string, variant: number): Sheet {
  const c = makeCanvas(TILE_PX, TILE_PX);
  const ctx = ctx2d(c);
  switch (kind) {
    case "grass":
    case "grassAlt":
      paintGrass(ctx, color, variant + (kind === "grassAlt" ? 2 : 0));
      break;
    case "dirt":
      paintDirt(ctx, color, variant);
      break;
    case "path":
      paintPath(ctx, color, variant);
      break;
    case "water":
      paintWater(ctx, color, variant);
      break;
    case "stone":
      paintStoneAshwood(ctx, color, variant);
      break;
    case "flower":
      paintFlowerFountain(ctx, color, variant);
      break;
    case "gate":
      paintGate(ctx, color, variant);
      break;
    case "hollow":
      paintHollow(ctx, color, variant);
      break;
    case "exit":
      paintExit(ctx, color, variant);
      break;
    default:
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, TILE_PX, TILE_PX);
  }
  return c;
}

export function getTileSheet(kind: GroundTile, color: string, variant: number): Sheet {
  const v = ((variant % TILE_VARIANTS) + TILE_VARIANTS) % TILE_VARIANTS;
  const key = `${kind}|${color}|${v}`;
  let sheet = sheetCache.get(key);
  if (!sheet) {
    sheet = paintTile(kind, color, v);
    sheetCache.set(key, sheet);
  }
  return sheet;
}

export function tileVariantAt(tx: number, ty: number): number {
  return hash2(tx, ty) % TILE_VARIANTS;
}

export function paletteColor(pal: BiomePalette, kind: GroundTile): string {
  return pal[kind] ?? pal.grass;
}
