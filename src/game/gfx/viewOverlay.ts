/**
 * Screen-space dust and a light bloom overlay.
 * Drawn after the world pass so plaza air sits in front of tiles.
 * World-locked leaves and embers stay in atmosphere.ts — this layer does not sort with them.
 * Original Vale pixels only. Not a full-screen post stack.
 */
import { makeCanvas } from "@/game/gfx/canvasUtil";

const SPECKS = 30;
/** Wilds keep a thin drift; the plaza wakes the rest of the pool. */
const SPECKS_WILD = 16;

const TONES = ["#efe4cc", "#e4cc8c", "#d2e0cc", "#f6f1e4"] as const;

type Speck = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  w: number;
  h: number;
  tone: number;
};

let specks: Speck[] | null = null;
let laidW = 0;
let laidH = 0;

function ensureSpecks(viewW: number, viewH: number): Speck[] {
  if (!specks) {
    specks = [];
    for (let i = 0; i < SPECKS; i++) {
      specks.push({
        x: 0,
        y: 0,
        vx: 7 + Math.random() * 13,
        vy: -9 + Math.random() * 12,
        phase: Math.random() * Math.PI * 2,
        w: i % 6 === 0 ? 2 : 1,
        h: i % 9 === 0 ? 2 : 1,
        tone: i % TONES.length,
      });
    }
  }
  if (Math.abs(viewW - laidW) > 80 || Math.abs(viewH - laidH) > 80) {
    laidW = viewW;
    laidH = viewH;
    for (const s of specks) {
      s.x = Math.random() * viewW;
      s.y = Math.random() * viewH;
    }
  }
  return specks;
}

function tickSpecks(dt: number, timeSec: number, viewW: number, viewH: number, pool: Speck[]): void {
  const wind = Math.sin(timeSec * 0.37) * 6;
  const margin = 8;
  for (const s of pool) {
    s.x += (s.vx + wind) * dt;
    s.y += s.vy * dt;
    if (s.x > viewW + margin) s.x = -margin;
    else if (s.x < -margin) s.x = viewW + margin;
    if (s.y > viewH + margin) s.y = -margin;
    else if (s.y < -margin) s.y = viewH + margin;
  }
}

function drawSpecks(
  ctx: CanvasRenderingContext2D,
  pool: Speck[],
  count: number,
  timeSec: number,
  plaza: number,
): void {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const s = pool[i]!;
    const pulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(timeSec * 1.05 + s.phase));
    const bob = Math.sin(timeSec * 1.25 + s.phase) * 2.2;
    ctx.globalAlpha = (0.16 + plaza * 0.22) * pulse;
    ctx.fillStyle = TONES[s.tone]!;
    ctx.fillRect(Math.floor(s.x), Math.floor(s.y + bob), s.w, s.h);
  }
  ctx.restore();
}

/** Luma where a CSS pixel may glow. Grass tips sit under this; flames and foam clear it. */
const BLOOM_KNEE = 158;
const BLOOM_POOL = 4;
const MAX_SAMPLE = 1280;

type BloomBuf = {
  sample: HTMLCanvasElement | OffscreenCanvas;
  sctx: CanvasRenderingContext2D;
  bloom: HTMLCanvasElement | OffscreenCanvas;
  bctx: CanvasRenderingContext2D;
  soft: HTMLCanvasElement | OffscreenCanvas;
  octx: CanvasRenderingContext2D;
  sw: number;
  sh: number;
  bw: number;
  bh: number;
  peaks: ImageData | null;
};

let bloomBuf: BloomBuf | null = null;

function readCtx(canvas: HTMLCanvasElement | OffscreenCanvas): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  return (ctx as CanvasRenderingContext2D | null) ?? null;
}

function ensureBloom(sw: number, sh: number): BloomBuf | null {
  const bw = Math.max(1, Math.ceil(sw / BLOOM_POOL));
  const bh = Math.max(1, Math.ceil(sh / BLOOM_POOL));
  if (bloomBuf && bloomBuf.sw === sw && bloomBuf.sh === sh && bloomBuf.bw === bw && bloomBuf.bh === bh) {
    return bloomBuf;
  }
  const sample = makeCanvas(sw, sh);
  const bloom = makeCanvas(bw, bh);
  const soft = makeCanvas(bw, bh);
  const sctx = readCtx(sample);
  const bctx = readCtx(bloom);
  const octx = readCtx(soft);
  if (!sctx || !bctx || !octx) return null;
  bloomBuf = { sample, sctx, bloom, bctx, soft, octx, sw, sh, bw, bh, peaks: null };
  return bloomBuf;
}

function sampleSize(viewW: number, viewH: number): { sw: number; sh: number } {
  let sw = Math.max(1, Math.floor(viewW));
  let sh = Math.max(1, Math.floor(viewH));
  if (sw > MAX_SAMPLE) {
    sh = Math.max(1, Math.round(sh * (MAX_SAMPLE / sw)));
    sw = MAX_SAMPLE;
  }
  return { sw, sh };
}

/**
 * Max-pool the CSS-resolution frame, keep only bright pixels, blur the tiny
 * buffer, and add it back. One overlay — not a stack of grade passes.
 */
function drawBloom(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  viewH: number,
  plaza: number,
): void {
  const { sw, sh } = sampleSize(viewW, viewH);
  const buf = ensureBloom(sw, sh);
  if (!buf) return;
  const { sctx, bctx, octx, bloom, soft, bw, bh } = buf;

  sctx.imageSmoothingEnabled = true;
  sctx.clearRect(0, 0, sw, sh);
  sctx.drawImage(ctx.canvas, 0, 0, sw, sh);
  const src = sctx.getImageData(0, 0, sw, sh);
  const data = src.data;

  if (!buf.peaks || buf.peaks.width !== bw || buf.peaks.height !== bh) {
    buf.peaks = bctx.createImageData(bw, bh);
  }
  const peaks = buf.peaks;
  peaks.data.fill(0);
  const out = peaks.data;

  for (let by = 0; by < bh; by++) {
    const y0 = by * BLOOM_POOL;
    const y1 = Math.min(sh, y0 + BLOOM_POOL);
    for (let bx = 0; bx < bw; bx++) {
      const x0 = bx * BLOOM_POOL;
      const x1 = Math.min(sw, x0 + BLOOM_POOL);
      let best = -1;
      let br = 0;
      let bg = 0;
      let bb = 0;
      for (let y = y0; y < y1; y++) {
        let i = (y * sw + x0) * 4;
        for (let x = x0; x < x1; x++) {
          const r = data[i]!;
          const g = data[i + 1]!;
          const b = data[i + 2]!;
          const lum = r * 54 + g * 183 + b * 19;
          if (lum > best) {
            best = lum;
            br = r;
            bg = g;
            bb = b;
          }
          i += 4;
        }
      }
      if (best < 0) continue;
      const lum8 = best >> 8;
      if (lum8 <= BLOOM_KNEE) continue;
      const t = (lum8 - BLOOM_KNEE) / (255 - BLOOM_KNEE);
      const warm = br > bb + 24;
      const gain = warm ? 1 : 0.42;
      const a = Math.min(255, Math.round(t * t * gain * 255));
      if (a < 8) continue;
      const oi = (by * bw + bx) * 4;
      out[oi] = br;
      out[oi + 1] = bg;
      out[oi + 2] = bb;
      out[oi + 3] = a;
    }
  }
  bctx.putImageData(peaks, 0, 0);

  octx.clearRect(0, 0, bw, bh);
  octx.imageSmoothingEnabled = true;
  octx.filter = "blur(1.6px)";
  octx.drawImage(bloom, 0, 0);
  octx.filter = "none";

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.16 + plaza * 0.1;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(soft as CanvasImageSource, 0, 0, viewW, viewH);
  ctx.restore();
}

export type ViewOverlayOpts = {
  dt: number;
  timeSec: number;
  viewW: number;
  viewH: number;
  /** Overworld. Hollows keep their own torch pass and skip lens dust. */
  outdoor: boolean;
  /** 0–1 Thornreach plaza. More motes, a little more bloom. */
  plaza: number;
};

/** Dust in the lens, then a soft glow on the bright pixels already in the frame. */
export function drawViewOverlay(ctx: CanvasRenderingContext2D, opts: ViewOverlayOpts): void {
  const viewW = opts.viewW;
  const viewH = opts.viewH;
  if (viewW < 8 || viewH < 8) return;
  const plaza = Math.max(0, Math.min(1, opts.plaza));
  const dt = Math.max(0, Math.min(0.05, opts.dt));

  drawBloom(ctx, viewW, viewH, plaza);

  if (!opts.outdoor) return;
  const pool = ensureSpecks(viewW, viewH);
  tickSpecks(dt, opts.timeSec, viewW, viewH, pool);
  const count = Math.round(SPECKS_WILD + (SPECKS - SPECKS_WILD) * plaza);
  drawSpecks(ctx, pool, count, opts.timeSec, plaza);
}
