/**
 * Original stacked-stone hunt cairn (~32px) with optional rec-band post.
 * Cached OffscreenCanvas / canvas sheets — not redrawn every frame.
 * Vale art only; not CipSoft / Tibia assets.
 */
import { makeCanvas, ctx2d, px, shadeHex, mixHex, drawSoftShadow } from "@/game/gfx/canvasUtil";

export const CAIRN_FRAME_W = 32;
export const CAIRN_FRAME_H = 40;

export type CairnSheetOpts = {
  /** Rec-band / lichen accent. Omit for a plain watch cairn. */
  band?: string;
  recMin?: number;
  recMax?: number;
  /** Ashwood Watch marker: gold orb, no rec digits. */
  watch?: boolean;
};

type Sheet = HTMLCanvasElement | OffscreenCanvas;
const cache = new Map<string, Sheet>();

/** Tiny 3×5 glyphs so Rec. 2–4 stays readable on a 32px post. */
const GLYPH: Record<string, string[]> = {
  "1": ["010", "110", "010", "010", "111"],
  "2": ["111", "001", "111", "100", "111"],
  "3": ["111", "001", "111", "001", "111"],
  "4": ["101", "101", "111", "001", "001"],
  "5": ["111", "100", "111", "001", "111"],
  "6": ["111", "100", "111", "101", "111"],
  "7": ["111", "001", "001", "010", "010"],
  "8": ["111", "101", "111", "101", "111"],
  "9": ["111", "101", "111", "001", "111"],
  "0": ["111", "101", "101", "101", "111"],
  "-": ["000", "000", "111", "000", "000"],
};

function paintGlyph(
  ctx: CanvasRenderingContext2D,
  ch: string,
  x: number,
  y: number,
  color: string,
): void {
  const rows = GLYPH[ch];
  if (!rows) return;
  for (let row = 0; row < rows.length; row++) {
    const line = rows[row]!;
    for (let col = 0; col < line.length; col++) {
      if (line[col] === "1") px(ctx, x + col, y + row, color);
    }
  }
}

function paintRecLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
): void {
  let cx = x;
  for (const ch of text) {
    paintGlyph(ctx, ch, cx, y, color);
    cx += 4;
  }
}

function paintStackedStones(ctx: CanvasRenderingContext2D, band: string): void {
  const out = "#1a1814";
  const dark = "#3a3830";
  const mid = "#5a564c";
  const stone = "#8a8680";
  const lite = "#c9c4b8";
  const moss = mixHex(band, "#4a5a30", 0.45);
  const lichen = shadeHex(band, 1.05);

  // Base course — three irregular stones
  px(ctx, 4, 31, out, 24, 6);
  px(ctx, 5, 32, dark, 10, 5);
  px(ctx, 6, 33, mid, 8, 3);
  px(ctx, 7, 34, stone, 5, 2);
  px(ctx, 16, 32, dark, 11, 5);
  px(ctx, 17, 33, mid, 9, 3);
  px(ctx, 18, 34, stone, 6, 2);
  px(ctx, 12, 31, dark, 8, 4);
  px(ctx, 13, 32, stone, 6, 2);
  px(ctx, 8, 35, lite, 2, 1);
  px(ctx, 20, 35, lite, 2, 1);

  // Mid course
  px(ctx, 7, 25, out, 18, 7);
  px(ctx, 8, 26, dark, 8, 6);
  px(ctx, 9, 27, mid, 6, 4);
  px(ctx, 10, 28, stone, 4, 2);
  px(ctx, 16, 26, dark, 8, 6);
  px(ctx, 17, 27, mid, 6, 4);
  px(ctx, 18, 28, stone, 4, 2);
  px(ctx, 12, 25, mid, 8, 4);
  px(ctx, 13, 26, stone, 6, 2);
  px(ctx, 14, 27, lite, 3, 1);

  // Rec-band lichen on the left mid stone
  px(ctx, 9, 29, moss, 5, 2);
  px(ctx, 10, 28, lichen, 3, 1);

  // Capstone
  px(ctx, 11, 20, out, 10, 6);
  px(ctx, 12, 21, dark, 8, 5);
  px(ctx, 13, 22, stone, 6, 3);
  px(ctx, 14, 23, lite, 4, 2);
  px(ctx, 15, 21, lite, 2, 1);

  // Peak pebble
  px(ctx, 14, 17, out, 4, 4);
  px(ctx, 15, 18, stone, 2, 3);
  px(ctx, 15, 18, lite, 2, 1);

  // Right-face cracks
  px(ctx, 23, 33, out, 1, 3);
  px(ctx, 21, 28, out, 1, 2);
}

function paintRecPost(
  ctx: CanvasRenderingContext2D,
  band: string,
  recMin: number,
  recMax: number,
): void {
  const wood = "#4a3a28";
  const woodLite = "#6a5030";
  const woodDark = "#2a2014";
  const ink = "#0c0d0b";
  const board = shadeHex(band, 1.08);
  const boardDark = shadeHex(band, 0.72);

  // Short post sunk into the capstone
  px(ctx, 15, 8, woodDark, 3, 12);
  px(ctx, 15, 8, wood, 2, 11);
  px(ctx, 15, 9, woodLite, 1, 8);

  // Rec board
  px(ctx, 8, 2, ink, 16, 8);
  px(ctx, 9, 3, boardDark, 14, 6);
  px(ctx, 10, 4, board, 12, 4);
  px(ctx, 10, 4, shadeHex(band, 1.25), 12, 1);

  const label = `${recMin}-${recMax}`;
  const labelW = label.length * 4 - 1;
  paintRecLabel(ctx, label, 16 - Math.floor(labelW / 2), 4, ink);
}

function paintWatchMark(ctx: CanvasRenderingContext2D): void {
  const gold = "#c9a227";
  const goldLite = "#e8d060";
  const goldDark = "#8a7018";
  // Gold orb on the peak pebble
  px(ctx, 14, 14, goldDark, 4, 4);
  px(ctx, 15, 15, gold, 3, 3);
  px(ctx, 16, 15, goldLite, 1, 1);
  // Chalk slash on the capstone
  px(ctx, 13, 22, gold, 5, 1);
  px(ctx, 14, 23, goldLite, 3, 1);
}

function paintCairn(opts: CairnSheetOpts): Sheet {
  const c = makeCanvas(CAIRN_FRAME_W, CAIRN_FRAME_H);
  const ctx = ctx2d(c);
  const band = opts.band ?? "#c9a227";
  paintStackedStones(ctx, band);
  if (opts.watch) {
    paintWatchMark(ctx);
  } else if (opts.recMin != null && opts.recMax != null) {
    paintRecPost(ctx, band, opts.recMin, opts.recMax);
  }
  return c;
}

function cacheKey(opts: CairnSheetOpts): string {
  if (opts.watch) return "watch";
  return `hunt|${opts.band ?? ""}|${opts.recMin ?? ""}-${opts.recMax ?? ""}`;
}

export function getCairnSheet(opts: CairnSheetOpts = {}): Sheet {
  const key = cacheKey(opts);
  let sheet = cache.get(key);
  if (!sheet) {
    sheet = paintCairn(opts);
    cache.set(key, sheet);
  }
  return sheet;
}

export function warmCairnSheets(): void {
  getCairnSheet({ band: "#c9a227", recMin: 2, recMax: 4 });
  getCairnSheet({ band: "#d4a060", recMin: 3, recMax: 5 });
  getCairnSheet({ band: "#9aaa70", recMin: 1, recMax: 3 });
  getCairnSheet({ band: "#c97a4a", recMin: 3, recMax: 5 });
  getCairnSheet({ watch: true });
}

function blitCairn(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  sheet: Sheet,
): void {
  drawSoftShadow(ctx, sx, sy + 8, 13, 5, 0.36);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    sheet as CanvasImageSource,
    Math.floor(sx - CAIRN_FRAME_W / 2),
    Math.floor(sy - CAIRN_FRAME_H + 12),
    CAIRN_FRAME_W,
    CAIRN_FRAME_H,
  );
}

/** Hunt-ground cairn: stacked stones + rec-band post. */
export function drawHuntCairnSprite(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  band: string,
  recMin: number,
  recMax: number,
): void {
  blitCairn(ctx, sx, sy, getCairnSheet({ band, recMin, recMax }));
}

/** Ashwood Watch cairn: same stone stack, gold orb instead of rec digits. */
export function drawWatchCairnSprite(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
): void {
  blitCairn(ctx, sx, sy, getCairnSheet({ watch: true }));
}
