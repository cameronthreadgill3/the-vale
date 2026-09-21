/** Shared canvas helpers for procedural pixel sheets (original Vale art — not CipSoft). */

export function makeCanvas(w: number, h: number): HTMLCanvasElement | OffscreenCanvas {
  if (typeof document !== "undefined") {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  throw new Error("No canvas available");
}

export function ctx2d(c: HTMLCanvasElement | OffscreenCanvas): CanvasRenderingContext2D {
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  const c2 = ctx as CanvasRenderingContext2D;
  c2.imageSmoothingEnabled = false;
  return c2;
}

/** Integer pixel plotter for chunky outlined sprites. */
export function px(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  w = 1,
  h = 1,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
}

export function shadeHex(hex: string, factor: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const r = Math.max(0, Math.min(255, Math.round(parseInt(h.slice(0, 2), 16) * factor)));
  const g = Math.max(0, Math.min(255, Math.round(parseInt(h.slice(2, 4), 16) * factor)));
  const b = Math.max(0, Math.min(255, Math.round(parseInt(h.slice(4, 6), 16) * factor)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function mixHex(a: string, b: string, t: number): string {
  const ha = a.replace("#", "");
  const hb = b.replace("#", "");
  if (ha.length !== 6 || hb.length !== 6) return a;
  const lerp = (x: number, y: number) => Math.round(x + (y - x) * t);
  const r = lerp(parseInt(ha.slice(0, 2), 16), parseInt(hb.slice(0, 2), 16));
  const g = lerp(parseInt(ha.slice(2, 4), 16), parseInt(hb.slice(2, 4), 16));
  const bl = lerp(parseInt(ha.slice(4, 6), 16), parseInt(hb.slice(4, 6), 16));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

/**
 * Two-layer elliptical drop shadow (outer wash + darker contact).
 * Cheap, no blur filter — reads as ground contact for depth sorting.
 */
export function drawSoftShadow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  alpha = 0.32,
): void {
  const x = Math.floor(cx);
  const y = Math.floor(cy) + 1;
  ctx.save();
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.42})`;
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(2, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.75})`;
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(1, rx * 0.5), Math.max(1, ry * 0.48), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
