/**
 * Procedural 4×4 class walk sheets — chunky outlined pixel figures
 * (original Vale art, Tibia-adjacent proportions — NOT CipSoft sprites).
 * Pass 5: eased contact–pass walk, hair sway, cloak lag, form volume.
 * Pathfinder: hooded reed-cloak, recurve bow, and fletched quiver.
 */
import type { ClassId } from "@/game/classes";
import { makeCanvas, ctx2d, px, shadeHex, paintVolume as paintVolumeBlock, addPixelVolume } from "@/game/gfx/canvasUtil";

function paintVolume(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  highlight = 1.2,
  shade = 0.74,
): void {
  paintVolumeBlock(ctx, x, y, w, h, fill, highlight, shade, true);
}

export const FRAME = 32;
export const COLS = 4;
export const ROWS = 4;
export const SHEET = FRAME * COLS;

type Facing = "south" | "west" | "east" | "north";
const FACINGS: Facing[] = ["south", "west", "east", "north"];

const P: Record<ClassId, { a: string; b: string; c: string; hair: string }> = {
  pathfinder: { a: "#3d7a45", b: "#2a5530", c: "#c9a227", hair: "#3a3028" },
  thornblade: { a: "#c45c3e", b: "#7a3018", c: "#e8e6d9", hair: "#2a1810" },
  hearthmage: { a: "#c97a2a", b: "#7a4510", c: "#e8b86a", hair: "#4a3020" },
  verdant: { a: "#5a9e4a", b: "#3e6a28", c: "#b8e090", hair: "#3a4830" },
  hollowborn: { a: "#8a7a9e", b: "#4a3e5c", c: "#c4b8d8", hair: "#2a2438" },
  warden: { a: "#6b8cae", b: "#3a5570", c: "#e8e6d9", hair: "#3a3028" },
};

const SKIN = "#d4a574";
const SKIN_D = "#b07a50";
const SKIN_H = "#c4b8c8";
const SKIN_H_D = "#8a7a90";
const BOOT = "#2a2218";
const OUT = "#0e0c0a";
const STEEL = "#8a929a";
const STEEL_D = "#5a6268";
const STEEL_L = "#c4ccd0";
const WOOD = "#6b4423";
const EYE = "#1a1410";
const EYE_W = "#f4eee4";

function skinOf(id: ClassId): { lite: string; dark: string } {
  return id === "hollowborn" ? { lite: SKIN_H, dark: SKIN_H_D } : { lite: SKIN, dark: SKIN_D };
}

/** Contact, rise, passing hold, settle. Frame 0 is the idle pose. */
function bob(frame: number): number {
  return [0, -1, -1, 0][frame] ?? 0;
}
/** Mild stance through the stride — no ±4px pop between poses. */
function spread(frame: number): number {
  return [1, 2, -1, -2][frame] ?? 0;
}
function armSwing(frame: number): number {
  return [0, 2, -1, -2][frame] ?? 0;
}
function footLift(frame: number, left: boolean): number {
  if (left) return frame === 1 ? -2 : 0;
  return frame === 3 ? -2 : 0;
}
/** Side locks drift a beat off the stride. Skull stays with the torso. */
function hairSway(frame: number): number {
  return [0, -1, 0, 1][frame] ?? 0;
}
/**
 * Loose cloth world Y. Hangs while the torso is up, follows through on the landing.
 * Fitted hoods and hats stay on `bob`.
 */
function clothY(frame: number): number {
  return [0, 0, 0, 1][frame] ?? 0;
}

function outlined(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
): void {
  px(ctx, x - 1, y - 1, OUT, w + 2, h + 2);
  px(ctx, x, y, fill, w, h);
}

function outlinedVolume(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  highlight = 1.2,
  shade = 0.74,
): void {
  outlined(ctx, x, y, w, h, fill);
  paintVolume(ctx, x, y, w, h, fill, highlight, shade);
}

function drawFace(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  facing: Facing,
  skin: { lite: string; dark: string },
): void {
  if (facing === "north") return;
  if (facing === "south") {
    px(ctx, cx - 3, cy - 3, "#2a2018", 2, 1);
    px(ctx, cx + 1, cy - 3, "#2a2018", 2, 1);
    px(ctx, cx - 3, cy - 2, EYE, 2, 2);
    px(ctx, cx + 1, cy - 2, EYE, 2, 2);
    px(ctx, cx - 3, cy - 2, EYE_W, 1, 1);
    px(ctx, cx + 1, cy - 2, EYE_W, 1, 1);
    px(ctx, cx - 1, cy, skin.dark, 2, 1);
    px(ctx, cx - 1, cy + 2, "#8a5a40", 2, 1);
    return;
  }
  const s = facing === "west" ? -1 : 1;
  px(ctx, cx + s * 4, cy - 2, skin.lite, 2, 3);
  px(ctx, cx + s * 5, cy - 1, skin.dark, 1, 2);
  px(ctx, cx + s, cy - 2, EYE, 2, 2);
  px(ctx, cx + s, cy - 2, EYE_W, 1, 1);
  px(ctx, cx + s * 2, cy + 2, "#8a5a40", 2, 1);
}

function drawHead(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  facing: Facing,
  hair: string,
  skin: { lite: string; dark: string } = { lite: SKIN, dark: SKIN_D },
  sway = 0,
): void {
  outlinedVolume(ctx, cx - 4, cy - 5, 8, 8, skin.lite, 1.16, 0.78);
  if (facing === "south" || facing === "north") {
    px(ctx, cx - 6, cy - 3, skin.lite, 2, 3);
    px(ctx, cx + 4, cy - 3, skin.lite, 2, 3);
  }
  if (facing === "north") {
    px(ctx, cx - 4, cy - 6, hair, 8, 7);
    px(ctx, cx - 3, cy - 1, hair, 6, 2);
    paintVolume(ctx, cx - 4, cy - 6, 8, 7, hair, 1.18, 0.7);
    px(ctx, cx - 3, cy - 5, shadeHex(hair, 1.25), 3, 2);
    px(ctx, cx - 5 + sway, cy - 3, hair, 2, 3);
    px(ctx, cx + 3 + sway, cy - 3, hair, 2, 3);
  } else if (facing === "south") {
    px(ctx, cx - 3, cy - 6, hair, 6, 3);
    px(ctx, cx - 5 + sway, cy - 5, hair, 2, 3);
    px(ctx, cx + 3 + sway, cy - 5, hair, 2, 2);
    px(ctx, cx - 3, cy - 6, shadeHex(hair, 1.22), 3, 2);
    px(ctx, cx + 3 + sway, cy - 4, shadeHex(hair, 0.7), 2, 2);
  } else {
    const s = facing === "west" ? -1 : 1;
    px(ctx, cx - 3, cy - 6, hair, 6, 3);
    px(ctx, cx - s * 4, cy - 5, hair, 3, 5);
    px(ctx, cx - s * 4, cy - 5, shadeHex(hair, 1.2), 2, 2);
    px(ctx, cx - s * 5 + sway, cy - 3, hair, 2, 3);
  }
  drawFace(ctx, cx, cy, facing, skin);
}

function drawLegs(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  facing: Facing,
  frame: number,
  pant: string,
): void {
  const b = bob(frame);
  const s = spread(frame);
  const pantD = shadeHex(pant, 0.72);
  if (facing === "south" || facing === "north") {
    const liftL = footLift(frame, true);
    const liftR = footLift(frame, false);
    outlinedVolume(ctx, cx - 5 - s, cy + 6 + b + liftL, 4, 5 - liftL, facing === "north" ? pantD : pant);
    outlinedVolume(ctx, cx + 1 + s, cy + 6 + b + liftR, 4, 5 - liftR, facing === "north" ? pant : pantD, 1.12, 0.7);
    outlinedVolume(ctx, cx - 5 - s, cy + 10 + b + liftL, 4, 4, BOOT, 1.18, 0.65);
    outlinedVolume(ctx, cx + 1 + s, cy + 10 + b + liftR, 4, 4, BOOT, 1.12, 0.6);
    px(ctx, cx - 4 - s, cy + 13 + b + liftL, "#1a1410", 3, 1);
    px(ctx, cx + 2 + s, cy + 13 + b + liftR, "#1a1410", 3, 1);
  } else {
    const dir = facing === "west" ? -1 : 1;
    const lead = [1, 3, 0, -2][frame] ?? 1;
    const front = dir * lead;
    const lift = frame === 1 || frame === 3 ? -1 : 0;
    outlinedVolume(ctx, cx - 2 - dir, cy + 6 + b, 5, 5, pantD, 1.1, 0.68);
    outlinedVolume(ctx, cx - 2 + front, cy + 6 + b + lift, 5, 5, pant);
    outlinedVolume(ctx, cx - 2 - dir, cy + 10 + b, 5, 4, shadeHex(BOOT, 0.85), 1.1, 0.6);
    outlinedVolume(ctx, cx - 2 + front, cy + 10 + b + lift, 5, 4, BOOT, 1.18, 0.62);
    px(ctx, cx - 1 + front, cy + 13 + b + lift, "#1a1410", 3, 1);
  }
}

function drawTorso(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  facing: Facing,
  frame: number,
  color: string,
  wide: boolean,
): void {
  const b = bob(frame);
  const side = facing === "west" || facing === "east";
  const w = side ? (wide ? 9 : 8) : wide ? 12 : 10;
  const ox = facing === "west" ? -1 : facing === "east" ? 1 : 0;
  const x = cx - Math.floor(w / 2) + ox;
  outlinedVolume(ctx, x, cy - 4 + b, w, 11, color);
  if (!side) {
    outlinedVolume(ctx, cx - Math.floor(w / 2) - 1, cy - 3 + b, 3, 4, shadeHex(color, 1.06), 1.18, 0.88);
    outlinedVolume(ctx, cx + Math.floor(w / 2) - 2, cy - 3 + b, 3, 4, shadeHex(color, 0.82), 1.08, 0.7);
  }
}

function drawFarArm(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  facing: Facing,
  frame: number,
  sleeve: string,
): void {
  if (facing !== "west" && facing !== "east") return;
  const b = bob(frame);
  const sw = -armSwing(frame);
  const far = facing === "east" ? -1 : 1;
  outlinedVolume(ctx, cx + far * 5, cy - 1 + b + sw, 3, 6, shadeHex(sleeve, 0.78), 1.08, 0.7);
}

function drawNearArms(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  facing: Facing,
  frame: number,
  sleeve: string,
  skin = SKIN,
): void {
  const b = bob(frame);
  const sw = armSwing(frame);
  if (facing === "south") {
    outlinedVolume(ctx, cx - 8, cy - 2 + b + sw, 3, 7, sleeve);
    outlined(ctx, cx - 8, cy + 4 + b + sw, 3, 3, skin);
    paintVolume(ctx, cx - 8, cy + 4 + b + sw, 3, 3, skin, 1.12, 0.8);
    outlinedVolume(ctx, cx + 5, cy - 2 + b - sw, 3, 7, shadeHex(sleeve, 0.88), 1.12, 0.7);
    outlined(ctx, cx + 5, cy + 4 + b - sw, 3, 3, skin);
    paintVolume(ctx, cx + 5, cy + 4 + b - sw, 3, 3, skin, 1.08, 0.78);
  } else if (facing === "north") {
    outlinedVolume(ctx, cx - 8, cy - 2 + b - sw, 3, 7, shadeHex(sleeve, 0.8), 1.1, 0.7);
    outlinedVolume(ctx, cx + 5, cy - 2 + b + sw, 3, 7, sleeve);
  } else {
    const near = facing === "east" ? 1 : -1;
    outlinedVolume(ctx, cx + near * 6, cy - 1 + b + sw, 3, 7, sleeve);
    outlined(ctx, cx + near * 6, cy + 5 + b + sw, 3, 3, skin);
    paintVolume(ctx, cx + near * 6, cy + 5 + b + sw, 3, 3, skin, 1.12, 0.8);
  }
}

const REED = "#6b4423";
const REED_L = "#8d5a30";
const REED_D = "#3e2816";
const STRING = "#e4d2a8";
const FLETCH = "#e8e6d9";
const FLETCH_TIP = "#f4efe4";
const VANE_GREEN = "#9ad4a8";
const GOLD = "#c9a227";
const GOLD_L = "#e8d48a";
const LINING = "#5a9e6a";

/**
 * Undrawn recurve. Column 0 is the string; limbs kick toward higher columns.
 * `kick` +1 places that flare on +x (bow held on the body's right).
 */
const REED_BOW = [
  "~.....#",
  "~....#W",
  "~...#W#",
  "~..#L#.",
  "~.#W#..",
  "~#W#...",
  ".#L#...",
  "#$##...",
  "#D#....",
  "#W#....",
  ".#W#...",
  "~#L#...",
  "~.#W#..",
  "~..#W#.",
  "~...#W#",
  "~....#W",
  "~.....#",
];

function drawReedBow(
  ctx: CanvasRenderingContext2D,
  stringX: number,
  topY: number,
  kick: number,
): void {
  const color: Record<string, string> = {
    "#": OUT,
    W: REED,
    L: REED_L,
    D: REED_D,
    $: GOLD,
    "~": STRING,
  };
  for (let row = 0; row < REED_BOW.length; row++) {
    const line = REED_BOW[row]!;
    for (let col = 0; col < line.length; col++) {
      const cell = line[col]!;
      if (cell === ".") continue;
      const x = stringX + col * kick;
      const y = topY + row;
      if (cell === "~") px(ctx, x - kick, y, OUT);
      px(ctx, x, y, color[cell] ?? REED);
    }
  }
}

function drawQuiver(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const vanes = [VANE_GREEN, FLETCH, GOLD_L];
  const reach = [7, 9, 6];
  for (let i = 0; i < 3; i++) {
    const ax = x + 1 + i * 2;
    const top = y - reach[i]!;
    px(ctx, ax, top, vanes[i]!, 1, 3);
    px(ctx, ax, top, FLETCH_TIP, 1, 1);
    px(ctx, ax, top + 3, "#d2c09a", 1, reach[i]! - 3);
  }
  outlinedVolume(ctx, x, y, 7, 8, REED, 1.2, 0.62);
  px(ctx, x, y, REED_D, 7, 2);
  px(ctx, x + 1, y + 1, REED_L, 1, 1);
  px(ctx, x + 1, y + 5, GOLD, 5, 1);
  px(ctx, x + 2, y + 5, GOLD_L, 1, 1);
}

function drawHangingArm(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  sleeve: string,
  skin: string,
  shade = 1,
): void {
  outlinedVolume(ctx, x, y, 3, 7, shadeHex(sleeve, shade), 1.12, 0.72);
  outlined(ctx, x, y + 6, 3, 3, skin);
  paintVolume(ctx, x, y + 6, 3, 3, skin, 1.1, 0.8);
}

function drawPathfinder(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  facing: Facing,
  frame: number,
): void {
  const p = P.pathfinder;
  const b = bob(frame);
  const sway = hairSway(frame);
  const cloth = clothY(frame);
  const sw = armSwing(frame);
  const skin = skinOf("pathfinder");
  const cloak = p.b;
  const side = facing === "west" || facing === "east";

  drawFarArm(ctx, cx, cy, facing, frame, p.b);
  drawLegs(ctx, cx, cy, facing, frame, shadeHex(p.a, 0.55));
  if (facing === "south" || facing === "north") {
    const s = spread(frame);
    const liftL = footLift(frame, true);
    const liftR = footLift(frame, false);
    px(ctx, cx - 5 - s, cy + 10 + b + liftL, REED_D, 4, 1);
    px(ctx, cx + 1 + s, cy + 10 + b + liftR, REED, 4, 1);
  } else {
    const dir = facing === "west" ? -1 : 1;
    const lead = [1, 3, 0, -2][frame] ?? 1;
    const lift = frame === 1 || frame === 3 ? -1 : 0;
    px(ctx, cx - 2 - dir, cy + 10 + b, REED_D, 5, 1);
    px(ctx, cx - 2 + dir * lead, cy + 10 + b + lift, REED, 5, 1);
  }
  drawTorso(ctx, cx, cy, facing, frame, p.a, false);
  if (facing !== "north") {
    const bw = side ? 6 : 8;
    const bx = cx - Math.floor(bw / 2);
    px(ctx, bx, cy + 4 + b, REED_D, bw, 2);
    px(ctx, cx - 1, cy + 4 + b, GOLD, 2, 2);
    px(ctx, cx - 1, cy + 4 + b, GOLD_L, 1, 1);
    if (facing === "south") {
      px(ctx, cx - 1, cy - 2 + b, shadeHex(p.a, 0.7), 2, 5);
      px(ctx, cx - 2, cy, GOLD, 1, 1);
      px(ctx, cx + 1, cy + 2 + b, GOLD, 1, 1);
    }
  }

  if (facing === "south") {
    drawHangingArm(ctx, cx - 8, cy - 2 + b + sw, p.b, skin.lite);
    outlinedVolume(ctx, cx + 4, cy - 3 + b, 3, 3, p.b);
    outlinedVolume(ctx, cx + 6, cy - 2 + b, 3, 3, shadeHex(p.b, 0.9), 1.1, 0.7);
  } else if (facing === "north") {
    drawNearArms(ctx, cx, cy, facing, frame, p.b, skin.lite);
  } else if (facing === "west") {
    outlinedVolume(ctx, cx - 4, cy - 2 + b, 3, 4, p.b);
  } else {
    outlinedVolume(ctx, cx + 2, cy - 2 + b, 3, 4, p.b);
  }

  drawHead(ctx, cx, cy - 8 + b, facing, p.hair, skin, sway);

  const gripY = cy - 1 + b;
  const topY = gripY - 8;

  if (facing === "south") {
    outlinedVolume(ctx, cx - 2, cy - 15 + b, 4, 2, cloak, 1.2, 0.68);
    outlinedVolume(ctx, cx - 4, cy - 14 + b, 8, 2, cloak, 1.16, 0.7);
    outlinedVolume(ctx, cx - 6, cy - 12 + b, 12, 2, cloak, 1.14, 0.7);
    outlinedVolume(ctx, cx - 7, cy - 10 + b, 4, 4, cloak, 1.12, 0.68);
    outlinedVolume(ctx, cx + 3, cy - 10 + b, 4, 4, shadeHex(cloak, 0.9), 1.1, 0.66);
    outlinedVolume(ctx, cx - 5, cy - 5 + b, 10, 2, cloak, 1.14, 0.7);
    px(ctx, cx - 4, cy - 11 + b, LINING, 1, 3);
    px(ctx, cx + 3, cy - 11 + b, shadeHex(cloak, 0.72), 1, 3);
    px(ctx, cx - 3, cy - 12 + b, skin.lite, 6, 7);
    paintVolume(ctx, cx - 3, cy - 12 + b, 6, 7, skin.lite, 1.14, 0.8);
    px(ctx, cx - 1, cy - 4 + b, GOLD, 2, 2);
    px(ctx, cx - 1, cy - 4 + b, GOLD_L, 1, 1);
    px(ctx, cx - 8 + sway, cy + 6 + cloth, cloak, 3, 5);
    px(ctx, cx - 8 + sway, cy + 10 + cloth, LINING, 3, 1);
    drawFace(ctx, cx, cy - 8 + b, facing, skin);
    drawQuiver(ctx, cx - 15, cy + 1 + b);
    px(ctx, cx - 8, cy + 4 + b, REED_D, 4, 1);
    drawReedBow(ctx, cx + 8, topY, 1);
    outlinedVolume(ctx, cx + 6, gripY - 1, 3, 3, skin.lite, 1.12, 0.78);
    px(ctx, cx + 6, gripY - 3, REED_D, 3, 2);
    px(ctx, cx + 7, gripY - 3, GOLD, 1, 1);
  } else if (facing === "north") {
    outlinedVolume(ctx, cx - 2, cy - 15 + b, 4, 2, cloak, 1.18, 0.66);
    outlinedVolume(ctx, cx - 5, cy - 14 + b, 10, 7, cloak, 1.16, 0.68);
    outlinedVolume(ctx, cx - 7, cy - 8 + b, 14, 8, cloak, 1.14, 0.68);
    outlinedVolume(ctx, cx - 7, cy + cloth, 14, 6, shadeHex(cloak, 0.92), 1.12, 0.66);
    px(ctx, cx - 1, cy - 6 + b, shadeHex(cloak, 0.62), 2, 7);
    px(ctx, cx, cy + 1 + cloth, shadeHex(cloak, 0.7), 1, 4);
    px(ctx, cx - 6, cy + 5 + cloth, LINING, 12, 1);
    px(ctx, cx - 4, cy - 13 + b, shadeHex(cloak, 1.3), 3, 2);
    drawQuiver(ctx, cx + 8, cy - 4 + b);
    drawReedBow(ctx, cx - 9, topY, -1);
    outlinedVolume(ctx, cx - 10, gripY - 1, 3, 3, p.b, 1.1, 0.7);
  } else {
    const west = facing === "west";
    outlinedVolume(ctx, cx - 3, cy - 15 + b, 7, 3, cloak, 1.16, 0.68);
    outlinedVolume(ctx, west ? cx + 1 : cx - 6, cy - 12 + b, 5, 6, cloak, 1.14, 0.68);
    px(ctx, cx + (west ? -2 : 2), cy - 12 + b, LINING, 1, 3);
    const trail = west ? 1 : -1;
    outlinedVolume(ctx, cx + trail * 3, cy - 3 + b, 4, 6, cloak, 1.12, 0.68);
    outlinedVolume(ctx, cx + trail * 4 + sway, cy + 2 + cloth, 4, 6, shadeHex(cloak, 0.9), 1.1, 0.66);
    px(ctx, cx + trail * 4 + sway, cy + 7 + cloth, LINING, 4, 1);
    px(ctx, cx - 1, cy - 5 + b, GOLD, 2, 2);
    px(ctx, cx - 1, cy - 5 + b, GOLD_L, 1, 1);
    drawFace(ctx, cx, cy - 8 + b, facing, skin);
    drawQuiver(ctx, west ? cx + 8 : cx - 15, cy - 2 + b);
    drawReedBow(ctx, west ? cx - 6 : cx + 6, topY, west ? -1 : 1);
    const handX = west ? cx - 7 : cx + 5;
    outlinedVolume(ctx, handX, gripY - 1, 3, 3, skin.lite, 1.12, 0.78);
    px(ctx, handX, gripY - 3, REED_D, 3, 2);
  }
}

function drawClass(
  ctx: CanvasRenderingContext2D,
  id: ClassId,
  cx: number,
  cy: number,
  facing: Facing,
  frame: number,
): void {
  const p = P[id];
  const b = bob(frame);
  const sway = hairSway(frame);
  const cloth = clothY(frame);
  const side = facing === "west" ? -1 : facing === "east" ? 1 : 0;
  const sw = armSwing(frame);
  const wide = id === "thornblade" || id === "warden" || id === "hollowborn";
  const skin = skinOf(id);

  if (id === "pathfinder") {
    drawPathfinder(ctx, cx, cy, facing, frame);
    return;
  }

  if (id === "hollowborn") {
    drawFarArm(ctx, cx, cy, facing, frame, p.b);
    drawLegs(ctx, cx, cy, facing, frame, p.c);
    drawTorso(ctx, cx, cy, facing, frame, p.a, true);
    drawNearArms(ctx, cx, cy, facing, frame, p.b, skin.lite);
    drawHead(ctx, cx, cy - 8 + b, facing, p.hair, skin, sway);
    outlinedVolume(ctx, cx - 5, cy - 13 + b, 10, 6, p.b, 1.18, 0.68);
    px(ctx, cx - 6 + sway, cy - 11 + cloth, p.b, 2, 6);
    px(ctx, cx + 4 + sway, cy - 11 + cloth, shadeHex(p.b, 0.7), 2, 6);
    px(ctx, cx - 6, cy + 4 + cloth, p.b, 12, 3);
    paintVolume(ctx, cx - 6, cy + 4 + cloth, 12, 3, p.b, 1.16, 0.7);
    if (facing === "south") px(ctx, cx - 3, cy - 9 + b, skin.lite, 6, 3);
    drawFace(ctx, cx, cy - 8 + b, facing, skin);
    if (frame === 1 || frame === 3) {
      const fx = facing === "west" ? cx - 11 : cx + 7;
      outlinedVolume(ctx, fx, cy + 2 + b, 4, 4, p.c, 1.22, 0.8);
      px(ctx, fx + 1, cy + 3 + b, "#e8e0f0", 2, 2);
    }
    return;
  }

  const weaponFirst = facing === "north";
  const drawWeapon = () => {
    if (id === "thornblade") {
      const hx = facing === "north" || facing === "south" ? cx + 9 : cx + (side || 1) * 10;
      outlinedVolume(ctx, hx - 1, cy - 12 + b + sw, 3, 18, STEEL, 1.22, 0.68);
      px(ctx, hx + 1, cy - 10 + b + sw, STEEL_D, 2, 2);
      px(ctx, hx + 1, cy - 6 + b + sw, STEEL_D, 2, 2);
      px(ctx, hx + 1, cy - 2 + b + sw, STEEL_D, 2, 2);
      px(ctx, hx - 3, cy - 12 + b + sw, STEEL_L, 7, 4);
      px(ctx, hx - 2, cy - 14 + b + sw, p.a, 5, 3);
      paintVolume(ctx, hx - 2, cy - 14 + b + sw, 5, 3, p.a, 1.2, 0.75);
      if (facing !== "north") {
        const sx = facing === "west" ? cx + 5 : facing === "east" ? cx - 10 : cx - 10;
        outlinedVolume(ctx, sx - 3, cy - 1 + b, 7, 7, STEEL, 1.18, 0.7);
        px(ctx, sx - 2, cy, STEEL_L, 5, 2);
        px(ctx, sx - 1, cy + 1 + b, p.b, 3, 3);
        px(ctx, sx, cy + 2 + b, p.a, 1, 1);
      }
    } else if (id === "hearthmage") {
      const stx = facing === "north" ? cx - 8 : facing === "south" ? cx + 8 : cx + (side || 1) * 9;
      outlinedVolume(ctx, stx - 1, cy - 14 + b, 3, 24, WOOD, 1.16, 0.7);
      outlinedVolume(ctx, stx - 3, cy - 17 + b, 7, 6, "#e07030", 1.25, 0.75);
      px(ctx, stx - 2, cy - 16 + b, "#f0d060", 5, 4);
      px(ctx, stx, cy - 15 + b, "#fff4c8", 2, 2);
    } else if (id === "verdant") {
      const ox = facing === "west" ? -9 : facing === "east" ? 9 : 8;
      outlinedVolume(ctx, cx + ox - 1, cy - 10 + b, 3, 18, WOOD, 1.16, 0.7);
      outlinedVolume(ctx, cx + ox - 3, cy - 13 + b, 7, 6, p.c, 1.2, 0.78);
      px(ctx, cx + ox - 1, cy - 15 + b, "#6ab84a", 3, 3);
      px(ctx, cx + ox, cy - 16 + b, "#e8f0c8", 1, 2);
    } else if (id === "warden") {
      const hx = facing === "north" || facing === "south" ? cx + 9 : cx + (side || 1) * 10;
      outlinedVolume(ctx, hx - 1, cy - 10 + b + sw, 3, 16, STEEL, 1.22, 0.68);
      px(ctx, hx - 3, cy - 4 + b + sw, STEEL_L, 7, 2);
      px(ctx, hx - 1, cy + 5 + b + sw, WOOD, 3, 3);
      const sx = facing === "west" ? cx + 6 : facing === "east" ? cx - 12 : cx - 11;
      if (facing !== "north") {
        const sideView = facing === "west" || facing === "east";
        const swd = sideView ? 8 : 10;
        const shd = sideView ? 10 : 12;
        outlinedVolume(ctx, sx - 5, cy - 5 + b, swd, shd, p.c, 1.16, 0.72);
        px(ctx, sx - 4, cy - 4 + b, STEEL, swd - 2, shd - 2);
        paintVolume(ctx, sx - 4, cy - 4 + b, swd - 2, shd - 2, STEEL, 1.18, 0.7);
        px(ctx, sx - 1, cy - 1 + b, p.b, 3, 7);
        px(ctx, sx - 3, cy + 1 + b, p.b, 7, 3);
        px(ctx, sx, cy + 2 + b, STEEL_L, 2, 2);
      }
    }
  };

  if (weaponFirst) drawWeapon();
  drawFarArm(ctx, cx, cy, facing, frame, p.b);
  drawLegs(ctx, cx, cy, facing, frame, shadeHex(p.a, 0.55));
  drawTorso(ctx, cx, cy, facing, frame, p.a, wide);
  drawNearArms(ctx, cx, cy, facing, frame, p.b, skin.lite);
  drawHead(ctx, cx, cy - 8 + b, facing, p.hair, skin, sway);

  if (id === "thornblade") {
    px(ctx, cx - 6, cy + 2 + cloth, p.b, 12, 4);
    paintVolume(ctx, cx - 6, cy + 2 + cloth, 12, 4, p.b, 1.16, 0.7);
    outlinedVolume(ctx, cx - 5, cy - 14 + b, 10, 4, "#2a2218", 1.2, 0.65);
    if (facing === "south") {
      px(ctx, cx - 6 + sway, cy - 12 + cloth, "#2a2218", 2, 4);
      px(ctx, cx + 4 + sway, cy - 12 + cloth, "#2a2218", 2, 4);
    }
  } else if (id === "hearthmage") {
    px(ctx, cx - 5, cy + 4 + cloth, p.b, 10, 5);
    paintVolume(ctx, cx - 5, cy + 4 + cloth, 10, 5, p.b, 1.16, 0.7);
    outlinedVolume(ctx, cx - 8, cy - 12 + b, 16, 4, p.a, 1.18, 0.72);
    px(ctx, cx - 5, cy - 18 + b, p.a, 10, 8);
    paintVolume(ctx, cx - 5, cy - 18 + b, 10, 8, p.a, 1.2, 0.72);
    px(ctx, cx - 4, cy - 17 + b, p.b, 8, 5);
    px(ctx, cx - 1, cy - 20 + b, p.c, 2, 3);
    px(ctx, cx - 1, cy - 1 + b, p.c, 2, 3);
  } else if (id === "verdant") {
    px(ctx, cx - 5 + sway, cy + cloth, p.c, 10, 3);
    paintVolume(ctx, cx - 5 + sway, cy + cloth, 10, 3, p.c, 1.18, 0.78);
    outlinedVolume(ctx, cx - 5, cy - 14 + b, 10, 5, "#c8a060", 1.18, 0.72);
    px(ctx, cx - 7 + sway, cy - 13 + cloth, p.c, 3, 4);
    px(ctx, cx + 4 + sway, cy - 13 + cloth, p.c, 3, 4);
    px(ctx, cx - 2, cy - 16 + b, "#6ab84a", 4, 3);
    px(ctx, cx - 7, cy - 14 + b, shadeHex(p.c, 1.2), 2, 2);
  } else if (id === "warden") {
    px(ctx, cx - 1, cy - 2 + b, p.b, 3, 8);
    px(ctx, cx - 4, cy + 1 + b, p.b, 8, 3);
    outlinedVolume(ctx, cx - 6, cy - 14 + b, 12, 5, STEEL, 1.2, 0.68);
    px(ctx, cx - 5, cy - 13 + b, STEEL_L, 5, 2);
    if (facing === "south") {
      px(ctx, cx - 1, cy - 10 + b, STEEL_D, 2, 4);
      px(ctx, cx - 6, cy - 11 + b, STEEL, 2, 4);
      px(ctx, cx + 4, cy - 11 + b, STEEL, 2, 4);
    }
  }

  if (!weaponFirst) drawWeapon();
  drawFace(ctx, cx, cy - 8 + b, facing, skin);
}

export function paintClassSheet(classId: ClassId): HTMLCanvasElement | OffscreenCanvas {
  const canvas = makeCanvas(SHEET, SHEET);
  const ctx = ctx2d(canvas);
  ctx.clearRect(0, 0, SHEET, SHEET);
  ctx.imageSmoothingEnabled = false;
  for (let row = 0; row < ROWS; row++) {
    const facing = FACINGS[row]!;
    for (let col = 0; col < COLS; col++) {
      drawClass(ctx, classId, col * FRAME + FRAME / 2, row * FRAME + FRAME / 2 + 2, facing, col);
    }
  }
  addPixelVolume(ctx, SHEET, SHEET, 0.18, 0.24);
  return canvas;
}

export function paintSouthPreview(classId: ClassId): HTMLCanvasElement | OffscreenCanvas {
  const canvas = makeCanvas(FRAME, FRAME);
  const ctx = ctx2d(canvas);
  ctx.clearRect(0, 0, FRAME, FRAME);
  ctx.imageSmoothingEnabled = false;
  drawClass(ctx, classId, FRAME / 2, FRAME / 2 + 2, "south", 0);
  addPixelVolume(ctx, FRAME, FRAME, 0.18, 0.24);
  return canvas;
}

export async function sheetToPngDataUrl(canvas: HTMLCanvasElement | OffscreenCanvas): Promise<string> {
  if (canvas instanceof HTMLCanvasElement) return canvas.toDataURL("image/png");
  const blob = await canvas.convertToBlob({ type: "image/png" });
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
