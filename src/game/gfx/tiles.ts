/**
 * Original procedural 32×32 terrain sheets for The Vale (gfx pass 3).
 * More variants, shoreline/grass transitions, animated water + fountain,
 * ashwood trunk vs dense canopy overlay, hollow cave walls with torch flicker.
 * Cached OffscreenCanvas / canvas sheets — not redrawn every frame.
 * NOT CipSoft / Tibia assets — handcrafted pixel patterns only.
 */
import type { BiomePalette } from "@/game/continents";
import type { GroundTile } from "@/game/world";
import { makeCanvas, ctx2d, px, shadeHex, mixHex, addPixelVolume } from "@/game/gfx/canvasUtil";

export const TILE_PX = 32;
export const TILE_VARIANTS = 8;
export const FOUNTAIN_FRAMES = 4;
export const CANOPY_PX = 64;

export type TileMode = "overworld" | "hollow";
export type EdgeDir = "n" | "s" | "e" | "w";

type Sheet = HTMLCanvasElement | OffscreenCanvas;

const sheetCache = new Map<string, Sheet>();
const edgeCache = new Map<string, Sheet>();
const waterEdgeCache = new Map<string, Sheet>();
const canopyCache = new Map<string, Sheet>();

function hash2(tx: number, ty: number): number {
  let n = (tx * 374761393 + ty * 668265263) | 0;
  n = (n ^ (n >>> 13)) * 1274126177;
  return (n ^ (n >>> 16)) >>> 0;
}

export function fountainFrameAt(timeSec: number): number {
  return ((Math.floor(timeSec * 6) % FOUNTAIN_FRAMES) + FOUNTAIN_FRAMES) % FOUNTAIN_FRAMES;
}

function paintGrass(ctx: CanvasRenderingContext2D, base: string, variant: number): void {
  const dark = shadeHex(base, 0.68);
  const mid = shadeHex(base, 0.88);
  const lite = shadeHex(base, 1.24);
  const blade = mixHex(base, "#8cbc70", 0.28);
  const bladeTip = mixHex(base, "#d4e8b8", 0.4);
  const pebble = mixHex(base, "#6a6050", 0.45);
  const flower = ["#c45c3e", "#c9a227", "#8ab87a", "#7ab8c9"][variant % 4]!;
  for (let y = 0; y < TILE_PX; y++) {
    for (let x = 0; x < TILE_PX; x++) {
      const n = (x * 3 + y * 7 + variant * 13) & 7;
      px(ctx, x, y, n < 2 ? dark : n < 4 ? mid : n < 6 ? base : lite);
    }
  }
  const tufts = 11 + (variant % 5);
  for (let i = 0; i < tufts; i++) {
    const x = (i * 7 + variant * 5) % 28 + 2;
    const y = (i * 11 + variant * 3) % 26 + 2;
    const h = 2 + (i + variant) % 3;
    px(ctx, x, y, blade, 1, h);
    px(ctx, x, y, bladeTip, 1, 1);
    px(ctx, x + 1, y + 1, dark, 1, Math.max(1, h - 1));
  }
  if (variant % 4 === 2) {
    for (let i = 0; i < 3; i++) {
      const x = 6 + ((i * 9 + variant) % 20);
      const y = 8 + ((i * 7 + variant * 2) % 16);
      px(ctx, x, y, flower, 2, 2);
      px(ctx, x + 1, y + 1, shadeHex(flower, 0.7), 1, 1);
    }
  }
  if (variant % 4 === 3) {
    px(ctx, 5 + (variant % 5), 18, pebble, 3, 2);
    px(ctx, 20, 7 + (variant % 4), pebble, 2, 2);
    px(ctx, 14, 24, dark, 3, 2);
  }
  if (variant % 4 === 1) {
    px(ctx, 10, 10, mixHex(base, "#c8d8c0", 0.35), 2, 1);
    px(ctx, 22, 20, mixHex(base, "#c8d8c0", 0.3), 2, 1);
  }
}

function paintDirt(ctx: CanvasRenderingContext2D, base: string, variant: number): void {
  const dark = shadeHex(base, 0.72);
  const lite = shadeHex(base, 1.18);
  const crack = shadeHex(base, 0.5);
  for (let y = 0; y < TILE_PX; y++) {
    for (let x = 0; x < TILE_PX; x++) {
      const n = (x * 5 + y * 3 + variant * 9) & 7;
      px(ctx, x, y, n === 0 ? dark : n === 1 ? lite : base);
    }
  }
  px(ctx, 3 + (variant % 6), 6, dark, 4, 2);
  px(ctx, 18, 12 + (variant % 5), dark, 5, 2);
  px(ctx, 8, 22, crack, 6, 1);
  px(ctx, 20, 5, crack, 1, 5);
  if (variant % 2 === 0) px(ctx, 12, 16, lite, 3, 2);
}

function paintPath(ctx: CanvasRenderingContext2D, base: string, variant: number): void {
  const dark = shadeHex(base, 0.62);
  const lite = shadeHex(base, 1.28);
  const mortar = shadeHex(base, 0.42);
  const moss = mixHex(base, "#3a5a30", 0.4);
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
    const tone = (i * 3 + variant) % 5;
    const c = tone === 0 ? lite : tone === 1 ? dark : tone === 2 ? moss : base;
    const w = 6 + ((i + variant) % 2);
    const h = 6 + ((i + variant * 2) % 2);
    px(ctx, ox + shift, oy, c, w, h);
    px(ctx, ox + shift, oy, dark, w, 1);
    px(ctx, ox + shift, oy, dark, 1, h);
    px(ctx, ox + shift + 1, oy + 1, lite, 2, 1);
  }
}

function paintCobble(ctx: CanvasRenderingContext2D, base: string, variant: number): void {
  paintCobbleField(ctx, base, variant, true);
}

/** Denser plaza cobbles — original Vale stones, not CipSoft tiles. */
function paintCobbleField(
  ctx: CanvasRenderingContext2D,
  base: string,
  variant: number,
  plaza: boolean,
): void {
  const dark = shadeHex(base, 0.62);
  const lite = shadeHex(base, 1.28);
  const mid = shadeHex(base, 0.88);
  const mortar = shadeHex(base, plaza ? 0.38 : 0.45);
  const moss = mixHex(base, "#3a5a32", 0.45);
  ctx.fillStyle = mortar;
  ctx.fillRect(0, 0, TILE_PX, TILE_PX);
  const offsets = plaza
    ? [
        [0, 0], [7, 0], [14, 0], [21, 0], [28, 0],
        [3, 6], [10, 6], [17, 6], [24, 6],
        [0, 12], [7, 12], [14, 12], [21, 12], [28, 12],
        [4, 18], [11, 18], [18, 18], [25, 18],
        [0, 24], [8, 24], [16, 24], [24, 24],
      ]
    : [
        [0, 0], [8, 0], [16, 0], [24, 0],
        [4, 8], [12, 8], [20, 8], [28, 8],
        [0, 16], [8, 16], [16, 16], [24, 16],
        [4, 24], [12, 24], [20, 24], [28, 24],
      ];
  const stoneW = plaza ? 6 : 7;
  const stoneH = plaza ? 5 : 7;
  for (let i = 0; i < offsets.length; i++) {
    const [ox, oy] = offsets[i]!;
    const shift = ((i + variant) % 3) - 1;
    const roll = (i + variant) % 4;
    const c = roll === 0 ? lite : roll === 1 ? base : roll === 2 ? mid : dark;
    px(ctx, ox + shift, oy, c, stoneW, stoneH);
    px(ctx, ox + shift, oy, dark, stoneW, 1);
    px(ctx, ox + shift, oy, dark, 1, stoneH);
    px(ctx, ox + shift + 1, oy + 1, lite, 2, 1);
    if (plaza && (i + variant) % 5 === 0) {
      px(ctx, ox + shift + 2, oy + stoneH - 1, moss, 2, 1);
    }
  }
}

function paintWall(ctx: CanvasRenderingContext2D, base: string, variant: number): void {
  const plaster = mixHex(base, "#8a7a5a", 0.55);
  const plasterDark = shadeHex(plaster, 0.72);
  const timber = mixHex(base, "#3a2a18", 0.5);
  const timberLite = shadeHex(timber, 1.25);
  const out = shadeHex(timber, 0.55);
  ctx.fillStyle = plasterDark;
  ctx.fillRect(0, 0, TILE_PX, TILE_PX);
  px(ctx, 1, 1, plaster, 30, 30);
  px(ctx, 0, 0, timber, TILE_PX, 3);
  px(ctx, 0, 29, timber, TILE_PX, 3);
  px(ctx, 0, 0, timber, 3, TILE_PX);
  px(ctx, 29, 0, timber, 3, TILE_PX);
  px(ctx, 1, 1, timberLite, 30, 1);
  const by = 12 + (variant % 3);
  px(ctx, 3, by, timber, 26, 3);
  px(ctx, 3, by, timberLite, 26, 1);
  if (variant % 2 === 0) {
    px(ctx, 12, 6, out, 8, 6);
    px(ctx, 13, 7, mixHex(base, "#3a5060", 0.4), 6, 4);
    px(ctx, 16, 7, out, 1, 4);
  }
}

function paintFloor(ctx: CanvasRenderingContext2D, base: string, variant: number): void {
  const plank = mixHex(base, "#6a5030", 0.45);
  const plankDark = shadeHex(plank, 0.7);
  const plankLite = shadeHex(plank, 1.15);
  ctx.fillStyle = plankDark;
  ctx.fillRect(0, 0, TILE_PX, TILE_PX);
  for (let i = 0; i < 4; i++) {
    const y = i * 8;
    const shift = ((i + variant) % 2) * 4;
    px(ctx, 0, y, plank, TILE_PX, 8);
    px(ctx, 0, y, plankDark, TILE_PX, 1);
    px(ctx, shift, y + 2, plankLite, 8, 1);
    px(ctx, 12 + (variant % 5), y + 5, plankDark, 3, 1);
  }
}

function paintDoor(ctx: CanvasRenderingContext2D, base: string, variant: number): void {
  const plaster = mixHex(base, "#8a7a5a", 0.5);
  const timber = mixHex(base, "#3a2a18", 0.55);
  const board = mixHex(base, "#6a4a28", 0.4);
  const boardLite = shadeHex(board, 1.2);
  const floor = mixHex(base, "#5a4830", 0.4);
  ctx.fillStyle = plaster;
  ctx.fillRect(0, 0, TILE_PX, TILE_PX);
  px(ctx, 0, 24, floor, TILE_PX, 8);
  px(ctx, 4, 2, timber, 24, 28);
  px(ctx, 6, 4, board, 20, 24);
  px(ctx, 7, 5, boardLite, 2, 20);
  px(ctx, 6, 12, timber, 20, 2);
  px(ctx, 22, 14, "#c9a227", 2, 2);
  if (variant % 2 === 0) {
    px(ctx, 20, 4, shadeHex(floor, 1.1), 6, 24);
  }
}

function paintWater(
  ctx: CanvasRenderingContext2D,
  base: string,
  variant: number,
  anim: number,
): void {
  const deep = shadeHex(base, 0.62);
  const mid = shadeHex(base, 1.08);
  const lite = mixHex(base, "#6a9ab8", 0.4);
  const foam = mixHex(base, "#c0d8e8", 0.55);
  const phase = anim * 1.15 + variant * 0.4;
  for (let y = 0; y < TILE_PX; y++) {
    for (let x = 0; x < TILE_PX; x++) {
      const w = Math.sin((x + variant * 3) * 0.38 + y * 0.22 + phase);
      const w2 = Math.sin((x * 0.2 - y * 0.35) + phase * 0.7);
      px(ctx, x, y, w2 < -0.45 ? deep : w > 0.35 ? lite : w > -0.1 ? mid : deep);
    }
  }
  for (let i = 0; i < 5; i++) {
    const y = (6 + i * 6 + anim * 2 + (variant % 3)) % 30;
    const x = (2 + i * 5 + anim) % 22;
    px(ctx, x, y, foam, 8 + (i % 3), 1);
    px(ctx, x + 10, (y + 3) % 30, shadeHex(foam, 0.85), 6, 1);
  }
}

function paintAshwoodBase(ctx: CanvasRenderingContext2D, base: string, variant: number): void {
  const grass = mixHex(base, "#2a5030", 0.55);
  paintGrass(ctx, grass, variant);
  const bark = mixHex(base, "#3a3834", 0.25);
  const barkDark = shadeHex(bark, 0.55);
  const barkLite = mixHex(bark, "#7a786c", 0.4);
  const moss = mixHex(bark, "#3a5a38", 0.45);
  const ox = (variant % 5) - 2;
  // duff under the trunk — local umbra, not a repeating grass gradient
  px(ctx, 9 + ox, 23, shadeHex(grass, 0.62), 14, 8);
  px(ctx, 11 + ox, 25, shadeHex(grass, 0.5), 10, 5);
  // roots
  px(ctx, 10 + ox, 26, barkDark, 5, 3);
  px(ctx, 17 + ox, 27, barkDark, 5, 2);
  px(ctx, 8 + ox, 28, bark, 3, 2);
  px(ctx, 21 + ox, 28, bark, 3, 2);
  // trunk
  px(ctx, 13 + ox, 10, barkDark, 7, 20);
  px(ctx, 14 + ox, 8, bark, 5, 22);
  px(ctx, 15 + ox, 10, barkLite, 1, 16);
  px(ctx, 17 + ox, 12, barkDark, 1, 10);
  if (variant % 2 === 0) px(ctx, 14 + ox, 16, moss, 3, 2);
  px(ctx, 16 + ox, 20, barkDark, 2, 3);
  // low branch nubs
  px(ctx, 11 + ox, 14, barkDark, 3, 2);
  px(ctx, 19 + ox, 15, bark, 3, 2);
}

function paintCaveWall(
  ctx: CanvasRenderingContext2D,
  base: string,
  variant: number,
  anim: number,
): void {
  const rock = mixHex(base, "#1c1a18", 0.35);
  const dark = shadeHex(rock, 0.7);
  const lite = shadeHex(rock, 1.35);
  const moss = mixHex(rock, "#2a3a24", 0.4);
  for (let y = 0; y < TILE_PX; y++) {
    for (let x = 0; x < TILE_PX; x++) {
      const n = (x * 5 + y * 3 + variant * 7) & 7;
      px(ctx, x, y, n < 2 ? dark : n === 6 ? lite : rock);
    }
  }
  // mortar cracks
  px(ctx, 0, 10 + (variant % 4), dark, 32, 1);
  px(ctx, 0, 22, shadeHex(rock, 0.8), 32, 1);
  px(ctx, 8 + (variant % 6), 0, dark, 1, 32);
  px(ctx, 20, 4, moss, 4, 3);
  px(ctx, 4, 18, moss, 3, 2);
  // cave lip — ceiling shade and floor contact so hollow walls aren't a flat slab
  px(ctx, 0, 0, shadeHex(rock, 0.48), TILE_PX, 2);
  px(ctx, 1, 2, lite, 6, 1);
  px(ctx, 0, 30, shadeHex(rock, 0.42), TILE_PX, 2);
  px(ctx, 0, 28, dark, TILE_PX, 1);
  // torch sconce on some variants
  if (variant % 3 === 0) {
    paintTorch(ctx, 13, 6, anim);
  }
}

function paintTorch(ctx: CanvasRenderingContext2D, x: number, y: number, anim: number): void {
  const bracket = "#3a3028";
  const iron = "#1a1814";
  const flame = ["#f0d060", "#e8a040", "#f8e080", "#d07020"][anim % 4]!;
  const inner = ["#fff4c8", "#f0d060", "#fff8e0", "#e8a040"][anim % 4]!;
  const h = 5 + (anim % 2);
  px(ctx, x + 2, y + 10, iron, 4, 3);
  px(ctx, x + 3, y + 8, bracket, 2, 6);
  px(ctx, x + 1, y + 7, iron, 6, 2);
  px(ctx, x + 2, y + 7 - h, flame, 4, h + 1);
  px(ctx, x + 3, y + 8 - h, inner, 2, Math.max(2, h - 1));
  if (anim % 2 === 1) {
    px(ctx, x, y + 5, flame, 1, 2);
    px(ctx, x + 7, y + 4, inner, 1, 2);
  }
}

function paintFlowerFountain(
  ctx: CanvasRenderingContext2D,
  base: string,
  variant: number,
  anim: number,
): void {
  const grass = mixHex(base, "#2a5030", 0.5);
  paintGrass(ctx, grass, variant);
  const stone = mixHex(base, "#6a6860", 0.55);
  const stoneDark = shadeHex(stone, 0.6);
  const stoneLite = shadeHex(stone, 1.25);
  const water = mixHex(base, "#2a70a0", 0.45);
  const waterLite = mixHex(water, "#c0e8f8", 0.55);
  const foam = "#e8f6ff";
  // basin — fill most of the tile so the plaza fountain reads at distance
  px(ctx, 3, 10, stoneDark, 26, 20);
  px(ctx, 4, 11, stone, 24, 18);
  px(ctx, 5, 12, stoneLite, 22, 2);
  px(ctx, 6, 14, water, 20, 13);
  px(ctx, 7, 15, shadeHex(water, 1.15), 18, 4);
  const rippleY = 16 + (anim % 3);
  px(ctx, 8, rippleY, waterLite, 16, 2);
  px(ctx, 10, rippleY + 3, foam, 12, 1);
  // pedestal + spout
  px(ctx, 13, 7, stoneDark, 6, 12);
  px(ctx, 14, 6, stone, 4, 12);
  px(ctx, 15, 4, waterLite, 2, 6);
  // animated jet + droplets
  const jet = 5 + anim;
  px(ctx, 15, 2, foam, 2, jet);
  const drops: [number, number][] = [
    [12 - anim, 7 + anim],
    [19 + (anim % 2), 8 + (anim % 3)],
    [13, 6 + anim],
    [18, 5 + ((anim + 1) % 4)],
  ];
  for (const [dx, dy] of drops) {
    if (dy > 6 && dy < 24) px(ctx, dx, dy, foam, 1, 2);
  }
  if (anim % 2 === 0) {
    px(ctx, 11, 16, foam, 2, 1);
    px(ctx, 19, 18, foam, 2, 1);
  }
}

function paintGate(ctx: CanvasRenderingContext2D, base: string, variant: number): void {
  const dark = shadeHex(base, 0.4);
  const mid = shadeHex(base, 0.75);
  const lite = mixHex(base, "#f0e8c0", 0.4);
  ctx.fillStyle = dark;
  ctx.fillRect(0, 0, TILE_PX, TILE_PX);
  px(ctx, 2, 2, mid, 28, 28);
  px(ctx, 4, 4, dark, 24, 24);
  px(ctx, 6, 6, lite, 20, 20);
  px(ctx, 14, 4, dark, 4, 24);
  px(ctx, 8, 14, dark, 16, 4);
  px(ctx, 8, 8, base, 2, 2);
  px(ctx, 22, 8, base, 2, 2);
  px(ctx, 8, 22, base, 2, 2);
  px(ctx, 22, 22, base, 2, 2);
  if (variant % 2 === 0) {
    px(ctx, 10, 10, lite, 2, 2);
    px(ctx, 20, 20, lite, 2, 2);
  }
}

function paintHollowPortal(ctx: CanvasRenderingContext2D, base: string, variant: number): void {
  const stone = mixHex(base, "#1a1814", 0.4);
  const stoneLite = shadeHex(stone, 1.4);
  const voidC = "#08060a";
  const rim = mixHex(base, "#c9a227", 0.3);
  for (let y = 0; y < TILE_PX; y++) {
    for (let x = 0; x < TILE_PX; x++) {
      px(ctx, x, y, (x + y + variant) & 1 ? stone : shadeHex(stone, 0.82));
    }
  }
  px(ctx, 5, 6, stoneLite, 22, 22);
  px(ctx, 7, 8, voidC, 18, 18);
  px(ctx, 9, 10, shadeHex(base, 0.45), 14, 14);
  px(ctx, 11, 12, voidC, 10, 12);
  px(ctx, 7, 7, rim, 18, 1);
  px(ctx, 7, 7, rim, 1, 18);
  px(ctx, 24, 7, rim, 1, 18);
  px(ctx, 7, 24, rim, 18, 1);
  px(ctx, 15, 14, rim, 2, 2);
}

function paintExit(ctx: CanvasRenderingContext2D, base: string, _variant: number): void {
  const dark = shadeHex(base, 0.5);
  const lite = mixHex(base, "#e8d8a0", 0.45);
  ctx.fillStyle = dark;
  ctx.fillRect(0, 0, TILE_PX, TILE_PX);
  px(ctx, 4, 4, base, 24, 24);
  px(ctx, 6, 6, lite, 20, 20);
  px(ctx, 8, 8, dark, 16, 16);
  px(ctx, 10, 10, base, 12, 12);
  px(ctx, 14, 12, lite, 4, 10);
}

function paintTile(
  kind: GroundTile,
  color: string,
  variant: number,
  anim: number,
  mode: TileMode,
): Sheet {
  const c = makeCanvas(TILE_PX, TILE_PX);
  const ctx = ctx2d(c);
  switch (kind) {
    case "grass":
    case "grassAlt":
      paintGrass(ctx, color, variant + (kind === "grassAlt" ? 3 : 0));
      break;
    case "dirt":
      paintDirt(ctx, color, variant);
      break;
    case "path":
      paintPath(ctx, color, variant);
      break;
    case "cobble":
      paintCobble(ctx, color, variant);
      break;
    case "water":
      paintWater(ctx, color, variant, anim);
      break;
    case "stone":
      if (mode === "hollow") paintCaveWall(ctx, color, variant, anim);
      else paintAshwoodBase(ctx, color, variant);
      break;
    case "flower":
      paintFlowerFountain(ctx, color, variant, anim);
      break;
    case "wall":
      paintWall(ctx, color, variant);
      break;
    case "floor":
      paintFloor(ctx, color, variant);
      break;
    case "door":
      paintDoor(ctx, color, variant);
      break;
    case "gate":
      paintGate(ctx, color, variant);
      break;
    case "hollow":
      paintHollowPortal(ctx, color, variant);
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

export function getTileSheet(
  kind: GroundTile,
  color: string,
  variant: number,
  anim = 0,
  mode: TileMode = "overworld",
): Sheet {
  const v = ((variant % TILE_VARIANTS) + TILE_VARIANTS) % TILE_VARIANTS;
  const a = ((anim % FOUNTAIN_FRAMES) + FOUNTAIN_FRAMES) % FOUNTAIN_FRAMES;
  const key = `${mode}|${kind}|${color}|${v}|a${a}`;
  let sheet = sheetCache.get(key);
  if (!sheet) {
    sheet = paintTile(kind, color, v, a, mode);
    sheetCache.set(key, sheet);
  }
  return sheet;
}

function paintGrassEdge(base: string, dir: EdgeDir, variant: number): Sheet {
  const c = makeCanvas(TILE_PX, TILE_PX);
  const ctx = ctx2d(c);
  const crack = shadeHex(base, 0.38);
  const dark = shadeHex(base, 0.55);
  const mid = shadeHex(base, 0.78);
  const blade = mixHex(base, "#6a8a48", 0.32);
  const tip = mixHex(base, "#d0e0b0", 0.38);
  const depth = 6;
  for (let i = 0; i < TILE_PX; i++) {
    const jag = (i * 3 + variant * 5) & 3;
    const d = depth - jag;
    const tone = (k: number) => (k === 0 ? crack : k === 1 ? dark : k === 2 ? mid : blade);
    if (dir === "n") {
      for (let k = 0; k < d; k++) px(ctx, i, k, tone(k));
    } else if (dir === "s") {
      for (let k = 0; k < d; k++) px(ctx, i, TILE_PX - 1 - k, tone(k));
    } else if (dir === "w") {
      for (let k = 0; k < d; k++) px(ctx, k, i, tone(k));
    } else {
      for (let k = 0; k < d; k++) px(ctx, TILE_PX - 1 - k, i, tone(k));
    }
    if ((i + variant) % 3 === 0) {
      const tuft = 2 + ((i + variant) % 3);
      if (dir === "n") {
        px(ctx, i, d, blade, 1, tuft);
        px(ctx, i, d, tip, 1, 1);
      } else if (dir === "s") {
        px(ctx, i, TILE_PX - 1 - d - tuft + 1, blade, 1, tuft);
        px(ctx, i, TILE_PX - d - tuft, tip, 1, 1);
      } else if (dir === "w") {
        px(ctx, d, i, blade, tuft, 1);
        px(ctx, d, i, tip, 1, 1);
      } else {
        px(ctx, TILE_PX - d - tuft, i, blade, tuft, 1);
        px(ctx, TILE_PX - d - tuft, i, tip, 1, 1);
      }
    }
  }
  return c;
}

export function getGrassEdgeSheet(color: string, dir: EdgeDir, variant: number): Sheet {
  const v = ((variant % TILE_VARIANTS) + TILE_VARIANTS) % TILE_VARIANTS;
  const key = `${color}|${dir}|${v}`;
  let sheet = edgeCache.get(key);
  if (!sheet) {
    sheet = paintGrassEdge(color, dir, v);
    edgeCache.set(key, sheet);
  }
  return sheet;
}

const spillCache = new Map<string, Sheet>();

/** Grass blades spilling onto a hard neighbor — reads as a raised turf lip. */
function paintGrassSpill(base: string, dir: EdgeDir, variant: number): Sheet {
  const c = makeCanvas(TILE_PX, TILE_PX);
  const ctx = ctx2d(c);
  const dark = shadeHex(base, 0.5);
  const blade = mixHex(base, "#6a8a48", 0.35);
  const tip = mixHex(base, "#d0e0b0", 0.42);
  for (let i = 0; i < TILE_PX; i++) {
    if ((i + variant * 3) % 2 === 0) continue;
    const jag = (i * 5 + variant * 2) & 3;
    const len = 2 + (jag % 3);
    if (dir === "n") {
      px(ctx, i, 0, dark, 1, len);
      px(ctx, i, 0, blade, 1, Math.max(1, len - 1));
      px(ctx, i, 0, tip, 1, 1);
    } else if (dir === "s") {
      px(ctx, i, TILE_PX - len, dark, 1, len);
      px(ctx, i, TILE_PX - len + 1, blade, 1, Math.max(1, len - 1));
      px(ctx, i, TILE_PX - 1, tip, 1, 1);
    } else if (dir === "w") {
      px(ctx, 0, i, dark, len, 1);
      px(ctx, 0, i, blade, Math.max(1, len - 1), 1);
      px(ctx, 0, i, tip, 1, 1);
    } else {
      px(ctx, TILE_PX - len, i, dark, len, 1);
      px(ctx, TILE_PX - len + 1, i, blade, Math.max(1, len - 1), 1);
      px(ctx, TILE_PX - 1, i, tip, 1, 1);
    }
  }
  return c;
}

export function getGrassSpillSheet(color: string, dir: EdgeDir, variant: number): Sheet {
  const v = ((variant % TILE_VARIANTS) + TILE_VARIANTS) % TILE_VARIANTS;
  const key = `${color}|${dir}|${v}`;
  let sheet = spillCache.get(key);
  if (!sheet) {
    sheet = paintGrassSpill(color, dir, v);
    spillCache.set(key, sheet);
  }
  return sheet;
}

function paintWaterShore(
  base: string,
  dir: EdgeDir,
  variant: number,
  anim: number,
): Sheet {
  const c = makeCanvas(TILE_PX, TILE_PX);
  const ctx = ctx2d(c);
  const foam = mixHex(base, "#d0e8f0", 0.65);
  const wet = mixHex(base, "#4a7088", 0.4);
  const depth = 4;
  const shift = anim % 2;
  for (let i = 0; i < TILE_PX; i++) {
    const jag = ((i * 5 + variant * 3 + anim) & 3);
    const d = depth - (jag % 3);
    const foamOn = (i + anim + variant) % 4 !== 0;
    if (dir === "n") {
      for (let k = 0; k < d; k++) px(ctx, i, k + shift, k === 0 && foamOn ? foam : wet);
    } else if (dir === "s") {
      for (let k = 0; k < d; k++) px(ctx, i, TILE_PX - 1 - k - shift, k === 0 && foamOn ? foam : wet);
    } else if (dir === "w") {
      for (let k = 0; k < d; k++) px(ctx, k + shift, i, k === 0 && foamOn ? foam : wet);
    } else {
      for (let k = 0; k < d; k++) px(ctx, TILE_PX - 1 - k - shift, i, k === 0 && foamOn ? foam : wet);
    }
  }
  return c;
}

export function getWaterShoreSheet(
  color: string,
  dir: EdgeDir,
  variant: number,
  anim: number,
): Sheet {
  const v = ((variant % TILE_VARIANTS) + TILE_VARIANTS) % TILE_VARIANTS;
  const a = ((anim % FOUNTAIN_FRAMES) + FOUNTAIN_FRAMES) % FOUNTAIN_FRAMES;
  const key = `${color}|${dir}|${v}|a${a}`;
  let sheet = waterEdgeCache.get(key);
  if (!sheet) {
    sheet = paintWaterShore(color, dir, v, a);
    waterEdgeCache.set(key, sheet);
  }
  return sheet;
}

function blob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
): void {
  px(ctx, x, y, fill, w, h);
  px(ctx, x + 2, y - 2, fill, Math.max(2, w - 4), 3);
  px(ctx, x + 2, y + h - 1, fill, Math.max(2, w - 4), 3);
  px(ctx, x - 1, y + 2, fill, 3, Math.max(2, h - 4));
  px(ctx, x + w - 2, y + 2, fill, 3, Math.max(2, h - 4));
}

function paintAshwoodCanopy(base: string, variant: number): Sheet {
  const c = makeCanvas(CANOPY_PX, CANOPY_PX);
  const ctx = ctx2d(c);
  const canopy = mixHex(base, "#244828", 0.5);
  const dark = shadeHex(canopy, 0.55);
  const umbra = shadeHex(canopy, 0.38);
  const mid = mixHex(canopy, "#3a6040", 0.25);
  const lite = mixHex(canopy, "#c8dcc8", 0.38);
  const silver = "#c4d4c4";
  const ox = (variant % 5) - 2;
  const oy = ((variant * 3) % 5) - 2;
  // south umbra first so the mass reads above the grass
  blob(ctx, 8 + ox, 26 + oy, 48, 24, umbra);
  blob(ctx, 6 + ox, 10 + oy, 52, 36, dark);
  blob(ctx, 2 + ox, 14 + oy, 28, 26, mid);
  blob(ctx, 24 + ox, 6 + oy, 34, 30, canopy);
  blob(ctx, 12 + ox, 2 + oy, 30, 22, mid);
  blob(ctx, 16 + ox, 16 + oy, 26, 20, canopy);
  blob(ctx, 8 + ox, 20 + oy, 22, 18, dark);
  blob(ctx, 30 + ox, 18 + oy, 20, 16, mid);
  blob(ctx, 20 + ox, 8 + oy, 18, 16, canopy);
  blob(ctx, 14 + ox, 0 + oy, 22, 12, mixHex(canopy, "#d0e4d0", 0.22));
  // silver-edged leaves — denser on the north rim
  const sparks = [
    [8 + ox, 16], [12 + ox, 8], [24 + ox, 6], [36 + ox, 12],
    [40 + ox, 20], [30 + ox, 8], [16 + ox, 22], [22 + ox, 4],
    [6 + ox, 24], [34 + ox, 28], [18 + ox, 12], [42 + ox, 16],
    [50 + ox, 18], [28 + ox, 32], [10 + ox, 30], [48 + ox, 10],
    [14 + ox, 14], [38 + ox, 22], [20 + ox, 26], [44 + ox, 30],
    [18 + ox, 2], [28 + ox, 0], [38 + ox, 4], [10 + ox, 6],
  ];
  for (let i = 0; i < sparks.length; i++) {
    const [sx, sy] = sparks[i]!;
    px(ctx, sx, sy + oy, i % 3 === 0 ? silver : lite, 2, 1);
  }
  addPixelVolume(ctx, CANOPY_PX, CANOPY_PX, 0.1, 0.2);
  return c;
}

export function getAshwoodCanopySheet(color: string, variant: number): Sheet {
  const v = ((variant % TILE_VARIANTS) + TILE_VARIANTS) % TILE_VARIANTS;
  const key = `${color}|${v}`;
  let sheet = canopyCache.get(key);
  if (!sheet) {
    sheet = paintAshwoodCanopy(color, v);
    canopyCache.set(key, sheet);
  }
  return sheet;
}

export function tileVariantAt(tx: number, ty: number): number {
  return hash2(tx, ty) % TILE_VARIANTS;
}

export function paletteColor(pal: BiomePalette, kind: GroundTile): string {
  if (kind === "cobble") return pal.path;
  if (kind === "wall") return pal.dirt;
  if (kind === "floor") return pal.dirt;
  if (kind === "door") return pal.path;
  return pal[kind] ?? pal.grass;
}

const ALL_KINDS: GroundTile[] = [
  "grass",
  "grassAlt",
  "dirt",
  "path",
  "cobble",
  "stone",
  "water",
  "flower",
  "wall",
  "floor",
  "door",
  "gate",
  "hollow",
  "exit",
];

/** Prefill cached sheets so the first in-game view does not hitch. */
export function warmTileSheets(pal: BiomePalette): void {
  for (const mode of ["overworld", "hollow"] as const) {
    for (const kind of ALL_KINDS) {
      const color = paletteColor(pal, kind);
      const animMax =
        kind === "water" || kind === "flower" || (kind === "stone" && mode === "hollow")
          ? FOUNTAIN_FRAMES
          : 1;
      for (let v = 0; v < TILE_VARIANTS; v++) {
        for (let a = 0; a < animMax; a++) {
          getTileSheet(kind, color, v, a, mode);
        }
        if (kind === "grass") {
          for (const dir of ["n", "s", "e", "w"] as const) {
            getGrassEdgeSheet(color, dir, v);
            getGrassSpillSheet(color, dir, v);
          }
        }
        if (kind === "water") {
          for (const dir of ["n", "s", "e", "w"] as const) {
            for (let a = 0; a < FOUNTAIN_FRAMES; a++) {
              getWaterShoreSheet(color, dir, v, a);
            }
          }
        }
        if (kind === "stone" && mode === "overworld") {
          getAshwoodCanopySheet(color, v);
        }
      }
    }
  }
}
