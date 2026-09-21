/**
 * Original creature pixel sprites for The Vale (gfx pass 3).
 * Needle Rat, Bark Hound, Ash-vole, Gorse Fox, Briar Mite, Shade Wisp,
 * Ashveil Ember — 4 walk/bob frames with pose changes. Cached sheets, not CipSoft.
 */
import { makeCanvas, ctx2d, px, shadeHex, drawSoftShadow, addPixelVolume, GROUND_SHADOW_ALPHA } from "@/game/gfx/canvasUtil";

export type CreatureKindId =
  | "briar-mite"
  | "needle-rat"
  | "bark-hound"
  | "shade-wisp"
  | "ash-vole"
  | "gorse-fox"
  | "ashveil-ember";

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

/**
 * Hollow boss — jagged coal-and-veil, not a scaled Shade Wisp diamond.
 * Paint order: smoke → hull → face/core/cracks → crown last so flames sit on top.
 */
function paintAshveilEmber(ctx: CanvasRenderingContext2D, flash: boolean, frame: number): void {
  const ashD = flash ? "#b0a088" : "#1a1218";
  const ash = flash ? "#d0c4a8" : "#3a3238";
  const ashL = flash ? "#e8dcc8" : "#6a5e68";
  const violet = flash ? "#ead8f4" : "#6a4a88";
  const violetH = flash ? "#f6ecff" : "#a078c8";
  const ember = flash ? "#ffe8c0" : "#e07030";
  const emberH = flash ? "#fff4d4" : "#f8a848";
  const heart = flash ? "#fffef6" : "#fff0c0";
  const crack = flash ? "#ffd090" : "#c04820";
  const spark = flash ? "#fff8e0" : "#ffd070";
  const rim = flash ? "#6a5840" : "#0c0a0c";
  const by = bobY(frame);
  const sway = frame === 1 ? 1 : frame === 3 ? -1 : 0;
  const pulse = frame === 1 || frame === 3 ? 1 : 0;
  const lick = frame === 2 ? 2 : pulse ? 1 : 0;

  // Rising ash columns (behind the body).
  px(ctx, 5 + sway, 11 + by, ash, 2, 5);
  px(ctx, 4 + sway, 7 + by - pulse, ashL, 2, 5);
  px(ctx, 3 + sway, 4 + by - pulse, ash, 1, 4);
  px(ctx, 26 + sway, 13 + by, ash, 2, 5);
  px(ctx, 27 + sway, 9 + by + pulse, ashL, 2, 4);
  px(ctx, 28 + sway, 6 + by, ash, 1, 3);

  // Irregular coal hull — offset chunks, not a smooth oval.
  px(ctx, 8 + sway, 12 + by, ashD, 16, 12);
  px(ctx, 7 + sway, 15 + by, ashD, 18, 8);
  px(ctx, 6 + sway, 17 + by, ashD, 3, 5);
  px(ctx, 5 + sway, 18 + by, ash, 2, 3);
  px(ctx, 23 + sway, 13 + by, ashD, 4, 8);
  px(ctx, 24 + sway, 12 + by, ash, 3, 4);
  px(ctx, 9 + sway, 13 + by, ash, 14, 10);
  px(ctx, 10 + sway, 14 + by, ashL, 5, 3);
  px(ctx, 16 + sway, 15 + by, ashL, 4, 2);
  px(ctx, 7 + sway, 15 + by, rim, 1, 8);
  px(ctx, 24 + sway, 13 + by, rim, 1, 8);

  // Hood / brow so it reads as a held spirit, not a lantern.
  px(ctx, 10 + sway, 10 + by, ashD, 12, 4);
  px(ctx, 11 + sway, 9 + by, ash, 10, 3);
  px(ctx, 12 + sway, 10 + by, ashL, 8, 2);
  px(ctx, 12 + sway, 11 + by, rim, 3, 1);
  px(ctx, 17 + sway, 11 + by, rim, 3, 1);
  px(ctx, 12 + sway, 12 + by, emberH, 2, 2);
  px(ctx, 18 + sway, 12 + by, emberH, 2, 2);
  px(ctx, 13 + sway, 12 + by, heart, 1, 1);
  px(ctx, 19 + sway, 12 + by, heart, 1, 1);

  // Thin violet halo around the held core (family flicker, not a wisp body).
  px(ctx, 11 + sway, 16 + by, violet, 10, 6);
  px(ctx, 12 + sway, 15 + by, violetH, 8, 2);
  if (pulse) {
    px(ctx, 8 + sway, 16 + by, violetH, 2, 2);
    px(ctx, 22 + sway, 17 + by, violet, 2, 2);
  }

  // Concentric ember heart.
  px(ctx, 13 + sway, 17 + by, ember, 6, 6);
  px(ctx, 14 + sway, 18 + by, emberH, 4, 4 + pulse);
  px(ctx, 15 + sway, 19 + by, heart, 2, 2 + pulse);

  // 1px coal fissures radiating from the heart.
  px(ctx, 11 + sway, 18 + by, crack, 2, 1);
  px(ctx, 10 + sway, 19 + by, crack, 1, 3);
  px(ctx, 19 + sway, 17 + by, crack, 2, 1);
  px(ctx, 21 + sway, 16 + by, ember, 1, 3);
  px(ctx, 15 + sway, 23 + by, crack, 2, 2);

  // Dripping ash skirt (grounded vs floating wisp).
  px(ctx, 9 + sway, 24 + by, ashD, 14, 2);
  px(ctx, 11 + sway, 26 + by, ash, 4, 2);
  px(ctx, 17 + sway, 26 + by, ash, 3, 3);
  px(ctx, 13 + sway, 27 + by, ashL, 2, 2);

  // Jagged flame crown LAST so the hood cannot bury it.
  px(ctx, 14 + sway, 6 + by - lick, ember, 4, 4);
  px(ctx, 15 + sway, 4 + by - lick, emberH, 2, 3);
  px(ctx, 15 + sway, 3 + by - lick, heart, 1, 2);
  px(ctx, 11 + sway, 7 + by, ember, 3, 3);
  px(ctx, 11 + sway, 6 + by, emberH, 2, 2);
  px(ctx, 19 + sway, 6 + by, ember, 3, 4);
  px(ctx, 20 + sway, 5 + by, emberH, 2, 2);
  if (pulse || lick) {
    px(ctx, 16 + sway, 2 + by - lick, spark, 1, 2);
    px(ctx, 10 + sway, 5 + by, spark, 1, 2);
    px(ctx, 22 + sway, 4 + by, spark, 1, 2);
  }

  // Orbiting sparks + cooler ash motes (wider path than the wisp).
  const mx = [4, 26, 6, 25][frame]!;
  const my = [20, 8, 6, 22][frame]!;
  px(ctx, mx, my + by, spark, 2, 2);
  const ax = [25, 5, 27, 4][frame]!;
  const ay = [11, 21, 17, 9][frame]!;
  px(ctx, ax, ay + by, ashL, 2, 2);
  if (frame === 1) px(ctx, 23 + sway, 20 + by, emberH, 2, 2);
  if (frame === 2) px(ctx, 16 + sway, 1 + by, emberH, 2, 2);
  if (frame === 3) px(ctx, 7 + sway, 20 + by, ember, 2, 2);
}

function paintAshVole(ctx: CanvasRenderingContext2D, flash: boolean, frame: number): void {
  const fur = flash ? "#d8d0c0" : "#7a7060";
  const dark = flash ? "#a89880" : "#2e2a22";
  const ash = flash ? "#c8c0b0" : "#5a5448";
  const dust = flash ? "#e0d8c8" : "#9a9080";
  const belly = flash ? "#ece4d4" : "#b8b0a0";
  const eye = "#c45c3e";
  const nose = "#1a1814";
  const claw = "#2a241c";
  const by = bobY(frame);
  const s = stride(frame);
  const ear = frame === 1 ? -1 : 0;
  const snuff = frame === 2 ? 1 : 0;
  const puff = frame === 1 || frame === 3;
  // chubby oval — lower and rounder than Needle Rat
  px(ctx, 8, 16 + by, dark, 14, 9);
  px(ctx, 9, 15 + by, fur, 13, 9);
  px(ctx, 10, 17 + by, ash, 10, 3);
  px(ctx, 11, 19 + by, belly, 9, 4);
  px(ctx, 12, 16 + by, dust, 6, 2);
  px(ctx, 14, 15 + by, ash, 3, 2);
  px(ctx, 17, 16 + by, ash, 2, 2);
  // blunt head / snout (incisors, not needles)
  px(ctx, 18, 13 + by, dark, 9, 9);
  px(ctx, 19, 14 + by, fur, 8, 7);
  px(ctx, 23, 16 + by + snuff, dark, 6, 5);
  px(ctx, 24, 17 + by + snuff, dust, 5, 3);
  px(ctx, 27, 18 + by + snuff, nose, 2, 2);
  px(ctx, 26, 19 + by + snuff, "#e8e0d0", 1, 1);
  px(ctx, 27, 19 + by + snuff, "#e8e0d0", 1, 2);
  // whiskers
  px(ctx, 24, 16 + by, dust, 5, 1);
  px(ctx, 24, 20 + by, "#c8c0b0", 4, 1);
  // round ear
  px(ctx, 18, 11 + by + ear, dark, 4, 4);
  px(ctx, 19, 11 + by + ear, fur, 2, 3);
  px(ctx, 20, 12 + by, ash, 2, 2);
  // eye + brow
  px(ctx, 21, 15 + by, dark, 3, 2);
  px(ctx, 22, 15 + by, eye, 2, 2);
  px(ctx, 23, 15 + by, "#f0e8d8", 1, 1);
  // short legs — vole shuffle
  const liftF = frame === 1 ? -1 : 0;
  const liftB = frame === 3 ? -1 : 0;
  px(ctx, 11 + s, 24 + by + liftB, claw, 2, 3 - liftB);
  px(ctx, 15 - s, 25 + by + liftF, claw, 2, 2 - liftF);
  px(ctx, 19 + s, 24 + by + liftB, claw, 2, 3 - liftB);
  px(ctx, 22 - s, 25 + by + liftF, claw, 2, 2 - liftF);
  px(ctx, 11 + s, 26 + by, dark, 2, 1);
  px(ctx, 19 + s, 26 + by, dark, 2, 1);
  // stub tail
  px(ctx, 6, 19 + by, dark, 3, 3);
  px(ctx, 5, 17 + by, fur, 3, 3);
  px(ctx, 5, 16 + by, ash, 2, 2);
  // outline hint
  px(ctx, 8, 16 + by, "#1a1814", 1, 8);
  // ash dust puff on the stride
  if (puff) {
    px(ctx, 10 + s, 27 + by, dust, 2, 1);
    px(ctx, 8 + s, 26 + by, ash, 1, 1);
  }
}

function paintGorseFox(ctx: CanvasRenderingContext2D, flash: boolean, frame: number): void {
  const hide = flash ? "#e8d0b0" : "#c07830";
  const dark = flash ? "#a88860" : "#4a2c14";
  const rust = flash ? "#d8b070" : "#8a4a1c";
  const gorse = flash ? "#d0c890" : "#a8b048";
  const gorseDark = flash ? "#a89860" : "#6a7028";
  const chest = flash ? "#f0e0c8" : "#e8d0a8";
  const sock = flash ? "#5a4030" : "#2a1c10";
  const eye = "#1a1814";
  const gleam = "#d4a060";
  const by = bobY(frame);
  const s = stride(frame);
  const hack = frame === 2 ? -1 : 0;
  const tw = frame === 1 ? 1 : frame === 3 ? -1 : 0;
  // lean torso — brighter rust than Bark Hound hide
  px(ctx, 6, 14 + by, dark, 17, 10);
  px(ctx, 7, 13 + by, hide, 16, 10);
  px(ctx, 8, 16 + by, rust, 12, 5);
  px(ctx, 9, 17 + by, chest, 10, 5);
  px(ctx, 11, 14 + by, rust, 6, 2);
  // head / pointed muzzle
  px(ctx, 18, 8 + by, hide, 10, 10);
  px(ctx, 20, 10 + by, dark, 9, 8);
  px(ctx, 22, 12 + by, hide, 7, 5);
  px(ctx, 24, 13 + by, chest, 5, 3);
  px(ctx, 27, 14 + by, dark, 2, 2);
  px(ctx, 22, 11 + by, gleam, 2, 2);
  px(ctx, 23, 11 + by, eye, 2, 2);
  px(ctx, 24, 11 + by, "#f0e8d0", 1, 1);
  // small canines (not Bark Hound hooks)
  const jaw = frame === 1 || frame === 2 ? 1 : 0;
  px(ctx, 26, 16 + by + jaw, "#f0eee4", 1, 2);
  px(ctx, 27, 16 + by + jaw, "#f0eee4", 1, 2);
  // pointed ears
  px(ctx, 18, 4 + by + hack, dark, 3, 5);
  px(ctx, 19, 5 + by, hide, 2, 3);
  px(ctx, 19, 6 + by, "#8a4030", 1, 2);
  px(ctx, 22, 3 + by + hack, dark, 3, 6);
  px(ctx, 23, 4 + by, hide, 2, 4);
  px(ctx, 23, 5 + by, "#8a4030", 1, 2);
  // black socks + lifted paws
  const liftL = frame === 1 ? -2 : 0;
  const liftR = frame === 3 ? -2 : 0;
  px(ctx, 8 + s, 22 + by + liftL, dark, 2, 6 - liftL);
  px(ctx, 12 - s, 23 + by + liftR, dark, 2, 5 - liftR);
  px(ctx, 16 + s, 22 + by + liftL, dark, 2, 6 - liftL);
  px(ctx, 20 - s, 23 + by + liftR, dark, 2, 5 - liftR);
  px(ctx, 8 + s, 26 + by, sock, 2, 2);
  px(ctx, 16 + s, 26 + by, sock, 2, 2);
  px(ctx, 12 - s, 26 + by, sock, 2, 2);
  px(ctx, 20 - s, 26 + by, sock, 2, 2);
  // bushy gorse-bristle tail (the tell)
  px(ctx, 4, 14 + by, hide, 4, 5);
  px(ctx, 2, 12 + by - tw, rust, 4, 5);
  px(ctx, 1, 9 + by - tw, gorseDark, 4, 5);
  px(ctx, 0, 7 + by - tw, gorse, 3, 4);
  px(ctx, 1, 8 + by - tw, gorse, 2, 2);
  px(ctx, 3, 10 + by, gorse, 2, 2);
  px(ctx, 2, 13 + by, gorseDark, 2, 2);
  if (frame % 2 === 1) {
    px(ctx, 0, 6 + by - tw, gorse, 2, 2);
    px(ctx, 4, 9 + by, gorse, 1, 2);
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
    case "ash-vole":
      paintAshVole(ctx, flash, f);
      break;
    case "gorse-fox":
      paintGorseFox(ctx, flash, f);
      break;
    case "ashveil-ember":
      paintAshveilEmber(ctx, flash, f);
      break;
    default:
      px(ctx, 10, 14, colorDark, 12, 10);
      px(ctx, 11, 13, color, 10, 10);
      break;
  }
  if (id !== "shade-wisp" && id !== "ashveil-ember") {
    addPixelVolume(ctx, CREATURE_FRAME, CREATURE_FRAME, 0.11, 0.15);
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
  const ember = id === "ashveil-ember";
  const size = ember
    ? Math.max(40, Math.min(64, Math.round(radius * 3.4)))
    : Math.max(28, Math.min(56, Math.round(radius * 3.1)));
  drawSoftShadow(
    ctx,
    sx,
    sy + size * 0.34,
    size * (ember ? 0.42 : 0.36),
    size * (ember ? 0.15 : 0.13),
    flash ? 0.2 : ember ? 0.46 : GROUND_SHADOW_ALPHA,
  );
  if (ember) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const glowR = size * 0.55;
    const g = ctx.createRadialGradient(sx, sy + 3, 2, sx, sy + 3, glowR);
    g.addColorStop(0, flash ? "rgba(255,230,170,0.38)" : "rgba(255,140,50,0.24)");
    g.addColorStop(0.45, flash ? "rgba(210,90,170,0.14)" : "rgba(140,60,180,0.11)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sx, sy + 2, glowR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
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
  "ash-vole",
  "gorse-fox",
  "ashveil-ember",
];

export function warmCreatureSheets(): void {
  for (const id of CREATURE_IDS) {
    for (let f = 0; f < CREATURE_WALK_FRAMES; f++) {
      getCreatureSheet(id, "#888888", "#444444", false, f);
      getCreatureSheet(id, "#888888", "#444444", true, f);
    }
  }
}
