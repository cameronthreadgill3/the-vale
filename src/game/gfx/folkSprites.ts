/**
 * Simple clothed pixel folk figures (original Vale art).
 * Cached per color; name labels stay in folkCanvas.
 */
import { makeCanvas, ctx2d, px, shadeHex, drawSoftShadow } from "@/game/gfx/canvasUtil";

export const FOLK_FRAME = 32;

type Sheet = HTMLCanvasElement | OffscreenCanvas;
const cache = new Map<string, Sheet>();

const SKIN = "#d4a574";
const OUT = "#1a1814";
const HAIR = "#3a3028";

function paintFolk(color: string): Sheet {
  const c = makeCanvas(FOLK_FRAME, FOLK_FRAME);
  const ctx = ctx2d(c);
  const tunic = color;
  const tunicDark = shadeHex(color, 0.65);
  const boot = "#2a2418";
  // shadow
  px(ctx, 10, 26, "rgba(0,0,0,0.35)", 12, 4);
  // boots
  px(ctx, 12, 24, boot, 3, 4);
  px(ctx, 17, 24, boot, 3, 4);
  // legs
  px(ctx, 13, 20, tunicDark, 3, 5);
  px(ctx, 16, 20, tunicDark, 3, 5);
  // torso
  px(ctx, 11, 12, OUT, 10, 10);
  px(ctx, 12, 12, tunic, 8, 9);
  px(ctx, 12, 18, tunicDark, 8, 3);
  // arms
  px(ctx, 9, 13, SKIN, 3, 6);
  px(ctx, 20, 13, SKIN, 3, 6);
  px(ctx, 9, 13, tunicDark, 2, 3);
  px(ctx, 21, 13, tunicDark, 2, 3);
  // head
  px(ctx, 13, 6, OUT, 6, 7);
  px(ctx, 14, 7, SKIN, 4, 5);
  // hair
  px(ctx, 13, 5, HAIR, 6, 3);
  px(ctx, 13, 6, HAIR, 2, 3);
  px(ctx, 18, 6, HAIR, 2, 2);
  // belt
  px(ctx, 12, 17, "#c9a227", 8, 1);
  return c;
}

export function getFolkSheet(color: string): Sheet {
  let sheet = cache.get(color);
  if (!sheet) {
    sheet = paintFolk(color);
    cache.set(color, sheet);
  }
  return sheet;
}

export function drawFolkSprite(
  ctx: CanvasRenderingContext2D,
  color: string,
  sx: number,
  sy: number,
): void {
  const sheet = getFolkSheet(color);
  const size = 36;
  drawSoftShadow(ctx, sx, sy + size * 0.22, size * 0.28, size * 0.1, 0.32);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    sheet as CanvasImageSource,
    Math.floor(sx - size / 2),
    Math.floor(sy - size / 2 - 4),
    size,
    size,
  );
}
