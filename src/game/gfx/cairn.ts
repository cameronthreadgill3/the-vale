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
  const mid = "#6a665c";
  const stone = "#8a8680";
  const lite = "#c9c4b8";
  const moss = mixHex(band, "#4a5a30", 0.4);
  const lichen = shadeHex(band, 1.08);

  // Wide base course — three chunky stones
  px(ctx, 2, 30, out, 28, 9);
  px(ctx, 3, 31, dark, 11, 8);
  px(ctx, 4, 32, mid, 9, 6);
  px(ctx, 5, 33, stone, 7, 4);
  px(ctx, 6, 34, lite, 3, 2);
  px(ctx, 14, 31, dark, 8, 7);
  px(ctx, 15, 32, mid, 6, 5);
  px(ctx, 16, 33, stone, 4, 3);
  px(ctx, 18, 31, dark, 11, 8);
  px(ctx, 19, 32, mid, 9, 6);
  px(ctx, 20, 33, stone, 7, 4);
  px(ctx, 22, 34, lite, 3, 2);
  px(ctx, 10, 36, out, 1, 2);
  px(ctx, 24, 35, out, 1, 3);

  // Mid course — two overlapping stones
  px(ctx, 6, 24, out, 20, 8);
  px(ctx, 7, 25, dark, 10, 7);
  px(ctx, 8, 26, mid, 8, 5);
  px(ctx, 9, 27, stone, 6, 3);
  px(ctx, 10, 26, lite, 3, 2);
  px(ctx, 16, 25, dark, 9, 7);
  px(ctx, 17, 26, mid, 7, 5);
  px(ctx, 18, 27, stone, 5, 3);
  px(ctx, 19, 26, lite, 3, 2);
  px(ctx, 15, 24, mid, 4, 3);

  // Rec-band lichen so the cairn reads from the plaza
  px(ctx, 8, 28, moss, 7, 3);
  px(ctx, 9, 27, lichen, 5, 2);
  px(ctx, 19, 29, moss, 4, 2);

  // Capstone
  px(ctx, 10, 19, out, 12, 7);
  px(ctx, 11, 20, dark, 10, 6);
  px(ctx, 12, 21, mid, 8, 4);
  px(ctx, 13, 22, stone, 6, 3);
  px(ctx, 14, 21, lite, 4, 2);

  // Peak pebble
  px(ctx, 13, 16, out, 6, 5);
  px(ctx, 14, 17, mid, 4, 4);
  px(ctx, 15, 18, stone, 3, 2);
  px(ctx, 15, 17, lite, 2, 1);

  // Face cracks
  px(ctx, 12, 33, out, 1, 3);
  px(ctx, 22, 27, out, 1, 3);
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
  px(ctx, 15, 10, woodDark, 3, 9);
  px(ctx, 15, 10, wood, 2, 8);
  px(ctx, 15, 11, woodLite, 1, 6);

  // Rec board — tall enough for 3×5 digits + padding
  px(ctx, 7, 1, ink, 18, 10);
  px(ctx, 8, 2, boardDark, 16, 8);
  px(ctx, 9, 3, board, 14, 6);
  px(ctx, 9, 3, shadeHex(band, 1.28), 14, 1);

  const label = `${recMin}-${recMax}`;
  const labelW = label.length * 4 - 1;
  paintRecLabel(ctx, label, 16 - Math.floor(labelW / 2), 3, ink);
}

function paintWatchMark(ctx: CanvasRenderingContext2D): void {
  const gold = "#c9a227";
  const goldLite = "#e8d060";
  const goldDark = "#8a7018";
  // Gold orb on the peak pebble
  px(ctx, 14, 13, goldDark, 4, 4);
  px(ctx, 15, 14, gold, 3, 3);
  px(ctx, 16, 14, goldLite, 1, 1);
  // Chalk slash on the capstone
  px(ctx, 12, 22, gold, 6, 1);
  px(ctx, 13, 23, goldLite, 4, 1);
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
