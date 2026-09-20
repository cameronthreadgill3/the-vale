/** Class walk sheets: 4 cols × 4 rows (S, W, E, N), frame 0 = idle. */

import { asset } from "@/game/assets";
import type { ClassId } from "@/game/classes";

/** Facing rows in each sheet (must match cropped assets). */
export type Facing = "south" | "west" | "east" | "north";

const FACING_ROW: Record<Facing, number> = {
  south: 0,
  west: 1,
  east: 2,
  north: 3,
};

const COLS = 4;
const ROWS = 4;
/** On-screen draw size (world pixels). */
export const PLAYER_SPRITE_SIZE = 36;
/** Walk cycle advance rate (frames per second while moving). */
export const WALK_FPS = 8;

const cache = new Map<ClassId, HTMLImageElement | null>();
const loading = new Map<ClassId, Promise<HTMLImageElement | null>>();

export function playerSpriteUrl(classId: ClassId): string {
  return asset(`sprites/player/${classId}.png`);
}

export function preloadPlayerSprite(classId: ClassId): Promise<HTMLImageElement | null> {
  if (cache.has(classId)) return Promise.resolve(cache.get(classId)!);
  const existing = loading.get(classId);
  if (existing) return existing;
  const p = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      cache.set(classId, img);
      loading.delete(classId);
      resolve(img);
    };
    img.onerror = () => {
      cache.set(classId, null);
      loading.delete(classId);
      resolve(null);
    };
    img.src = playerSpriteUrl(classId);
  });
  loading.set(classId, p);
  return p;
}

export function getPlayerSprite(classId: ClassId): HTMLImageElement | null | undefined {
  if (!cache.has(classId)) {
    void preloadPlayerSprite(classId);
    return undefined;
  }
  return cache.get(classId) ?? null;
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
  const fw = img.naturalWidth / COLS;
  const fh = img.naturalHeight / ROWS;
  const col = ((frame % COLS) + COLS) % COLS;
  const row = FACING_ROW[facing];
  const size = PLAYER_SPRITE_SIZE;
  const dx = Math.floor(px - size / 2);
  const dy = Math.floor(py - size / 2 - 4);

  if (opts?.glowColor) {
    ctx.save();
    ctx.globalAlpha = 0.35;
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
  ctx.drawImage(img, col * fw, row * fh, fw, fh, dx, dy, size, size);

  if (opts?.flash && opts.flash > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.4, opts.flash * 2);
    ctx.fillStyle = "#ff503c";
    ctx.beginPath();
    ctx.arc(px, py, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
