/**
 * Original creature pixel sprites for The Vale (gfx pass 3).
 * Needle Rat, Bark Hound, Briar Mite, Shade Wisp — 4 walk/bob frames with
 * pose changes (legs, tail, mandibles, flame). Cached sheets, not CipSoft.
 */
import { makeCanvas, ctx2d, px, shadeHex, drawSoftShadow } from "@/game/gfx/canvasUtil";

export type CreatureKindId =
  | "briar-mite"
  | "needle-rat"
  | "bark-hound"
  | "shade-wisp";

export const CREATURE_FRAME = 32;
export const CREATURE_WALK_FRAMES = 4;

type Sheet = HTMLCanvasElement | OffscreenCanvas;
const cache = new Map<string, Sheet>();

export function creatureWalkFrame(animT: number, moving: boolean): number {
  if (!moving) {
    return Math.floor(animT * 2.2) % 2 === 0 ? 0 : 1;
  }
  return Math.floor(animT * 9) % CREATURE_WALK_FRAMES;
}

function bobY(frame: number): number {
  return frame === 1 || frame === 3 ? -1 : 0;
}

function stride(frame: number): number {
  return frame === 1 ? 2 : frame === 3 ? -2 : 0;
}

function paintNeedleRat(ctx: CanvasRenderingContext2D, flash: boolean, frame: number): void {
  const fur = flash ? "#e8e0d0" : "#7a6a5a";
  const dark = flash ? "#a89880" : "#3a3028";
  const belly = flash ? "#d8d0c0" : "#a89880";
  const ridge = flash ? "#c8b8a0" : "#5a4a3c";
  const tooth = "#f0eee4";
  const eye = "#c45c3e";
  const claw = "#2a241c";
  const by = bobY(frame);
  const s = stride(frame);
  const tail = frame === 1 ? -1 : frame === 3 ? 1 : 0;
  const jaw = frame === 2 ? 1 : 0;
  // body
  px(ctx, 7, 14 + by, dark, 17, 11);
  px(ctx, 8, 13 + by, fur, 15, 11);
  px(ctx, 9, 16 + by, belly, 11, 6);
  px(ctx, 10, 14 + by, ridge, 10, 2);
  px(ctx, 12, 13 + by, dark, 2, 2);
  px(ctx, 16, 13 + by, dark, 2, 2);
  // head / snout
  px(ctx, 19, 11 + by, dark, 10, 10);
  px(ctx, 20, 12 + by, fur, 9, 8);
  px(ctx, 24, 14 + by, dark, 7, 6);
  px(ctx, 26, 15 + by, belly, 5, 4);
  // needle teeth
  px(ctx, 28, 16 + by + jaw, tooth, 1, 3);
  px(ctx, 29, 15 + by + jaw, tooth, 1, 4);
  px(ctx, 30, 16 + by + jaw, tooth, 1, 3);
  px(ctx, 27, 17 + by + jaw, tooth, 1, 2);
  // whiskers
  px(ctx, 26, 14 + by, "#d8d0c0", 4, 1);
  px(ctx, 26, 18 + by, "#d8d0c0", 3, 1);
  // ear twitch
  const ear = frame === 1 ? -1 : 0;
  px(ctx, 19, 8 + by + ear, dark, 4, 5);
  px(ctx, 20, 8 + by + ear, fur, 2, 4);
  px(ctx, 22, 9 + by, dark, 3, 3);
  // eye + brow
  px(ctx, 23, 13 + by, dark, 3, 2);
  px(ctx, 24, 13 + by, eye, 2, 2);
  px(ctx, 25, 13 + by, "#f0e8d8", 1, 1);
  // legs
  px(ctx, 9 + s, 23 + by, claw, 2, 5);
  px(ctx, 13 - s, 24 + by, claw, 2, 4);
  px(ctx, 17 + s, 23 + by, claw, 2, 5);
  px(ctx, 21 - s, 24 + by, claw, 2, 4);
  px(ctx, 9 + s, 27 + by, dark, 2, 1);
  px(ctx, 17 + s, 27 + by, dark, 2, 1);
  // tail lash
  px(ctx, 5, 16 + by + tail, dark, 4, 3);
  px(ctx, 3, 14 + by + tail, dark, 3, 3);
  px(ctx, 2, 11 + by, fur, 3, 4);
  px(ctx, 1, 9 + by - tail, ridge, 2, 3);
  px(ctx, 7, 13 + by, "#1a1814", 1, 11);
}

function paintBarkHound(ctx: CanvasRenderingContext2D, flash: boolean, frame: number): void {
  const hide = flash ? "#e0d8c0" : "#6a5a3a";
  const dark = flash ? "#908060" : "#2a2418";
  const bark = flash ? "#c8b890" : "#4a3a28";
  const plate = flash ? "#a09070" : "#3a2c1c";
  const eye = "#e8e0c8";
  const tooth = "#f0eee4";
  const by = bobY(frame);
  const s = stride(frame);
  const hack = frame === 2 ? -1 : 0;
  // torso
  px(ctx, 5, 12 + by, dark, 19, 13);
  px(ctx, 6, 11 + by, hide, 17, 13);
  px(ctx, 7, 14 + by, bark, 13, 7);
  // bark plates
  px(ctx, 8, 12 + by + hack, plate, 5, 3);
  px(ctx, 14, 11 + by + hack, dark, 6, 3);
  px(ctx, 9, 16 + by, plate, 7, 2);
  px(ctx, 12, 18 + by, dark, 5, 2);
  // head
  px(ctx, 17, 7 + by, hide, 12, 12);
  px(ctx, 19, 9 + by, dark, 10, 9);
  px(ctx, 21, 11 + by, hide, 8, 6);
  px(ctx, 24, 13 + by, bark, 5, 4);
  px(ctx, 23, 10 + by, eye, 3, 3);
  px(ctx, 24, 11 + by, "#1a1814", 1, 1);
  px(ctx, 25, 10 + by, "#f8f4e8", 1, 1);
  // snarl
  const jaw = frame === 1 || frame === 2 ? 1 : 0;
  px(ctx, 26, 15 + by + jaw, tooth, 1, 4);
  px(ctx, 28, 14 + by + jaw, tooth, 1, 5);
  px(ctx, 27, 16 + by + jaw, tooth, 1, 3);
  px(ctx, 29, 16 + by, dark, 2, 3);
  // ears
  px(ctx, 17, 4 + by + hack, dark, 4, 6);
  px(ctx, 18, 4 + by, hide, 2, 4);
  px(ctx, 22, 3 + by + hack, dark, 4, 7);
  px(ctx, 23, 4 + by, hide, 2, 4);
  // legs — lifted paw on stride
  const liftL = frame === 1 ? -2 : 0;
  const liftR = frame === 3 ? -2 : 0;
  px(ctx, 7 + s, 22 + by + liftL, dark, 3, 7 - liftL);
  px(ctx, 12 - s, 23 + by + liftR, dark, 3, 6 - liftR);
  px(ctx, 16 + s, 22 + by + liftL, dark, 3, 7 - liftL);
  px(ctx, 21 - s, 23 + by + liftR, dark, 3, 6 - liftR);
  px(ctx, 7 + s, 28 + by, plate, 3, 1);
  px(ctx, 16 + s, 28 + by, plate, 3, 1);
  // tail
  const tw = frame === 3 ? 1 : 0;
  px(ctx, 3, 14 + by, bark, 4, 4);
  px(ctx, 1, 11 + by - tw, dark, 4, 4);
  px(ctx, 0, 8 + by, plate, 3, 4);
}

function paintBriarMite(ctx: CanvasRenderingContext2D, flash: boolean, frame: number): void {
  const shell = flash ? "#e0d8b8" : "#5a6a3a";
  const dark = flash ? "#a89870" : "#2a3018";
  const thorn = flash ? "#c8b890" : "#3a4820";
  const belly = flash ? "#d0c8a8" : "#8a9a58";
  const eye = "#c45c3e";
  const by = bobY(frame);
  const s = stride(frame);
  const open = frame % 2 === 1 ? 1 : 0;
  // segmented body
  px(ctx, 9, 13 + by, dark, 14, 12);
  px(ctx, 10, 12 + by, shell, 12, 12);
  px(ctx, 11, 15 + by, belly, 10, 5);
  px(ctx, 12, 13 + by, dark, 8, 2);
  px(ctx, 13, 18 + by, thorn, 6, 2);
  px(ctx, 14, 14 + by, shadeHex(shell, 1.2), 4, 3);
  // thorn crown
  px(ctx, 8, 10 + by, thorn, 2, 4);
  px(ctx, 14, 8 + by, dark, 3, 5);
  px(ctx, 14, 7 + by, thorn, 3, 3);
  px(ctx, 21, 10 + by, thorn, 2, 4);
  px(ctx, 11, 10 + by, thorn, 2, 3);
  px(ctx, 18, 9 + by, thorn, 2, 4);
  // mandibles
  px(ctx, 21 + open, 17 + by, dark, 4, 3);
  px(ctx, 24 + open, 18 + by, "#e8e6d9", 1, 3);
  px(ctx, 7 - open, 17 + by, dark, 4, 3);
  px(ctx, 7 - open, 18 + by, "#e8e6d9", 1, 3);
  // eye
  px(ctx, 17, 14 + by, eye, 3, 3);
  px(ctx, 18, 14 + by, "#f0d0c0", 1, 1);
  // six legs
  px(ctx, 10 + s, 23 + by, dark, 2, 4);
  px(ctx, 14 - s, 24 + by, dark, 2, 3);
  px(ctx, 18 + s, 23 + by, dark, 2, 4);
  px(ctx, 8 - s, 20 + by, dark, 3, 2);
  px(ctx, 21 + s, 20 + by, dark, 3, 2);
  px(ctx, 12, 25 + by, dark, 2, 3);
  px(ctx, 18, 25 + by, dark, 2, 3);
}

function paintShadeWisp(ctx: CanvasRenderingContext2D, flash: boolean, frame: number): void {
  const core = flash ? "#f0e8d8" : "#6a5a88";
  const glow = flash ? "#d8d0c0" : "#9a88c0";
  const dark = flash ? "#a89880" : "#2a2038";
  const hot = flash ? "#fff8e8" : "#e8e0f8";
  const by = bobY(frame) - (frame === 2 ? 1 : 0);
  const sway = stride(frame);
  const pulse = frame === 1 || frame === 3 ? 1 : 0;
  // outer flame
  px(ctx, 14 + sway, 6 + by, dark, 4, 5);
  px(ctx, 12 + sway, 10 + by, dark, 8, 8);
  px(ctx, 10 + sway, 16 + by, dark, 12, 9);
  px(ctx, 13 + sway, 8 + by, core, 6, 16);
  px(ctx, 11 + sway, 12 + by, glow, 10, 12);
  px(ctx, 13 + sway, 14 + by, shadeHex(glow, 1.25), 6, 7);
  px(ctx, 15 + sway, 11 + by, hot, 2 + pulse, 3);
  // inner eye
  px(ctx, 15 + sway, 16 + by, "#1a1020", 2, 2);
  px(ctx, 15 + sway, 15 + by, hot, 2, 1);
  // trailing wisps
  px(ctx, 14 + sway, 24 + by, dark, 4, 5);
  px(ctx, 12 + sway - pulse, 26 + by, core, 2, 4);
  px(ctx, 18 + sway + pulse, 25 + by, glow, 2, 4);
  if (frame % 2 === 1) {
    px(ctx, 8 + sway, 18 + by, glow, 2, 3);
    px(ctx, 22 + sway, 17 + by, core, 2, 3);
    px(ctx, 16 + sway, 4 + by, hot, 1, 2);
  }
  // orbiting motes
  const mx = [8, 22, 10, 21][frame]!;
  const my = [12, 14, 20, 10][frame]!;
  px(ctx, mx + sway, my + by, hot, 2, 2);
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
    default:
      px(ctx, 10, 14, colorDark, 12, 10);
      px(ctx, 11, 13, color, 10, 10);
      break;
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
  drawSoftShadow(ctx, sx, sy + size * 0.28, size * 0.34, size * 0.13, flash ? 0.2 : 0.38);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    sheet as CanvasImageSource,
    Math.floor(sx - size / 2),
    Math.floor(sy - size / 2 - 2),
    size,
    size,
  );
}

const CREATURE_IDS: CreatureKindId[] = [
  "briar-mite",
  "needle-rat",
  "bark-hound",
  "shade-wisp",
];

export function warmCreatureSheets(): void {
  for (const id of CREATURE_IDS) {
    for (let f = 0; f < CREATURE_WALK_FRAMES; f++) {
      getCreatureSheet(id, "#888888", "#444444", false, f);
      getCreatureSheet(id, "#888888", "#444444", true, f);
    }
  }
}
