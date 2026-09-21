/**
 * Procedural 4×4 class walk sheets — chunky outlined pixel figures
 * (original Vale art, Tibia-adjacent proportions — NOT CipSoft sprites).
 * Pass 3: clearer 4-frame stride, arm swing, facing silhouettes.
 */
import type { ClassId } from "@/game/classes";
import { makeCanvas, ctx2d, px, shadeHex, addPixelVolume } from "@/game/gfx/canvasUtil";

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
  return frame === 1 ? 2 : frame === 3 ? -2 : 0;
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

function drawHead(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  facing: Facing,
  hair: string,
): void {
  outlined(ctx, cx - 4, cy - 5, 8, 8, SKIN);
  if (facing === "north") {
    px(ctx, cx - 4, cy - 6, hair, 8, 7);
    px(ctx, cx - 3, cy - 1, hair, 6, 2);
  } else if (facing === "south") {
    px(ctx, cx - 3, cy - 6, hair, 6, 3);
    px(ctx, cx - 4, cy - 5, hair, 2, 3);
    px(ctx, cx + 2, cy - 5, hair, 2, 2);
    px(ctx, cx - 2, cy - 1, SKIN_D, 1, 1);
    px(ctx, cx + 1, cy - 1, SKIN_D, 1, 1);
    px(ctx, cx - 1, cy + 1, SKIN_D, 2, 1);
  } else {
    const s = facing === "west" ? -1 : 1;
    px(ctx, cx - 3, cy - 6, hair, 6, 3);
    px(ctx, cx + s * 3, cy - 5, hair, 2, 4);
    px(ctx, cx + s * 2, cy - 1, SKIN_D, 1, 1);
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
  if (facing === "south" || facing === "north") {
    outlined(ctx, cx - 5 - s, cy + 6 + b, 4, 5, pant);
    outlined(ctx, cx + 1 + s, cy + 6 + b, 4, 5, pant);
    outlined(ctx, cx - 5 - s, cy + 10 + b, 4, 5, BOOT);
    outlined(ctx, cx + 1 + s, cy + 10 + b, 4, 5, BOOT);
  } else {
    const dir = facing === "west" ? -1 : 1;
    const front = frame === 1 ? dir * 3 : frame === 3 ? dir * -2 : dir;
    outlined(ctx, cx - 2 + front, cy + 6 + b, 5, 5, pant);
    outlined(ctx, cx - 2, cy + 6 + b, 5, 5, pant);
    outlined(ctx, cx - 2 + front, cy + 10 + b, 5, 4, BOOT);
    outlined(ctx, cx - 1, cy + 11 + b, 4, 4, BOOT);
  }
}

function drawTorso(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  frame: number,
  color: string,
  wide: boolean,
): void {
  const b = bob(frame);
  const w = wide ? 12 : 10;
  outlined(ctx, cx - w / 2, cy - 4 + b, w, 11, color);
  px(ctx, cx - w / 2 + 1, cy - 3 + b, shadeHex(color, 1.2), Math.max(2, Math.floor(w / 2) - 1), 2);
}

function drawArms(
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
    outlined(ctx, cx - 8, cy - 2 + b + sw, 3, 7, sleeve);
    px(ctx, cx - 8, cy + 4 + b + sw, SKIN, 3, 3);
    outlined(ctx, cx + 5, cy - 2 + b - sw, 3, 7, sleeve);
    px(ctx, cx + 5, cy + 4 + b - sw, SKIN, 3, 3);
  } else if (facing === "north") {
    outlined(ctx, cx - 8, cy - 2 + b - sw, 3, 7, sleeve);
    outlined(ctx, cx + 5, cy - 2 + b + sw, 3, 7, sleeve);
  } else {
    const near = facing === "east" ? 1 : -1;
    outlined(ctx, cx + near * 6, cy - 1 + b + sw, 3, 7, sleeve);
    px(ctx, cx + near * 6, cy + 5 + b + sw, SKIN, 3, 3);
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

  if (id === "hollowborn") {
    drawLegs(ctx, cx, cy, facing, frame, p.c);
    drawTorso(ctx, cx, cy, frame, p.a, true);
    px(ctx, cx - 6, cy + 4 + b, p.b, 12, 3);
    drawArms(ctx, cx, cy, facing, frame, p.b);
    drawHead(ctx, cx, cy - 8 + b, facing, p.hair);
    outlined(ctx, cx - 5, cy - 12 + b, 10, 5, p.b);
    if (facing === "south") px(ctx, cx - 3, cy - 9 + b, SKIN, 6, 2);
    // fist puffs on stride
    if (frame === 1 || frame === 3) {
      const fx = facing === "west" ? cx - 10 : cx + 7;
      px(ctx, fx, cy + 2 + b, p.c, 3, 3);
    }
    return;
  }

  // weapons behind body when facing north
  const weaponFirst = facing === "north";
  const drawWeapon = () => {
    if (id === "pathfinder") {
      const bx = facing === "west" ? cx - 10 : facing === "east" ? cx + 10 : facing === "north" ? cx - 8 : cx + 8;
      px(ctx, bx, cy - 4 + b, WOOD, 2, 12);
      px(ctx, bx - 3, cy - 5 + b, WOOD, 8, 2);
      px(ctx, bx - 2, cy + 7 + b, WOOD, 6, 2);
      if (facing === "south" || facing === "east") {
        px(ctx, cx - 4, cy - 2 + b, p.b, 3, 5);
      }
    } else if (id === "thornblade") {
      const hx = facing === "north" || facing === "south" ? cx + 9 : cx + (side || 1) * 10;
      outlined(ctx, hx - 1, cy - 12 + b + sw, 3, 18, STEEL);
      px(ctx, hx - 3, cy - 12 + b + sw, STEEL_D, 7, 5);
      px(ctx, hx - 2, cy - 14 + b + sw, p.a, 5, 3);
      if (facing !== "north") {
        const sx = facing === "west" ? cx - 10 : facing === "east" ? cx + 8 : cx - 10;
        outlined(ctx, sx - 3, cy - 1 + b, 7, 7, STEEL);
        px(ctx, sx - 1, cy + 1 + b, p.b, 3, 3);
      }
    } else if (id === "hearthmage") {
      const stx = facing === "north" ? cx - 8 : facing === "south" ? cx + 8 : cx + (side || 1) * 9;
      outlined(ctx, stx - 1, cy - 14 + b, 3, 24, WOOD);
      outlined(ctx, stx - 3, cy - 16 + b, 7, 5, "#e07030");
      px(ctx, stx - 1, cy - 15 + b, "#f0d060", 3, 3);
    } else if (id === "verdant") {
      const ox = facing === "west" ? -9 : facing === "east" ? 9 : 8;
      outlined(ctx, cx + ox - 1, cy - 10 + b, 3, 18, WOOD);
      outlined(ctx, cx + ox - 3, cy - 12 + b, 7, 5, p.c);
      px(ctx, cx + ox - 1, cy - 14 + b, "#6ab84a", 3, 3);
    } else if (id === "warden") {
      const hx = facing === "north" || facing === "south" ? cx + 9 : cx + (side || 1) * 10;
      outlined(ctx, hx - 1, cy - 10 + b + sw, 3, 16, STEEL);
      const sx = facing === "west" ? cx - 11 : facing === "east" ? cx + 8 : cx - 11;
      if (facing !== "north") {
        outlined(ctx, sx - 5, cy - 4 + b, 10, 11, p.c);
        px(ctx, sx - 4, cy - 3 + b, STEEL, 8, 9);
        px(ctx, sx - 1, cy - 1 + b, p.b, 3, 7);
        px(ctx, sx - 3, cy + 1 + b, p.b, 7, 3);
      }
    }
  };

  if (weaponFirst) drawWeapon();
  drawLegs(ctx, cx, cy, facing, frame, shadeHex(p.a, 0.55));
  drawTorso(ctx, cx, cy, frame, p.a, id === "thornblade" || id === "warden");
  drawArms(ctx, cx, cy, facing, frame, p.b);
  drawHead(ctx, cx, cy - 8 + b, facing, p.hair);

  if (id === "pathfinder") {
    outlined(ctx, cx - 6, cy - 13 + b, 12, 6, p.b);
    if (facing !== "north") px(ctx, cx - 5, cy - 10 + b, p.b, 10, 4);
    if (facing === "south") px(ctx, cx - 3, cy - 8 + b, SKIN, 6, 2);
    // quiver
    outlined(ctx, cx + (facing === "west" ? -8 : 5), cy - 2 + b, 4, 8, WOOD);
    px(ctx, cx + (facing === "west" ? -7 : 6), cy - 4 + b, p.c, 2, 3);
  } else if (id === "thornblade") {
    px(ctx, cx - 6, cy + 2 + b, p.b, 12, 4);
    outlined(ctx, cx - 5, cy - 14 + b, 10, 4, "#2a2218");
    if (facing === "south") px(ctx, cx - 2, cy - 9 + b, SKIN, 4, 2);
  } else if (id === "hearthmage") {
    px(ctx, cx - 5, cy + 4 + b, p.b, 10, 5);
    outlined(ctx, cx - 8, cy - 12 + b, 16, 4, p.a);
    px(ctx, cx - 5, cy - 18 + b, p.a, 10, 8);
    px(ctx, cx - 4, cy - 17 + b, p.b, 8, 5);
    px(ctx, cx - 1, cy - 20 + b, p.c, 2, 3);
  } else if (id === "verdant") {
    px(ctx, cx - 5, cy + b, p.c, 10, 3);
    outlined(ctx, cx - 5, cy - 13 + b, 10, 5, "#c8a060");
    px(ctx, cx - 6, cy - 12 + b, p.c, 2, 3);
    px(ctx, cx + 4, cy - 12 + b, p.c, 2, 3);
  } else if (id === "warden") {
    px(ctx, cx - 1, cy - 2 + b, p.b, 3, 8);
    px(ctx, cx - 4, cy + 1 + b, p.b, 8, 3);
    outlined(ctx, cx - 6, cy - 13 + b, 12, 6, STEEL);
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
  addPixelVolume(ctx, SHEET, SHEET, 0.13, 0.16);
  return canvas;
}

export function paintSouthPreview(classId: ClassId): HTMLCanvasElement | OffscreenCanvas {
  const canvas = makeCanvas(FRAME, FRAME);
  const ctx = ctx2d(canvas);
  ctx.clearRect(0, 0, FRAME, FRAME);
  ctx.imageSmoothingEnabled = false;
  drawClass(ctx, classId, FRAME / 2, FRAME / 2 + 2, "south", 0);
  addPixelVolume(ctx, FRAME, FRAME, 0.13, 0.16);
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
