/**
 * Procedural 4×4 class walk sheets — chunky outlined pixel figures
 * (original Vale art, Tibia-adjacent proportions — NOT CipSoft sprites).
 * Soft-depth pass: painted NW/SE volume, facing mass, clearer idle vs stride.
 */
import type { ClassId } from "@/game/classes";
import { makeCanvas, ctx2d, px, shadeHex, paintVolume, addPixelVolume } from "@/game/gfx/canvasUtil";

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
const BOOT = "#2a2218";
const OUT = "#0e0c0a";
const STEEL = "#8a929a";
const STEEL_D = "#5a6268";
const WOOD = "#6b4423";

function bob(frame: number): number {
  return frame === 1 || frame === 3 ? -1 : 0;
}
function spread(frame: number): number {
  return frame === 1 ? 3 : frame === 3 ? -3 : frame === 2 ? 1 : 0;
}
function armSwing(frame: number): number {
  return frame === 1 ? 3 : frame === 3 ? -3 : frame === 2 ? 1 : 0;
}
function footLift(frame: number, left: boolean): number {
  if (left) return frame === 1 ? -2 : 0;
  return frame === 3 ? -2 : 0;
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

function drawHead(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  facing: Facing,
  hair: string,
): void {
  outlinedVolume(ctx, cx - 4, cy - 5, 8, 8, SKIN, 1.16, 0.78);
  if (facing === "north") {
    px(ctx, cx - 4, cy - 6, hair, 8, 7);
    px(ctx, cx - 3, cy - 1, hair, 6, 2);
    paintVolume(ctx, cx - 4, cy - 6, 8, 7, hair, 1.18, 0.7);
    px(ctx, cx - 3, cy - 5, shadeHex(hair, 1.25), 3, 2);
  } else if (facing === "south") {
    px(ctx, cx - 3, cy - 6, hair, 6, 3);
    px(ctx, cx - 4, cy - 5, hair, 2, 3);
    px(ctx, cx + 2, cy - 5, hair, 2, 2);
    px(ctx, cx - 3, cy - 6, shadeHex(hair, 1.22), 3, 2);
    px(ctx, cx + 2, cy - 4, shadeHex(hair, 0.7), 2, 2);
    px(ctx, cx - 2, cy - 1, SKIN_D, 1, 1);
    px(ctx, cx + 1, cy - 1, SKIN_D, 1, 1);
    px(ctx, cx - 1, cy + 1, SKIN_D, 2, 1);
    px(ctx, cx - 2, cy, "#3a2418", 1, 1);
    px(ctx, cx + 1, cy, "#3a2418", 1, 1);
  } else {
    const s = facing === "west" ? -1 : 1;
    px(ctx, cx - 3, cy - 6, hair, 6, 3);
    px(ctx, cx - s * 3, cy - 5, hair, 3, 5);
    px(ctx, cx - s * 3, cy - 5, shadeHex(hair, 1.2), 2, 2);
    px(ctx, cx + s * 4, cy - 2, SKIN, 2, 2);
    px(ctx, cx + s * 5, cy - 1, SKIN_D, 1, 1);
    px(ctx, cx + s * 2, cy - 1, SKIN_D, 1, 1);
    px(ctx, cx + s * 2, cy, "#3a2418", 1, 1);
    px(ctx, cx - s * 4, cy - 3, hair, 2, 3);
  }
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
    const front = frame === 1 ? dir * 4 : frame === 3 ? dir * -3 : frame === 2 ? dir * 2 : dir;
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
): void {
  const b = bob(frame);
  const sw = armSwing(frame);
  if (facing === "south") {
    outlinedVolume(ctx, cx - 8, cy - 2 + b + sw, 3, 7, sleeve);
    outlined(ctx, cx - 8, cy + 4 + b + sw, 3, 3, SKIN);
    paintVolume(ctx, cx - 8, cy + 4 + b + sw, 3, 3, SKIN, 1.12, 0.8);
    outlinedVolume(ctx, cx + 5, cy - 2 + b - sw, 3, 7, shadeHex(sleeve, 0.88), 1.12, 0.7);
    outlined(ctx, cx + 5, cy + 4 + b - sw, 3, 3, SKIN);
    paintVolume(ctx, cx + 5, cy + 4 + b - sw, 3, 3, SKIN, 1.08, 0.78);
  } else if (facing === "north") {
    outlinedVolume(ctx, cx - 8, cy - 2 + b - sw, 3, 7, shadeHex(sleeve, 0.8), 1.1, 0.7);
    outlinedVolume(ctx, cx + 5, cy - 2 + b + sw, 3, 7, sleeve);
  } else {
    const near = facing === "east" ? 1 : -1;
    outlinedVolume(ctx, cx + near * 6, cy - 1 + b + sw, 3, 7, sleeve);
    outlined(ctx, cx + near * 6, cy + 5 + b + sw, 3, 3, SKIN);
    paintVolume(ctx, cx + near * 6, cy + 5 + b + sw, 3, 3, SKIN, 1.12, 0.8);
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
  const side = facing === "west" ? -1 : facing === "east" ? 1 : 0;
  const sw = armSwing(frame);
  const wide = id === "thornblade" || id === "warden" || id === "hollowborn";

  if (id === "hollowborn") {
    drawFarArm(ctx, cx, cy, facing, frame, p.b);
    drawLegs(ctx, cx, cy, facing, frame, p.c);
    drawTorso(ctx, cx, cy, facing, frame, p.a, true);
    px(ctx, cx - 6, cy + 4 + b, p.b, 12, 3);
    paintVolume(ctx, cx - 6, cy + 4 + b, 12, 3, p.b, 1.16, 0.7);
    drawNearArms(ctx, cx, cy, facing, frame, p.b);
    drawHead(ctx, cx, cy - 8 + b, facing, p.hair);
    outlinedVolume(ctx, cx - 5, cy - 13 + b, 10, 6, p.b, 1.18, 0.68);
    px(ctx, cx - 6, cy - 11 + b, p.b, 2, 6);
    px(ctx, cx + 4, cy - 11 + b, shadeHex(p.b, 0.7), 2, 6);
    if (facing === "south") px(ctx, cx - 3, cy - 9 + b, SKIN, 6, 2);
    if (frame === 1 || frame === 3) {
      const fx = facing === "west" ? cx - 11 : cx + 7;
      outlinedVolume(ctx, fx, cy + 2 + b, 4, 4, p.c, 1.22, 0.8);
    }
    return;
  }

  const weaponFirst = facing === "north";
  const drawWeapon = () => {
    if (id === "pathfinder") {
      const bx = facing === "west" ? cx - 10 : facing === "east" ? cx + 10 : facing === "north" ? cx - 8 : cx + 8;
      outlined(ctx, bx, cy - 4 + b, 2, 12, WOOD);
      paintVolume(ctx, bx, cy - 4 + b, 2, 12, WOOD, 1.18, 0.7);
      px(ctx, bx - 3, cy - 5 + b, WOOD, 8, 2);
      px(ctx, bx - 2, cy + 7 + b, WOOD, 6, 2);
      if (facing === "south" || facing === "east") {
        px(ctx, cx - 4, cy - 2 + b, p.b, 3, 5);
      }
    } else if (id === "thornblade") {
      const hx = facing === "north" || facing === "south" ? cx + 9 : cx + (side || 1) * 10;
      outlinedVolume(ctx, hx - 1, cy - 12 + b + sw, 3, 18, STEEL, 1.22, 0.68);
      px(ctx, hx - 3, cy - 12 + b + sw, STEEL_D, 7, 5);
      px(ctx, hx - 2, cy - 14 + b + sw, p.a, 5, 3);
      paintVolume(ctx, hx - 2, cy - 14 + b + sw, 5, 3, p.a, 1.2, 0.75);
      if (facing !== "north") {
        const sx = facing === "west" ? cx + 5 : facing === "east" ? cx - 10 : cx - 10;
        outlinedVolume(ctx, sx - 3, cy - 1 + b, 7, 7, STEEL, 1.18, 0.7);
        px(ctx, sx - 1, cy + 1 + b, p.b, 3, 3);
      }
    } else if (id === "hearthmage") {
      const stx = facing === "north" ? cx - 8 : facing === "south" ? cx + 8 : cx + (side || 1) * 9;
      outlinedVolume(ctx, stx - 1, cy - 14 + b, 3, 24, WOOD, 1.16, 0.7);
      outlinedVolume(ctx, stx - 3, cy - 16 + b, 7, 5, "#e07030", 1.25, 0.75);
      px(ctx, stx - 1, cy - 15 + b, "#f0d060", 3, 3);
    } else if (id === "verdant") {
      const ox = facing === "west" ? -9 : facing === "east" ? 9 : 8;
      outlinedVolume(ctx, cx + ox - 1, cy - 10 + b, 3, 18, WOOD, 1.16, 0.7);
      outlinedVolume(ctx, cx + ox - 3, cy - 12 + b, 7, 5, p.c, 1.2, 0.78);
      px(ctx, cx + ox - 1, cy - 14 + b, "#6ab84a", 3, 3);
    } else if (id === "warden") {
      const hx = facing === "north" || facing === "south" ? cx + 9 : cx + (side || 1) * 10;
      outlinedVolume(ctx, hx - 1, cy - 10 + b + sw, 3, 16, STEEL, 1.22, 0.68);
      const sx = facing === "west" ? cx + 6 : facing === "east" ? cx - 12 : cx - 11;
      if (facing !== "north") {
        const sideView = facing === "west" || facing === "east";
        const swd = sideView ? 8 : 10;
        const shd = sideView ? 10 : 11;
        outlinedVolume(ctx, sx - 5, cy - 4 + b, swd, shd, p.c, 1.16, 0.72);
        px(ctx, sx - 4, cy - 3 + b, STEEL, swd - 2, shd - 2);
        paintVolume(ctx, sx - 4, cy - 3 + b, swd - 2, shd - 2, STEEL, 1.18, 0.7);
        px(ctx, sx - 1, cy - 1 + b, p.b, 3, 7);
        px(ctx, sx - 3, cy + 1 + b, p.b, 7, 3);
      }
    }
  };

  if (weaponFirst) drawWeapon();
  drawFarArm(ctx, cx, cy, facing, frame, p.b);
  drawLegs(ctx, cx, cy, facing, frame, shadeHex(p.a, 0.55));
  drawTorso(ctx, cx, cy, facing, frame, p.a, wide);
  drawNearArms(ctx, cx, cy, facing, frame, p.b);
  drawHead(ctx, cx, cy - 8 + b, facing, p.hair);

  if (id === "pathfinder") {
    outlinedVolume(ctx, cx - 6, cy - 13 + b, 12, 6, p.b, 1.18, 0.7);
    if (facing !== "north") px(ctx, cx - 5, cy - 10 + b, p.b, 10, 4);
    if (facing === "south") px(ctx, cx - 3, cy - 8 + b, SKIN, 6, 2);
    outlinedVolume(ctx, cx + (facing === "west" ? -8 : 5), cy - 2 + b, 4, 8, WOOD, 1.16, 0.7);
    px(ctx, cx + (facing === "west" ? -7 : 6), cy - 4 + b, p.c, 2, 3);
  } else if (id === "thornblade") {
    px(ctx, cx - 6, cy + 2 + b, p.b, 12, 4);
    paintVolume(ctx, cx - 6, cy + 2 + b, 12, 4, p.b, 1.16, 0.7);
    outlinedVolume(ctx, cx - 5, cy - 14 + b, 10, 4, "#2a2218", 1.2, 0.65);
    if (facing === "south") px(ctx, cx - 2, cy - 9 + b, SKIN, 4, 2);
  } else if (id === "hearthmage") {
    px(ctx, cx - 5, cy + 4 + b, p.b, 10, 5);
    paintVolume(ctx, cx - 5, cy + 4 + b, 10, 5, p.b, 1.16, 0.7);
    outlinedVolume(ctx, cx - 8, cy - 12 + b, 16, 4, p.a, 1.18, 0.72);
    px(ctx, cx - 5, cy - 18 + b, p.a, 10, 8);
    paintVolume(ctx, cx - 5, cy - 18 + b, 10, 8, p.a, 1.2, 0.72);
    px(ctx, cx - 4, cy - 17 + b, p.b, 8, 5);
    px(ctx, cx - 1, cy - 20 + b, p.c, 2, 3);
  } else if (id === "verdant") {
    px(ctx, cx - 5, cy + b, p.c, 10, 3);
    paintVolume(ctx, cx - 5, cy + b, 10, 3, p.c, 1.18, 0.78);
    outlinedVolume(ctx, cx - 5, cy - 13 + b, 10, 5, "#c8a060", 1.18, 0.72);
    px(ctx, cx - 6, cy - 12 + b, p.c, 2, 3);
    px(ctx, cx + 4, cy - 12 + b, p.c, 2, 3);
    px(ctx, cx - 6, cy - 13 + b, shadeHex(p.c, 1.2), 2, 2);
  } else if (id === "warden") {
    px(ctx, cx - 1, cy - 2 + b, p.b, 3, 8);
    px(ctx, cx - 4, cy + 1 + b, p.b, 8, 3);
    outlinedVolume(ctx, cx - 6, cy - 13 + b, 12, 6, STEEL, 1.2, 0.68);
    if (facing === "south") px(ctx, cx - 3, cy - 10 + b, OUT, 6, 2);
  }

  if (!weaponFirst) drawWeapon();
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
  addPixelVolume(ctx, SHEET, SHEET, 0.16, 0.2);
  return canvas;
}

export function paintSouthPreview(classId: ClassId): HTMLCanvasElement | OffscreenCanvas {
  const canvas = makeCanvas(FRAME, FRAME);
  const ctx = ctx2d(canvas);
  ctx.clearRect(0, 0, FRAME, FRAME);
  ctx.imageSmoothingEnabled = false;
  drawClass(ctx, classId, FRAME / 2, FRAME / 2 + 2, "south", 0);
  addPixelVolume(ctx, FRAME, FRAME, 0.16, 0.2);
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
