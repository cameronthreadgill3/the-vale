/**
 * Screen-edge vignette and a gentle combat focus.
 * Mild always-on rim; when a foe is close or has aggro, the clear well
 * pulls in a little and the rim deepens. Presentation only — no AI changes.
 * Original Vale pixels. Not a hard tunnel.
 */

/** Living foe fields the overlay reads. AI itself stays in enemies.ts. */
export type VignetteFoe = {
  ai: string;
  hp: number;
  x: number;
  y: number;
  kind: { aggroRange: number };
};

export type ScreenVignetteOpts = {
  dt: number;
  viewW: number;
  viewH: number;
  /** Walker in view pixels. The well leans this way only while focus is up. */
  focusX: number;
  focusY: number;
  playerX: number;
  playerY: number;
  tile: number;
  foes: readonly VignetteFoe[];
};

/** Idle rim matches the old atmosphere vignette so the plaza read stays put. */
const IDLE_INNER = 0.42;
const IDLE_KNEE = 0.72;
const IDLE_EDGE = 0.24;
/** Combat tightens the well and deepens the rim. Still a soft edge, not a mask. */
const COMBAT_INNER = 0.28;
const COMBAT_KNEE = 0.5;
const COMBAT_EDGE = 0.4;
/** Faint mid-ring so the non-focus area sits a little lower during a fight. */
const COMBAT_KNEE_ALPHA = 0.07;
/** How far the gradient center leans toward the walker at full focus. */
const FOCUS_PULL = 0.38;
/** Approach band past aggro, in multiples of that foe's aggro range. */
const NEAR_REACH = 1.45;
/** Cap for "nearby, not yet in the fight". Engaged foes jump the target to 1. */
const NEAR_WEIGHT = 0.42;

let smoothed = 0;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * 0 on an empty field, a partial value when something is close,
 * 1 when any living foe is chasing or biting.
 */
export function combatFocusTarget(
  foes: readonly VignetteFoe[],
  playerX: number,
  playerY: number,
  tile: number,
): number {
  const scale = tile > 0 ? tile : 32;
  let near = 0;
  let engaged = false;
  for (const e of foes) {
    if (e.ai === "dead" || e.hp <= 0) continue;
    if (e.ai === "chase" || e.ai === "attack") engaged = true;
    const aggro = Math.max(0.5, e.kind.aggroRange);
    const outer = aggro * NEAR_REACH;
    const dist = Math.hypot(e.x - playerX, e.y - playerY) / scale;
    if (dist >= outer) continue;
    const u = dist <= aggro ? 1 : (outer - dist) / (outer - aggro);
    if (u > near) near = u;
  }
  if (engaged) return 1;
  return near * NEAR_WEIGHT;
}

function smoothFocus(target: number, dt: number): number {
  const step = Math.max(0, Math.min(0.05, dt));
  const rate = target > smoothed ? 3.4 : 1.8;
  smoothed += (target - smoothed) * (1 - Math.exp(-rate * step));
  if (Math.abs(target - smoothed) < 0.004) smoothed = target;
  return smoothed;
}

function ink(alpha: number): string {
  return `rgba(10,14,8,${alpha.toFixed(3)})`;
}

/** Soft edge darken. Combat focus eases the same gradient tighter. */
export function drawScreenVignette(
  ctx: CanvasRenderingContext2D,
  opts: ScreenVignetteOpts,
): void {
  const viewW = opts.viewW;
  const viewH = opts.viewH;
  const focus = smoothFocus(
    combatFocusTarget(opts.foes, opts.playerX, opts.playerY, opts.tile),
    opts.dt,
  );
  if (viewW < 8 || viewH < 8) return;

  const pull = focus * FOCUS_PULL;
  const cx = viewW / 2 + (opts.focusX - viewW / 2) * pull;
  const cy = viewH / 2 + (opts.focusY - viewH / 2) * pull;
  const r = Math.hypot(viewW / 2, viewH / 2) * 0.94;
  const inner = lerp(IDLE_INNER, COMBAT_INNER, focus);
  const knee = lerp(IDLE_KNEE, COMBAT_KNEE, focus);
  const edge = lerp(IDLE_EDGE, COMBAT_EDGE, focus);
  const kneeAlpha = COMBAT_KNEE_ALPHA * focus;

  const g = ctx.createRadialGradient(cx, cy, r * inner, cx, cy, r);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(knee, kneeAlpha <= 0 ? "rgba(0,0,0,0)" : ink(kneeAlpha));
  g.addColorStop(1, ink(edge));

  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, viewW, viewH);
  ctx.restore();
}
