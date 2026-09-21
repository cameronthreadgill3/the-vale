/** Procedural 4×4 class walk sheets (stand-ins). Rows S/W/E/N, cols walk frames. */
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
const BOOT = "#3a3228";
const OUT = "#1a1814";
const STEEL = "#8a929a";
const WOOD = "#6b4423";

function bob(frame: number): number {
  return frame === 1 || frame === 3 ? -1 : 0;
}
function spread(frame: number): number {
  return frame === 1 ? 2 : frame === 3 ? -2 : 0;
}

function circ(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string, stroke?: string): void {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function body(ctx: CanvasRenderingContext2D, cx: number, cy: number, facing: Facing, frame: number, color: string, wide = false): void {
  const b = bob(frame);
  const s = spread(frame);
  const w = wide ? 10 : 8;
  ctx.fillStyle = BOOT;
  if (facing === "south" || facing === "north") {
    ctx.fillRect(cx - 4 - s / 2, cy + 6 + b, 3, 6);
    ctx.fillRect(cx + 1 + s / 2, cy + 6 + b, 3, 6);
  } else {
    ctx.fillRect(cx - 2, cy + 6 + b, 4, 6);
  }
  ctx.fillStyle = color;
  ctx.fillRect(cx - w / 2, cy - 4 + b, w, 11);
  circ(ctx, cx, cy - 8 + b, 4.5, SKIN, OUT);
}

function drawClass(ctx: CanvasRenderingContext2D, id: ClassId, cx: number, cy: number, facing: Facing, frame: number): void {
  const p = P[id];
  const b = bob(frame);
  const side = facing === "west" ? -1 : 1;

  if (id === "hollowborn") {
    const s = spread(frame);
    ctx.fillStyle = p.c;
    if (facing === "south" || facing === "north") {
      ctx.fillRect(cx - 4 - s / 2, cy + 5 + b, 3, 7);
      ctx.fillRect(cx + 1 + s / 2, cy + 5 + b, 3, 7);
    } else ctx.fillRect(cx - 2, cy + 5 + b, 4, 7);
    ctx.fillStyle = p.a;
    ctx.fillRect(cx - 5, cy - 3 + b, 10, 9);
    ctx.fillStyle = p.b;
    ctx.fillRect(cx - 5, cy + 3 + b, 10, 3);
    circ(ctx, cx, cy - 8 + b, 5, p.c, OUT);
    ctx.fillStyle = p.c;
    ctx.fillRect(cx + (facing === "west" ? -7 : 6), cy + 1 + b, 3, 3);
    return;
  }

  body(ctx, cx, cy, facing, frame, p.a, id === "thornblade" || id === "warden");

  if (id === "pathfinder") {
    ctx.fillStyle = p.b;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 9 + b, 6, 5.5, 0, facing === "north" ? 0 : Math.PI, facing === "north" ? Math.PI * 2 : 0);
    ctx.fill();
    if (facing !== "north") ctx.fillRect(cx - 6, cy - 9 + b, 12, 4);
    ctx.strokeStyle = WOOD;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const bx = facing === "west" ? cx - 8 : facing === "east" ? cx + 8 : cx + 7;
    ctx.arc(bx, cy + b, 6.5, facing === "west" ? Math.PI - 1.1 : -1.1, facing === "west" ? Math.PI + 1.1 : 1.1);
    ctx.stroke();
  } else if (id === "thornblade") {
    ctx.fillStyle = p.b;
    ctx.fillRect(cx - 6, cy + 2 + b, 12, 4);
    ctx.fillStyle = "#2a2218";
    ctx.fillRect(cx - 4, cy - 12 + b, 8, 3);
    const sx = facing === "west" ? cx - 9 : facing === "east" ? cx + 9 : cx - 9;
    circ(ctx, sx, cy + 1 + b, 5, STEEL, "#4a5258");
    circ(ctx, sx, cy + 1 + b, 2, p.a);
    ctx.strokeStyle = STEEL;
    ctx.lineWidth = 2;
    const hx = facing === "north" || facing === "south" ? cx + 8 : cx + side * 9;
    ctx.beginPath();
    ctx.moveTo(hx, cy - 8 + b);
    ctx.lineTo(hx, cy + 6 + b);
    ctx.stroke();
  } else if (id === "hearthmage") {
    ctx.fillStyle = p.b;
    ctx.fillRect(cx - 5, cy + 4 + b, 10, 5);
    ctx.fillStyle = p.a;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 20 + b);
    ctx.lineTo(cx - 7, cy - 10 + b);
    ctx.lineTo(cx + 7, cy - 10 + b);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(cx - 8, cy - 11 + b, 16, 3);
    circ(ctx, cx, cy - 18 + b, 1.5, p.c);
    const stx = facing === "north" ? cx - 6 : facing === "south" ? cx + 7 : cx + side * 8;
    ctx.strokeStyle = WOOD;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(stx, cy - 14 + b);
    ctx.lineTo(stx, cy + 10 + b);
    ctx.stroke();
    circ(ctx, stx, cy - 15 + b, 3, "#6a9ad4", p.c);
  } else if (id === "verdant") {
    ctx.fillStyle = p.c;
    ctx.fillRect(cx - 5, cy + b, 10, 2);
    ctx.fillStyle = "#c8a060";
    ctx.beginPath();
    ctx.ellipse(cx, cy - 10 + b, 5, 3.5, 0, Math.PI, 0);
    ctx.fill();
    const ox = facing === "west" ? -7 : 7;
    circ(ctx, cx + ox, cy - 2 + b, 2.5, "#b8e090", p.b);
  } else if (id === "warden") {
    ctx.strokeStyle = p.b;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 3 + b);
    ctx.lineTo(cx, cy + 5 + b);
    ctx.moveTo(cx - 3, cy + 1 + b);
    ctx.lineTo(cx + 3, cy + 1 + b);
    ctx.stroke();
    ctx.fillStyle = STEEL;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 9 + b, 5.5, 5, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - 5.5, cy - 9 + b, 11, 4);
    if (facing === "south") {
      ctx.fillStyle = OUT;
      ctx.fillRect(cx - 3, cy - 8 + b, 6, 2);
    }
    const sx = facing === "west" ? cx - 9 : facing === "east" ? cx + 9 : cx - 9;
    ctx.fillStyle = p.a;
    ctx.beginPath();
    ctx.moveTo(sx - 5, cy - 4 + b);
    ctx.lineTo(sx + 5, cy - 4 + b);
    ctx.lineTo(sx + 5, cy + 3 + b);
    ctx.lineTo(sx, cy + 8 + b);
    ctx.lineTo(sx - 5, cy + 3 + b);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = p.b;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, cy - 2 + b);
    ctx.lineTo(sx, cy + 5 + b);
    ctx.moveTo(sx - 3, cy + 1 + b);
    ctx.lineTo(sx + 3, cy + 1 + b);
    ctx.stroke();
    const hx = facing === "north" || facing === "south" ? cx + 8 : cx + side * 9;
    ctx.strokeStyle = STEEL;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hx, cy - 8 + b);
    ctx.lineTo(hx, cy + 6 + b);
    ctx.stroke();
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
