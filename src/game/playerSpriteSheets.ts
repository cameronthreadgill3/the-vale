/**
 * Procedural 4×4 class walk sheets — chunky outlined pixel figures
 * (original Vale art, Tibia-adjacent proportions — NOT CipSoft sprites).
 */
import type { ClassId } from "@/game/classes";

export const FRAME = 32;
export const COLS = 4;
export const ROWS = 4;
export const SHEET = FRAME * COLS;

type Facing = "south" | "west" | "east" | "north";
const FACINGS: Facing[] = ["south", "west", "east", "north"];

const P: Record<ClassId, { a: string; b: string; c: string }> = {
  pathfinder: { a: "#3d7a45", b: "#2a5530", c: "#c9a227" },
  thornblade: { a: "#c45c3e", b: "#7a3018", c: "#e8e6d9" },
  hearthmage: { a: "#3a5a9e", b: "#243868", c: "#c9a227" },
  verdant: { a: "#8bc46a", b: "#5a9e4a", c: "#e8f0d8" },
  hollowborn: { a: "#e09050", b: "#a86830", c: "#f0d0a8" },
  warden: { a: "#e8e6d9", b: "#3a6aaa", c: "#6b8cae" },
};

const SKIN = "#d4a574";
const BOOT = "#2a2218";
const OUT = "#0e0c0a";
const STEEL = "#8a929a";
const WOOD = "#6b4423";

function bob(frame: number): number {
  return frame === 1 || frame === 3 ? -1 : 0;
}
function spread(frame: number): number {
  return frame === 1 ? 2 : frame === 3 ? -2 : 0;
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string): void {
  ctx.fillStyle = fill;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

function outlinedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
): void {
  rect(ctx, x - 1, y - 1, w + 2, h + 2, OUT);
  rect(ctx, x, y, w, h, fill);
}

function head(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  outlinedRect(ctx, cx - 4, cy - 5, 8, 8, SKIN);
  rect(ctx, cx - 3, cy - 6, 6, 3, "#3a3028");
}

function legs(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  facing: Facing,
  frame: number,
): void {
  const b = bob(frame);
  const s = spread(frame);
  if (facing === "south" || facing === "north") {
    outlinedRect(ctx, cx - 5 - s / 2, cy + 6 + b, 4, 7, BOOT);
    outlinedRect(ctx, cx + 1 + s / 2, cy + 6 + b, 4, 7, BOOT);
  } else {
    outlinedRect(ctx, cx - 2, cy + 6 + b, 5, 7, BOOT);
  }
}

function torso(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  frame: number,
  color: string,
  wide = false,
): void {
  const b = bob(frame);
  const w = wide ? 12 : 10;
  outlinedRect(ctx, cx - w / 2, cy - 4 + b, w, 12, color);
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
  const side = facing === "west" ? -1 : 1;

  if (id === "hollowborn") {
    const s = spread(frame);
    if (facing === "south" || facing === "north") {
      outlinedRect(ctx, cx - 5 - s / 2, cy + 5 + b, 4, 8, p.c);
      outlinedRect(ctx, cx + 1 + s / 2, cy + 5 + b, 4, 8, p.c);
    } else {
      outlinedRect(ctx, cx - 2, cy + 5 + b, 5, 8, p.c);
    }
    outlinedRect(ctx, cx - 6, cy - 3 + b, 12, 10, p.a);
    rect(ctx, cx - 6, cy + 4 + b, 12, 3, p.b);
    outlinedRect(ctx, cx - 5, cy - 10 + b, 10, 9, p.c);
    rect(ctx, cx + (facing === "west" ? -8 : 6), cy + 1 + b, 4, 4, p.c);
    return;
  }

  legs(ctx, cx, cy, facing, frame);
  torso(ctx, cx, cy, frame, p.a, id === "thornblade" || id === "warden");
  head(ctx, cx, cy - 8 + b);

  if (id === "pathfinder") {
    // hood
    outlinedRect(ctx, cx - 6, cy - 12 + b, 12, 6, p.b);
    if (facing !== "north") rect(ctx, cx - 6, cy - 9 + b, 12, 4, p.b);
    // bow
    ctx.strokeStyle = WOOD;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const bx = facing === "west" ? cx - 9 : facing === "east" ? cx + 9 : cx + 8;
    ctx.arc(bx, cy + b, 7, facing === "west" ? Math.PI - 1.1 : -1.1, facing === "west" ? Math.PI + 1.1 : 1.1);
    ctx.stroke();
  } else if (id === "thornblade") {
    rect(ctx, cx - 6, cy + 2 + b, 12, 4, p.b);
    outlinedRect(ctx, cx - 5, cy - 14 + b, 10, 4, "#2a2218");
    const sx = facing === "west" ? cx - 10 : facing === "east" ? cx + 10 : cx - 10;
    outlinedRect(ctx, sx - 4, cy - 2 + b, 8, 8, STEEL);
    rect(ctx, sx - 2, cy + b, 4, 4, p.a);
    const hx = facing === "north" || facing === "south" ? cx + 9 : cx + side * 10;
    outlinedRect(ctx, hx - 1, cy - 10 + b, 3, 16, STEEL);
  } else if (id === "hearthmage") {
    rect(ctx, cx - 5, cy + 4 + b, 10, 5, p.b);
    // hat
    outlinedRect(ctx, cx - 8, cy - 12 + b, 16, 4, p.a);
    rect(ctx, cx - 5, cy - 18 + b, 10, 8, p.a);
    rect(ctx, cx - 1, cy - 20 + b, 2, 3, p.c);
    const stx = facing === "north" ? cx - 7 : facing === "south" ? cx + 8 : cx + side * 9;
    outlinedRect(ctx, stx - 1, cy - 14 + b, 3, 24, WOOD);
    outlinedRect(ctx, stx - 3, cy - 16 + b, 7, 5, "#6a9ad4");
  } else if (id === "verdant") {
    rect(ctx, cx - 5, cy + b, 10, 3, p.c);
    outlinedRect(ctx, cx - 5, cy - 12 + b, 10, 5, "#c8a060");
    const ox = facing === "west" ? -8 : 8;
    outlinedRect(ctx, cx + ox - 2, cy - 3 + b, 5, 5, "#b8e090");
  } else if (id === "warden") {
    // tabard cross
    rect(ctx, cx - 1, cy - 2 + b, 3, 8, p.b);
    rect(ctx, cx - 4, cy + 1 + b, 8, 3, p.b);
    outlinedRect(ctx, cx - 6, cy - 12 + b, 12, 6, STEEL);
    if (facing === "south") rect(ctx, cx - 3, cy - 9 + b, 6, 2, OUT);
    const sx = facing === "west" ? cx - 10 : facing === "east" ? cx + 10 : cx - 10;
    outlinedRect(ctx, sx - 5, cy - 4 + b, 10, 10, p.a);
    rect(ctx, sx - 1, cy - 1 + b, 3, 7, p.b);
    rect(ctx, sx - 3, cy + 1 + b, 7, 3, p.b);
    const hx = facing === "north" || facing === "south" ? cx + 9 : cx + side * 10;
    outlinedRect(ctx, hx - 1, cy - 10 + b, 3, 16, STEEL);
  }
}

function makeCanvas(w: number, h: number): HTMLCanvasElement | OffscreenCanvas {
  if (typeof document !== "undefined") {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  throw new Error("No canvas available");
}

function ctx2d(c: HTMLCanvasElement | OffscreenCanvas): CanvasRenderingContext2D {
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  return ctx as CanvasRenderingContext2D;
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
  return canvas;
}

export function paintSouthPreview(classId: ClassId): HTMLCanvasElement | OffscreenCanvas {
  const canvas = makeCanvas(FRAME, FRAME);
  const ctx = ctx2d(canvas);
  ctx.clearRect(0, 0, FRAME, FRAME);
  ctx.imageSmoothingEnabled = false;
  drawClass(ctx, classId, FRAME / 2, FRAME / 2 + 2, "south", 0);
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
