/**
 * Original creature pixel sprites for The Vale.
 * Needle Rat + Bark Hound + detailed Briar Mite / Shade Wisp.
 * Walk/bob frames cached as OffscreenCanvas / canvas sheets — not redrawn every frame.
 * NOT CipSoft / Tibia assets.
 */
import { makeCanvas, ctx2d, px, shadeHex, drawSoftShadow } from "@/game/gfx/canvasUtil";

/** Mirror of enemy kind ids (avoid circular import with enemies.ts). */
export type CreatureKindId =
  | "briar-mite"
  | "needle-rat"
  | "bark-hound"
  | "shade-wisp";

export const CREATURE_FRAME = 32;
export const CREATURE_WALK_FRAMES = 4;

type Sheet = HTMLCanvasElement | OffscreenCanvas;
const cache = new Map<string, Sheet>();

/** Shared anim clock → walk frame (idle breathes slowly; moving steps faster). */
export function creatureWalkFrame(animT: number, moving: boolean): number {
  if (!moving) {
    // gentle bob: mostly frame 0, occasional 1
    return Math.floor(animT * 1.6) % 2 === 0 ? 0 : 1;
  }
  return Math.floor(animT * 8) % CREATURE_WALK_FRAMES;
}

function bobY(frame: number): number {
  return frame === 1 || frame === 3 ? -1 : 0;
}

function stride(frame: number): number {
  return frame === 1 ? 1 : frame === 3 ? -1 : 0;
}

function paintNeedleRat(ctx: CanvasRenderingContext2D, flash: boolean, frame: number): void {
  const fur = flash ? "#e8e0d0" : "#7a6a5a";
  const dark = flash ? "#a89880" : "#3a3028";
  const belly = flash ? "#d8d0c0" : "#9a8a78";
  const tooth = "#e8e6d9";
  const eye = "#c45c3e";
  const by = bobY(frame);
  const s = stride(frame);
  // body
  px(ctx, 8, 14 + by, dark, 16, 10);
  px(ctx, 9, 13 + by, fur, 14, 10);
  px(ctx, 10, 16 + by, belly, 10, 5);
  // head / snout
  px(ctx, 20, 12 + by, fur, 8, 8);
  px(ctx, 24, 14 + by, dark, 6, 5);
  px(ctx, 26, 15 + by, belly, 4, 3);
  // needle teeth
  px(ctx, 28, 16 + by, tooth, 1, 2);
  px(ctx, 29, 15 + by, tooth, 1, 3);
  px(ctx, 30, 16 + by, tooth, 1, 2);
  px(ctx, 27, 17 + by, tooth, 1, 2);
  // ear
  px(ctx, 20, 10 + by, dark, 3, 3);
  px(ctx, 21, 10 + by, fur, 2, 2);
  // eye
  px(ctx, 24, 13 + by, eye, 2, 2);
  // legs (stride)
  px(ctx, 10 + s, 22 + by, dark, 2, 4);
  px(ctx, 14 - s, 23 + by, dark, 2, 3);
  px(ctx, 18 + s, 22 + by, dark, 2, 4);
  px(ctx, 22 - s, 23 + by, dark, 2, 3);
  // tail
  px(ctx, 6, 16 + by, dark, 3, 2);
  px(ctx, 4, 14 + by, dark, 3, 2);
  px(ctx, 3, 12 + by, fur, 2, 2);
  // outline hints
  px(ctx, 8, 13 + by, "#1a1814", 1, 10);
  px(ctx, 23, 22 + by, "#1a1814", 1, 4);
}

function paintBarkHound(ctx: CanvasRenderingContext2D, flash: boolean, frame: number): void {
  const hide = flash ? "#e0d8c0" : "#6a5a3a";
  const dark = flash ? "#908060" : "#2a2418";
  const bark = flash ? "#c8b890" : "#4a3a28";
  const eye = "#d8d0b0";
  const tooth = "#e8e6d9";
  const by = bobY(frame);
  const s = stride(frame);
  // torso
  px(ctx, 6, 12 + by, dark, 18, 12);
  px(ctx, 7, 11 + by, hide, 16, 12);
  px(ctx, 8, 14 + by, bark, 12, 6);
  // bark plates
  px(ctx, 9, 12 + by, dark, 4, 2);
  px(ctx, 14, 13 + by, dark, 5, 2);
  px(ctx, 10, 17 + by, dark, 6, 2);
  // head
  px(ctx, 18, 8 + by, hide, 10, 10);
  px(ctx, 20, 10 + by, dark, 8, 7);
  px(ctx, 22, 12 + by, hide, 6, 4);
  // pale eye
  px(ctx, 24, 11 + by, eye, 2, 2);
  px(ctx, 24, 11 + by, "#1a1814", 1, 1);
  // hooked teeth
  px(ctx, 26, 15 + by, tooth, 1, 3);
  px(ctx, 28, 14 + by, tooth, 1, 4);
  px(ctx, 27, 16 + by, tooth, 1, 2);
  // ears
  px(ctx, 18, 6 + by, dark, 3, 4);
  px(ctx, 22, 5 + by, dark, 3, 5);
  // legs
  px(ctx, 8 + s, 22 + by, dark, 3, 6);
  px(ctx, 13 - s, 23 + by, dark, 3, 5);
  px(ctx, 17 + s, 22 + by, dark, 3, 6);
  px(ctx, 21 - s, 23 + by, dark, 3, 5);
  // tail
  px(ctx, 4, 14 + by, bark, 3, 3);
  px(ctx, 2, 12 + by, dark, 3, 3);
}

function paintBriarMite(ctx: CanvasRenderingContext2D, flash: boolean, frame: number): void {
  const shell = flash ? "#e0d8b8" : "#5a6a3a";
  const dark = flash ? "#a89870" : "#2a3018";
  const thorn = flash ? "#c8b890" : "#3a4820";
  const belly = flash ? "#d0c8a8" : "#8a9a58";
  const eye = "#c45c3e";
  const by = bobY(frame);
  const s = stride(frame);
  // body oval
  px(ctx, 10, 14 + by, dark, 12, 10);
  px(ctx, 11, 13 + by, shell, 10, 10);
  px(ctx, 12, 16 + by, belly, 8, 4);
  // ridge
  px(ctx, 14, 14 + by, dark, 4, 2);
  px(ctx, 13, 15 + by, thorn, 6, 2);
  // thorns / spikes
  px(ctx, 9, 12 + by, thorn, 2, 3);
  px(ctx, 21, 12 + by, thorn, 2, 3);
  px(ctx, 14, 10 + by, dark, 2, 3);
  px(ctx, 14, 9 + by, thorn, 2, 2);
  px(ctx, 18, 11 + by, thorn, 2, 2);
  px(ctx, 12, 11 + by, thorn, 2, 2);
  // mandibles
  px(ctx, 20, 18 + by, dark, 3, 2);
  px(ctx, 22, 19 + by, "#e8e6d9", 1, 2);
  px(ctx, 9, 18 + by, dark, 3, 2);
  px(ctx, 9, 19 + by, "#e8e6d9", 1, 2);
  // eye
  px(ctx, 18, 15 + by, eye, 2, 2);
  // legs
  px(ctx, 11 + s, 23 + by, dark, 2, 3);
  px(ctx, 15 - s, 24 + by, dark, 2, 2);
  px(ctx, 19 + s, 23 + by, dark, 2, 3);
  px(ctx, 12, 24 + by, dark, 2, 3);
  px(ctx, 18, 24 + by, dark, 2, 3);
}

function paintShadeWisp(ctx: CanvasRenderingContext2D, flash: boolean, frame: number): void {
  const core = flash ? "#f0e8d8" : "#6a5a88";
  const glow = flash ? "#d8d0c0" : "#9a88c0";
  const dark = flash ? "#a89880" : "#2a2038";
  const eye = "#e8e0f0";
  const by = bobY(frame);
  const sway = stride(frame);
  // flame / diamond body
  px(ctx, 14 + sway, 8 + by, dark, 4, 4);
  px(ctx, 12 + sway, 12 + by, dark, 8, 8);
  px(ctx, 10 + sway, 16 + by, dark, 12, 8);
  px(ctx, 14 + sway, 9 + by, core, 4, 14);
  px(ctx, 12 + sway, 13 + by, glow, 8, 10);
  px(ctx, 13 + sway, 15 + by, shadeHex(glow, 1.2), 6, 6);
  // bright mote
  px(ctx, 15 + sway, 12 + by, eye, 2, 2);
  // trailing wisps
  px(ctx, 14 + sway, 24 + by, dark, 4, 4);
  px(ctx, 12 + sway, 26 + by, core, 2, 3);
  px(ctx, 18 + sway, 25 + by, glow, 2, 2);
  if (frame % 2 === 1) {
    px(ctx, 10 + sway, 22 + by, glow, 2, 2);
    px(ctx, 20 + sway, 21 + by, core, 2, 2);
  }
}

function paintCreature(
  id: CreatureKindId,
  color: string,
  colorDark: string,
  flash: boolean,
  frame: number,
): Sheet {
  const c = makeCanvas(CREATURE_FRAME, CREATURE_FRAME);
  const ctx = ctx2d(c);
  const f = ((frame % CREATURE_WALK_FRAMES) + CREATURE_WALK_FRAMES) % CREATURE_WALK_FRAMES;
  switch (id) {
    case "needle-rat":
      paintNeedleRat(ctx, flash, f);
      break;
    case "bark-hound":
      paintBarkHound(ctx, flash, f);
      break;
    case "briar-mite":
      paintBriarMite(ctx, flash, f);
      break;
    case "shade-wisp":
      paintShadeWisp(ctx, flash, f);
      break;
    default: {
      // fallback tinted blob using kind colors
      px(ctx, 10, 14, colorDark, 12, 10);
      px(ctx, 11, 13, color, 10, 10);
      break;
    }
  }
  return c;
}

export function getCreatureSheet(
  id: CreatureKindId,
  color: string,
  colorDark: string,
  flash: boolean,
  frame = 0,
): Sheet {
  const f = ((frame % CREATURE_WALK_FRAMES) + CREATURE_WALK_FRAMES) % CREATURE_WALK_FRAMES;
  const key = `${id}|${color}|${flash ? 1 : 0}|f${f}`;
  let sheet = cache.get(key);
  if (!sheet) {
    sheet = paintCreature(id, color, colorDark, flash, f);
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
  frame = 0,
): void {
  const sheet = getCreatureSheet(id, color, colorDark, flash, frame);
  const size = Math.max(24, Math.min(48, Math.round(radius * 2.6)));
  drawSoftShadow(ctx, sx, sy + size * 0.28, size * 0.32, size * 0.12, flash ? 0.2 : 0.34);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    sheet as CanvasImageSource,
    Math.floor(sx - size / 2),
    Math.floor(sy - size / 2 - 2),
    size,
    size,
  );
}
