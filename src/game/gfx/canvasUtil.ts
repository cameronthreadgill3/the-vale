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

/** Shared ground-contact alpha so player / folk / creatures sit on the same plane. */
export const GROUND_SHADOW_ALPHA = 0.38;

/**
 * Three-layer elliptical drop shadow (outer wash + mid + darker contact).
 * Cheap, no blur filter — light from the north-west, contact sits slightly south-east.
 */
export function drawSoftShadow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  alpha = GROUND_SHADOW_ALPHA,
): void {
  const x = Math.floor(cx) + 1;
  const y = Math.floor(cy) + 2;
  const outerRx = Math.max(3, rx * 1.28);
  const outerRy = Math.max(2, ry * 1.36);
  ctx.save();
  ctx.fillStyle = `rgba(12, 14, 8, ${alpha * 0.22})`;
  ctx.beginPath();
  ctx.ellipse(x, y, outerRx, outerRy, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.4})`;
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(2, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.78})`;
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(1, rx * 0.48), Math.max(1, ry * 0.42), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * 1px form light on a character draw: warm north-west rim, cool south-east shade.
 * Matches the key light. Blur stays off so the pixel edge stays crisp.
 * Ground contact is drawn separately and does not pick up this shadow.
 */
export function drawWithWarmRim(
  ctx: CanvasRenderingContext2D,
  draw: () => void,
): void {
  ctx.save();
  ctx.shadowColor = "rgba(36, 58, 78, 0.42)";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  draw();
  ctx.restore();
  ctx.save();
  ctx.shadowColor = "rgba(255, 216, 164, 0.8)";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = -1;
  ctx.shadowOffsetY = -1;
  draw();
  ctx.restore();
}

function luma(r: number, g: number, b: number): number {
  return 0.3 * r + 0.59 * g + 0.11 * b;
}

/**
 * Painted NW highlight + SE shade on a filled rect (light from the north-west).
 * Use on torso/body masses so volume still reads after the sheet is scaled up;
 * `addPixelVolume` only bevels 1px silhouette edges.
 */
export function paintVolume(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  highlight = 1.2,
  shade = 0.74,
  form = false,
): void {
  if (w < 2 || h < 2) return;
  const hw = Math.max(1, Math.floor(w * (form ? 0.4 : 0.46)));
  const hh = Math.max(1, Math.floor(h * (form ? 0.3 : 0.34)));
  const sw = Math.max(1, Math.floor(w * (form ? 0.42 : 0.38)));
  const sh = Math.max(1, Math.floor(h * (form ? 0.4 : 0.36)));
  px(ctx, x, y, shadeHex(fill, highlight), hw, hh);
  px(ctx, x + (w - sw), y + (h - sh), shadeHex(fill, shade), sw, sh);
  if (!form || w < 5 || h < 4) return;
  // 1px L rim so the mass turns instead of reading as a flat lit card.
  const rimH = shadeHex(fill, Math.min(1.4, highlight + 0.12));
  const rimS = shadeHex(fill, Math.max(0.55, shade * 0.88));
  px(ctx, x, y, rimH, w - 1, 1);
  px(ctx, x, y + 1, rimH, 1, Math.max(1, Math.floor(h * 0.42)));
  px(ctx, x + 1, y + h - 1, rimS, w - 2, 1);
  px(ctx, x + w - 1, y + Math.floor(h * 0.4), rimS, 1, Math.max(1, h - Math.floor(h * 0.4) - 1));
}

/**
 * Subtle NW highlight / SE shade on opaque fill pixels.
 * Near-black outline ink is left alone and treated as empty so chunky Vale
 * outlines still get a volume bevel on the fill they wrap.
 */
export function addPixelVolume(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  highlight = 0.12,
  shade = 0.16,
): void {
  const img = ctx.getImageData(0, 0, w, h);
  const src = img.data;
  const out = new Uint8ClampedArray(src);
  const at = (x: number, y: number) => (y * w + x) * 4;
  const fillAt = (x: number, y: number): boolean => {
    if (x < 0 || y < 0 || x >= w || y >= h) return false;
    const i = at(x, y);
    if (src[i + 3]! <= 20) return false;
    return luma(src[i]!, src[i + 1]!, src[i + 2]!) >= 26;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = at(x, y);
      if (!fillAt(x, y)) continue;
      let t = 0;
      if (!fillAt(x, y - 1) || !fillAt(x - 1, y)) t += highlight;
      if (!fillAt(x, y + 1) || !fillAt(x + 1, y)) t -= shade;
      if (t === 0) continue;
      const r = src[i]!;
      const g = src[i + 1]!;
      const b = src[i + 2]!;
      const lift = (c: number) =>
        t > 0
          ? Math.round(c + (255 - c) * t)
          : Math.round(c * (1 + t));
      out[i] = Math.max(0, Math.min(255, lift(r)));
      out[i + 1] = Math.max(0, Math.min(255, lift(g)));
      out[i + 2] = Math.max(0, Math.min(255, lift(b)));
    }
  }
  src.set(out);
  ctx.putImageData(img, 0, 0);
}
