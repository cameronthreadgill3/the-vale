/**
 * Distant ambient fauna for the overworld.
 * A far flock and a few solo bird silhouettes sit behind actors and canopy.
 * Wider gliders and high ash motes pass over the crowns.
 * No combat AI, collision, or loot. Not creature sheets.
 * Grove leaf/ash drift stays in ashDrift.ts. Ground motes stay in atmosphere.ts.
 * Screen dust and bloom stay in viewOverlay.ts. This pass does not share those lists.
 * Original Vale pixels only — not CipSoft.
 * Alpha stays soft so wayfinding, drawn later, stays readable.
 */
import type { ContinentId } from "@/game/continents";
import type { WorldMap } from "@/game/world";

type Layer = "far" | "above";
type Form = "flock" | "chevron" | "glider";

type Member = { ox: number; oy: number; seed: number };

type Flyer = {
  x: number;
  y: number;
  /** Screen pixels per second. World speed is this divided by parallax. */
  svx: number;
  svy: number;
  seed: number;
  /** Lower parallax sits farther from the ground. */
  p: number;
  layer: Layer;
  form: Form;
  members: readonly Member[];
};

type Ash = {
  x: number;
  y: number;
  svx: number;
  svy: number;
  seed: number;
  dim: boolean;
};

type Ink = { body: string; tip: string; ash: string };
type Paint = { body: string; soft: string; tip: string };

const ASH_P = 0.3;
const ASH_COUNT = 12;

const FLOCK_A: readonly Member[] = [
  { ox: 0, oy: 0, seed: 0.2 },
  { ox: -6, oy: 2, seed: 1.4 },
  { ox: -11, oy: -1, seed: 2.2 },
  { ox: -5, oy: -3, seed: 3.1 },
  { ox: -3, oy: 3, seed: 4.0 },
  { ox: -9, oy: 4, seed: 5.3 },
];

const FLOCK_B: readonly Member[] = [
  { ox: 0, oy: 0, seed: 0.6 },
  { ox: 7, oy: -2, seed: 1.8 },
  { ox: 12, oy: 2, seed: 2.9 },
  { ox: 5, oy: 4, seed: 4.4 },
];

const SOLO: readonly Member[] = [{ ox: 0, oy: 0, seed: 0 }];

const FLYERS: Flyer[] = [
  flyer("far", "flock", 0.12, 22, 1.2, 1.1, FLOCK_A),
  flyer("far", "flock", 0.15, -17, -0.8, 2.4, FLOCK_B),
  flyer("far", "chevron", 0.22, 28, 1.6, 3.2, SOLO),
  flyer("far", "chevron", 0.2, -24, -1.1, 4.5, SOLO),
  flyer("far", "chevron", 0.24, 20, 0.6, 5.8, SOLO),
  flyer("above", "glider", 0.52, 46, 2.2, 0.7, SOLO),
  flyer("above", "glider", 0.48, -40, -1.4, 1.9, SOLO),
  flyer("above", "glider", 0.5, 34, 1.1, 3.6, SOLO),
];

const ASH: Ash[] = Array.from({ length: ASH_COUNT }, (_, i) => ({
  x: 0,
  y: 0,
  svx: (i % 2 === 0 ? 1 : -1) * (10 + (i % 5) * 2),
  svy: ((i % 3) - 1) * 0.7,
  seed: i * 1.7 + 0.3,
  dim: i % 3 === 0,
}));

const SPOTS: readonly (readonly [number, number])[] = [
  [0.12, 0.22],
  [0.78, 0.58],
  [0.4, 0.16],
  [0.86, 0.38],
  [0.28, 0.72],
  [0.18, 0.34],
  [0.62, 0.2],
  [0.9, 0.66],
];

const INK: Record<ContinentId, Ink> = {
  thornreach: { body: "14, 20, 12", tip: "206, 204, 186", ash: "178, 174, 156" },
  "verdant-spine": { body: "12, 22, 14", tip: "198, 206, 176", ash: "168, 180, 150" },
  mistmere: { body: "14, 24, 26", tip: "190, 206, 204", ash: "170, 186, 184" },
  "sunken-choir": { body: "14, 22, 28", tip: "186, 200, 206", ash: "164, 178, 186" },
  "ashen-marches": { body: "26, 18, 14", tip: "196, 176, 156", ash: "186, 164, 140" },
  embercoil: { body: "28, 16, 12", tip: "198, 168, 142", ash: "190, 150, 120" },
  "pale-wastes": { body: "28, 34, 38", tip: "214, 220, 224", ash: "196, 204, 208" },
  "nightglass-coast": { body: "12, 14, 22", tip: "176, 176, 196", ash: "160, 162, 180" },
};

let realm: ContinentId | "" = "";
let shown = false;

function flyer(
  layer: Layer,
  form: Form,
  p: number,
  svx: number,
  svy: number,
  seed: number,
  members: readonly Member[],
): Flyer {
  return { x: 0, y: 0, svx, svy, seed, p, layer, form, members };
}

function rand(): number {
  return Math.random();
}

function rgba(rgb: string, a: number): string {
  return `rgba(${rgb}, ${a})`;
}

/** Same slow clock as grove drift, signed and screen-scaled so the high air leans with the leaves. */
function gustAt(timeSec: number): number {
  return Math.sin(timeSec * 0.29) * 8 + Math.sin(timeSec * 0.07) * 3;
}

const PROJ = { sx: 0, sy: 0 };

/** Reused screen point. Callers must copy the numbers before the next project. */
function project(
  x: number,
  y: number,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  p: number,
): { sx: number; sy: number } {
  const camX = originX + viewW / 2;
  const camY = originY + viewH / 2;
  PROJ.sx = viewW / 2 + (x - camX) * p;
  PROJ.sy = viewH / 2 + (y - camY) * p;
  return PROJ;
}

function screenToWorld(
  sx: number,
  sy: number,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  p: number,
): { x: number; y: number } {
  const camX = originX + viewW / 2;
  const camY = originY + viewH / 2;
  return {
    x: camX + (sx - viewW / 2) / p,
    y: camY + (sy - viewH / 2) / p,
  };
}

function scatter(originX: number, originY: number, viewW: number, viewH: number): void {
  for (let i = 0; i < FLYERS.length; i++) {
    const f = FLYERS[i]!;
    const spot = SPOTS[i] ?? [0.5, 0.5];
    const sx = spot[0] * viewW + (rand() - 0.5) * 36;
    const sy = spot[1] * viewH + (rand() - 0.5) * 28;
    const w = screenToWorld(sx, sy, originX, originY, viewW, viewH, f.p);
    f.x = w.x;
    f.y = w.y;
  }
  for (let i = 0; i < ASH.length; i++) {
    const a = ASH[i]!;
    const sx = ((i + 0.5) / ASH.length) * viewW + (rand() - 0.5) * 24;
    const sy = rand() * viewH;
    const w = screenToWorld(sx, sy, originX, originY, viewW, viewH, ASH_P);
    a.x = w.x;
    a.y = w.y;
  }
}

/** Fold a screen coordinate back to the far edge. One step covers a camera teleport. */
function wrapScreen(s: number, view: number, margin: number): number {
  if (s >= -margin && s <= view + margin) return s;
  const span = view + margin * 2;
  const shifted = s + margin;
  const m = ((shifted % span) + span) % span;
  return m - margin;
}

function commitWrap(
  target: { x: number; y: number },
  p: number,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  margin: number,
  sx: number,
  sy: number,
  offX: boolean,
  offY: boolean,
): void {
  if (!offX && !offY) return;
  const nx = offX ? wrapScreen(sx, viewW, margin) : sx;
  const ny = offY ? wrapScreen(sy, viewH, margin) : sy;
  const camX = originX + viewW / 2;
  const camY = originY + viewH / 2;
  target.x = camX + (nx - viewW / 2) / p;
  target.y = camY + (ny - viewH / 2) / p;
}

function wrapFlyer(f: Flyer, originX: number, originY: number, viewW: number, viewH: number): void {
  const { sx, sy } = project(f.x, f.y, originX, originY, viewW, viewH, f.p);
  let minX = sx;
  let maxX = sx;
  let minY = sy;
  let maxY = sy;
  for (let i = 0; i < f.members.length; i++) {
    const m = f.members[i]!;
    const mx = sx + m.ox;
    const my = sy + m.oy;
    if (mx < minX) minX = mx;
    if (mx > maxX) maxX = mx;
    if (my < minY) minY = my;
    if (my > maxY) maxY = my;
  }
  const margin = 20;
  commitWrap(
    f,
    f.p,
    originX,
    originY,
    viewW,
    viewH,
    margin,
    sx,
    sy,
    maxX < -margin || minX > viewW + margin,
    maxY < -margin || minY > viewH + margin,
  );
}

/** Advance distant birds and high ash. No-op in hollows. */
export function tickAmbientFauna(
  dt: number,
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  timeSec: number,
): void {
  if (map.kind !== "overworld" || viewW < 32 || viewH < 32) {
    shown = false;
    if (map.kind !== "overworld") realm = "";
    return;
  }
  if (realm !== map.continentId) {
    realm = map.continentId;
    scatter(originX, originY, viewW, viewH);
  }
  shown = true;
  const step = Math.max(0, Math.min(0.05, dt));
  const gust = gustAt(timeSec);
  for (let i = 0; i < FLYERS.length; i++) {
    const f = FLYERS[i]!;
    f.x += ((f.svx + gust) / f.p) * step;
    f.y += (f.svy / f.p) * step;
    wrapFlyer(f, originX, originY, viewW, viewH);
  }
  for (let i = 0; i < ASH.length; i++) {
    const a = ASH[i]!;
    a.x += ((a.svx + gust * 0.55) / ASH_P) * step;
    a.y += (a.svy / ASH_P) * step;
    const pos = project(a.x, a.y, originX, originY, viewW, viewH, ASH_P);
    commitWrap(
      a,
      ASH_P,
      originX,
      originY,
      viewW,
      viewH,
      10,
      pos.sx,
      pos.sy,
      pos.sx < -10 || pos.sx > viewW + 10,
      pos.sy < -10 || pos.sy > viewH + 10,
    );
  }
}

function paintFar(ink: Ink): Paint {
  return {
    body: rgba(ink.body, 0.84),
    soft: rgba(ink.body, 0.64),
    tip: rgba(ink.tip, 0.38),
  };
}

function paintAbove(ink: Ink): Paint {
  return {
    body: rgba(ink.body, 0.7),
    soft: rgba(ink.body, 0.54),
    tip: rgba(ink.tip, 0.42),
  };
}

function flapUp(timeSec: number, seed: number, form: Form): boolean {
  const rate = form === "glider" ? 2.2 : form === "chevron" ? 1.7 : 1.35;
  return Math.sin(timeSec * rate + seed) > 0;
}

function drawFlockMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  up: boolean,
  body: string,
): void {
  ctx.fillStyle = body;
  if (up) {
    ctx.fillRect(x, y, 1, 1);
    ctx.fillRect(x + 2, y, 1, 1);
    ctx.fillRect(x + 1, y + 1, 1, 1);
  } else {
    ctx.fillRect(x + 1, y, 1, 1);
    ctx.fillRect(x, y + 1, 1, 1);
    ctx.fillRect(x + 2, y + 1, 1, 1);
  }
}

function drawChevron(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  up: boolean,
  body: string,
  tip: string,
  leadRight: boolean,
): void {
  ctx.fillStyle = body;
  if (up) {
    ctx.fillRect(x, y, 1, 1);
    ctx.fillRect(x + 4, y, 1, 1);
    ctx.fillRect(x + 1, y + 1, 1, 1);
    ctx.fillRect(x + 3, y + 1, 1, 1);
    ctx.fillRect(x + 2, y + 2, 1, 1);
  } else {
    ctx.fillRect(x + 2, y, 1, 1);
    ctx.fillRect(x + 1, y + 1, 1, 1);
    ctx.fillRect(x + 3, y + 1, 1, 1);
    ctx.fillRect(x, y + 2, 1, 1);
    ctx.fillRect(x + 4, y + 2, 1, 1);
  }
  ctx.fillStyle = tip;
  const tx = leadRight ? x + 4 : x;
  ctx.fillRect(tx, up ? y : y + 2, 1, 1);
}

function drawGlider(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  up: boolean,
  body: string,
  tip: string,
  leadRight: boolean,
): void {
  ctx.fillStyle = body;
  ctx.fillRect(x + 2, y + 1, 5, 1);
  if (up) {
    ctx.fillRect(x, y, 1, 1);
    ctx.fillRect(x + 8, y, 1, 1);
    ctx.fillRect(x + 1, y + 1, 1, 1);
    ctx.fillRect(x + 7, y + 1, 1, 1);
  } else {
    ctx.fillRect(x + 1, y + 1, 1, 1);
    ctx.fillRect(x + 7, y + 1, 1, 1);
    ctx.fillRect(x, y + 2, 1, 1);
    ctx.fillRect(x + 8, y + 2, 1, 1);
  }
  ctx.fillStyle = tip;
  ctx.fillRect(leadRight ? x + 8 : x, up ? y : y + 2, 1, 1);
}

function drawFlyer(
  ctx: CanvasRenderingContext2D,
  f: Flyer,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  timeSec: number,
  paint: Paint,
): void {
  const proj = project(f.x, f.y, originX, originY, viewW, viewH, f.p);
  const bob = Math.round(Math.sin(timeSec * 0.8 + f.seed) * (f.form === "glider" ? 2 : 1));
  const sx = Math.round(proj.sx);
  const sy = Math.round(proj.sy) + bob;
  const leadRight = f.svx >= 0;
  for (let i = 0; i < f.members.length; i++) {
    const m = f.members[i]!;
    const ox = m.ox + Math.round(Math.sin(timeSec * 0.7 + m.seed + f.seed));
    const oy = m.oy + Math.round(Math.sin(timeSec * 0.55 + m.seed * 1.7 + f.seed));
    const x = sx + ox;
    const y = sy + oy;
    if (x < -12 || y < -12 || x > viewW + 12 || y > viewH + 12) continue;
    const up = flapUp(timeSec, f.seed + m.seed, f.form);
    const body = i % 2 === 0 ? paint.body : paint.soft;
    if (f.form === "flock") drawFlockMark(ctx, x, y, up, body);
    else if (f.form === "chevron") drawChevron(ctx, x, y, up, body, paint.tip, leadRight);
    else drawGlider(ctx, x, y, up, paint.body, paint.tip, leadRight);
  }
}

/** Far flock and solo silhouettes. Call after haze and before actors. */
export function drawAmbientFaunaFar(
  ctx: CanvasRenderingContext2D,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  timeSec: number,
): void {
  if (!shown || realm === "") return;
  const paint = paintFar(INK[realm]);
  for (let i = 0; i < FLYERS.length; i++) {
    const f = FLYERS[i]!;
    if (f.layer !== "far") continue;
    drawFlyer(ctx, f, originX, originY, viewW, viewH, timeSec, paint);
  }
}

/** Canopy gliders and high ash. Call after the depth flush so crowns stay in front of the far flock. */
export function drawAmbientFaunaAbove(
  ctx: CanvasRenderingContext2D,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  timeSec: number,
): void {
  if (!shown || realm === "") return;
  const ink = INK[realm];
  const ash = rgba(ink.ash, 0.4);
  const ashDim = rgba(ink.ash, 0.24);
  for (let i = 0; i < ASH.length; i++) {
    const a = ASH[i]!;
    const proj = project(a.x, a.y, originX, originY, viewW, viewH, ASH_P);
    const x = Math.round(proj.sx);
    const y = Math.round(proj.sy + Math.sin(timeSec * 0.9 + a.seed));
    if (x < -2 || y < -2 || x > viewW + 2 || y > viewH + 2) continue;
    ctx.fillStyle = a.dim ? ashDim : ash;
    ctx.fillRect(x, y, 1, 1);
  }
  const paint = paintAbove(ink);
  for (let i = 0; i < FLYERS.length; i++) {
    const f = FLYERS[i]!;
    if (f.layer !== "above") continue;
    drawFlyer(ctx, f, originX, originY, viewW, viewH, timeSec, paint);
  }
}
