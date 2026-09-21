/**
 * Original creature pixel sprites for The Vale.
 * Needle Rat + Bark Hound are detailed; others are simple silhouettes.
 * Cached OffscreenCanvas / canvas sheets — not redrawn every frame.
 * NOT CipSoft / Tibia assets.
 */
import { makeCanvas, ctx2d, px, shadeHex } from "@/game/gfx/canvasUtil";

/** Mirror of enemy kind ids (avoid circular import with enemies.ts). */
export type CreatureKindId =
  | "briar-mite"
  | "needle-rat"
  | "bark-hound"
  | "shade-wisp";

export const CREATURE_FRAME = 32;

type Sheet = HTMLCanvasElement | OffscreenCanvas;
const cache = new Map<string, Sheet>();

function paintNeedleRat(ctx: CanvasRenderingContext2D, flash: boolean): void {
  const fur = flash ? "#e8e0d0" : "#7a6a5a";
  const dark = flash ? "#a89880" : "#3a3028";
  const belly = flash ? "#d8d0c0" : "#9a8a78";
  const tooth = "#e8e6d9";
  const eye = "#c45c3e";
  // body
  px(ctx, 8, 14, dark, 16, 10);
  px(ctx, 9, 13, fur, 14, 10);
  px(ctx, 10, 16, belly, 10, 5);
  // head / snout
  px(ctx, 20, 12, fur, 8, 8);
  px(ctx, 24, 14, dark, 6, 5);
  px(ctx, 26, 15, belly, 4, 3);
  // needle teeth
  px(ctx, 28, 16, tooth, 1, 2);
  px(ctx, 29, 15, tooth, 1, 3);
  px(ctx, 30, 16, tooth, 1, 2);
  px(ctx, 27, 17, tooth, 1, 2);
  // ear
  px(ctx, 20, 10, dark, 3, 3);
  px(ctx, 21, 10, fur, 2, 2);
  // eye
  px(ctx, 24, 13, eye, 2, 2);
  // legs
  px(ctx, 10, 22, dark, 2, 4);
  px(ctx, 14, 23, dark, 2, 3);
  px(ctx, 18, 22, dark, 2, 4);
  px(ctx, 22, 23, dark, 2, 3);
  // tail
  px(ctx, 6, 16, dark, 3, 2);
  px(ctx, 4, 14, dark, 3, 2);
  px(ctx, 3, 12, fur, 2, 2);
  // outline hints
  px(ctx, 8, 13, "#1a1814", 1, 10);
  px(ctx, 23, 22, "#1a1814", 1, 4);
}

function paintBarkHound(ctx: CanvasRenderingContext2D, flash: boolean): void {
  const hide = flash ? "#e0d8c0" : "#6a5a3a";
  const dark = flash ? "#908060" : "#2a2418";
  const bark = flash ? "#c8b890" : "#4a3a28";
  const eye = "#d8d0b0";
  const tooth = "#e8e6d9";
  // torso
  px(ctx, 6, 12, dark, 18, 12);
  px(ctx, 7, 11, hide, 16, 12);
  px(ctx, 8, 14, bark, 12, 6);
  // bark plates
  px(ctx, 9, 12, dark, 4, 2);
  px(ctx, 14, 13, dark, 5, 2);
  px(ctx, 10, 17, dark, 6, 2);
  // head
  px(ctx, 18, 8, hide, 10, 10);
  px(ctx, 20, 10, dark, 8, 7);
  px(ctx, 22, 12, hide, 6, 4);
  // pale eye
  px(ctx, 24, 11, eye, 2, 2);
  px(ctx, 24, 11, "#1a1814", 1, 1);
  // hooked teeth
  px(ctx, 26, 15, tooth, 1, 3);
  px(ctx, 28, 14, tooth, 1, 4);
  px(ctx, 27, 16, tooth, 1, 2);
  // ears
  px(ctx, 18, 6, dark, 3, 4);
  px(ctx, 22, 5, dark, 3, 5);
  // legs
  px(ctx, 8, 22, dark, 3, 6);
  px(ctx, 13, 23, dark, 3, 5);
  px(ctx, 17, 22, dark, 3, 6);
  px(ctx, 21, 23, dark, 3, 5);
  // tail
  px(ctx, 4, 14, bark, 3, 3);
  px(ctx, 2, 12, dark, 3, 3);
}

function paintSilhouette(
  ctx: CanvasRenderingContext2D,
  color: string,
  dark: string,
  shape: "mite" | "wisp",
  flash: boolean,
): void {
  const fill = flash ? "#f0e8d0" : color;
  const outline = flash ? "#a89870" : dark;
  if (shape === "mite") {
    // briar mite — spiky oval
    px(ctx, 10, 14, outline, 12, 10);
    px(ctx, 11, 13, fill, 10, 10);
    px(ctx, 12, 16, shadeHex(fill, 1.15), 8, 4);
    // thorns
    px(ctx, 9, 12, outline, 2, 3);
    px(ctx, 21, 12, outline, 2, 3);
    px(ctx, 14, 10, outline, 2, 3);
    px(ctx, 18, 11, outline, 2, 2);
    px(ctx, 12, 24, outline, 2, 3);
    px(ctx, 18, 24, outline, 2, 3);
  } else {
    // shade wisp — soft diamond / flame
    px(ctx, 14, 8, outline, 4, 4);
    px(ctx, 12, 12, outline, 8, 8);
    px(ctx, 10, 16, outline, 12, 8);
    px(ctx, 14, 9, fill, 4, 14);
    px(ctx, 12, 13, fill, 8, 10);
    px(ctx, 15, 12, "#c8b8e0", 2, 2);
    px(ctx, 14, 24, outline, 4, 4);
  }
}

function paintCreature(id: CreatureKindId, color: string, colorDark: string, flash: boolean): Sheet {
  const c = makeCanvas(CREATURE_FRAME, CREATURE_FRAME);
  const ctx = ctx2d(c);
  switch (id) {
    case "needle-rat":
      paintNeedleRat(ctx, flash);
      break;
    case "bark-hound":
      paintBarkHound(ctx, flash);
      break;
    case "briar-mite":
      paintSilhouette(ctx, color, colorDark, "mite", flash);
      break;
    case "shade-wisp":
      paintSilhouette(ctx, color, colorDark, "wisp", flash);
      break;
  }
  return c;
}

export function getCreatureSheet(
  id: CreatureKindId,
  color: string,
  colorDark: string,
  flash: boolean,
): Sheet {
  const key = `${id}|${color}|${flash ? 1 : 0}`;
  let sheet = cache.get(key);
  if (!sheet) {
    sheet = paintCreature(id, color, colorDark, flash);
    cache.set(key, sheet);
  }
  return sheet;
}

export function drawCreatureSprite(
  ctx: CanvasRenderingContext2D,
  id: CreatureKindId,
  color: string,
  colorDark: string,
  sx: number,
  sy: number,
  radius: number,
  flash: boolean,
): void {
  const sheet = getCreatureSheet(id, color, colorDark, flash);
  const size = Math.max(24, Math.min(48, Math.round(radius * 2.6)));
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    sheet as CanvasImageSource,
    Math.floor(sx - size / 2),
    Math.floor(sy - size / 2 - 2),
    size,
    size,
  );
}
