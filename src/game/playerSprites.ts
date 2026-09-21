/** Class walk sprites — generated stand-in sheets (no binary PNG assets). */

import type { ClassId } from "@/game/classes";
import { drawWithWarmRim } from "@/game/gfx/canvasUtil";
import { drawSilhouetteFlash } from "@/game/gfx/hitFlash";
import {
  COLS,
  FRAME,
  ROWS,
  paintClassSheet,
  paintSouthPreview,
  sheetToPngDataUrl,
} from "@/game/playerSpriteSheets";

/** Facing rows in each sheet. */
export type Facing = "south" | "west" | "east" | "north";

const FACING_ROW: Record<Facing, number> = {
  south: 0,
  west: 1,
  east: 2,
  north: 3,
};

/** On-screen draw size (world pixels). */
export const PLAYER_SPRITE_SIZE = 52;
/** Walk cycle advance rate (frames per second while moving). */
export const WALK_FPS = 8;

const sheetCache = new Map<ClassId, HTMLImageElement | null>();
const sheetLoading = new Map<ClassId, Promise<HTMLImageElement | null>>();
const previewUrlCache = new Map<ClassId, string>();
const previewLoading = new Map<ClassId, Promise<string>>();

async function canvasToImage(
  canvas: HTMLCanvasElement | OffscreenCanvas,
): Promise<HTMLImageElement> {
  const url = await sheetToPngDataUrl(canvas);
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("sprite image decode failed"));
    img.src = url;
  });
}

export function preloadPlayerSprite(classId: ClassId): Promise<HTMLImageElement | null> {
  if (sheetCache.has(classId)) return Promise.resolve(sheetCache.get(classId)!);
  const existing = sheetLoading.get(classId);
  if (existing) return existing;
  const p = (async () => {
    try {
      const sheet = paintClassSheet(classId);
      const img = await canvasToImage(sheet);
      sheetCache.set(classId, img);
      return img;
    } catch {
      sheetCache.set(classId, null);
      return null;
    } finally {
      sheetLoading.delete(classId);
    }
  })();
  sheetLoading.set(classId, p);
  return p;
}

export function getPlayerSprite(classId: ClassId): HTMLImageElement | null | undefined {
  if (!sheetCache.has(classId)) {
    void preloadPlayerSprite(classId);
    return undefined;
  }
  return sheetCache.get(classId) ?? null;
}

/** South idle preview as a data: URL (class select). */
export function playerSpritePreviewUrl(classId: ClassId): string {
  const cached = previewUrlCache.get(classId);
  if (cached) return cached;
  // Sync path when HTMLCanvasElement is available (browser).
  try {
    const preview = paintSouthPreview(classId);
    if (preview instanceof HTMLCanvasElement) {
      const url = preview.toDataURL("image/png");
      previewUrlCache.set(classId, url);
      return url;
    }
  } catch {
    /* fall through to async warm */
  }
  if (!previewLoading.has(classId)) {
    const p = (async () => {
      const preview = paintSouthPreview(classId);
      const url = await sheetToPngDataUrl(preview);
      previewUrlCache.set(classId, url);
      previewLoading.delete(classId);
      return url;
    })();
    previewLoading.set(classId, p);
  }
  return "";
}

/** Warm all class sheets + previews (call on boot / class select mount). */
export async function preloadAllPlayerSprites(): Promise<void> {
  const ids: ClassId[] = [
    "warden",
    "thornblade",
    "pathfinder",
    "hearthmage",
    "verdant",
    "hollowborn",
  ];
  await Promise.all(ids.map((id) => preloadPlayerSprite(id)));
  for (const id of ids) {
    playerSpritePreviewUrl(id);
  }
}

/** Derive facing from movement; prefer dominant axis; keep previous if idle. */
export function facingFromMove(dx: number, dy: number, prev: Facing): Facing {
  if (dx === 0 && dy === 0) return prev;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx < 0 ? "west" : "east";
  }
  if (Math.abs(dy) > Math.abs(dx)) {
    return dy < 0 ? "north" : "south";
  }
  if (dx !== 0) return dx < 0 ? "west" : "east";
  return dy < 0 ? "north" : "south";
}

export function drawPlayerSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  px: number,
  py: number,
  facing: Facing,
  frame: number,
  opts?: { flash?: number; glowColor?: string },
): void {
  const fw = img.naturalWidth / COLS || FRAME;
  const fh = img.naturalHeight / ROWS || FRAME;
  const col = ((frame % COLS) + COLS) % COLS;
  const row = FACING_ROW[facing];
  const size = PLAYER_SPRITE_SIZE;
  const dx = Math.floor(px - size / 2);
  const dy = Math.floor(py - size / 2 - 4);

  if (opts?.glowColor) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    const grad = ctx.createRadialGradient(px, py + 2, 2, px, py + 2, size * 0.55);
    grad.addColorStop(0, opts.glowColor);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py + 2, size * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.imageSmoothingEnabled = false;
  drawWithWarmRim(ctx, () => {
    ctx.drawImage(img, col * fw, row * fh, fw, fh, dx, dy, size, size);
  });

  if (opts?.flash && opts.flash > 0) {
    drawSilhouetteFlash(
      ctx,
      img,
      col * fw,
      row * fh,
      fw,
      fh,
      dx,
      dy,
      size,
      size,
      opts.flash,
    );
  }
}
