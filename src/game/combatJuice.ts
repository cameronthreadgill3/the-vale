/**
 * Soft combat juice for a connected hit.
 * A short timescale dip gives the swing weight. A few pixels of camera
 * lean then ease home — one direction, no oscillation, so it does not
 * read as shake. Flash, floats, and the vignette stay on this same clock;
 * the dip is too brief to restyle them.
 */

import {
  HIT_SETTLE_PX,
  HIT_SETTLE_RATE,
  HIT_STOP_SCALE,
  HIT_STOP_SEC,
} from "@/game/combat";

let _hitStopLeft = 0;
let _settleX = 0;
let _settleY = 0;

/** Drop a leftover dip or lean when a map loads or a camera snap fires. */
export function resetCombatJuice(): void {
  _hitStopLeft = 0;
  _settleX = 0;
  _settleY = 0;
}

/**
 * Arm the dip and lean along `dir` (striker toward the other body).
 * A fresh hit replaces the lean so two lands in one frame cannot add.
 */
export function noteConnectedHit(dirX: number, dirY: number): void {
  _hitStopLeft = HIT_STOP_SEC;
  const dist = Math.hypot(dirX, dirY);
  if (dist < 1) {
    _settleX = 0;
    _settleY = 0;
    return;
  }
  _settleX = (dirX / dist) * HIT_SETTLE_PX;
  _settleY = (dirY / dist) * HIT_SETTLE_PX;
}

/**
 * Scale this frame's clock. Call once per tick with unscaled dt.
 * The hit frame stays full speed; the dip lands on the frames after.
 */
export function hitStopScale(realDt: number): number {
  if (_hitStopLeft <= 0 || realDt <= 0) return 1;
  const dipped = Math.min(_hitStopLeft, realDt);
  _hitStopLeft = Math.max(0, _hitStopLeft - realDt);
  return (dipped * HIT_STOP_SCALE + (realDt - dipped)) / realDt;
}

/**
 * Lean to add after the follow filter, then ease it home.
 * Returns this frame's offset before decaying, so the impact frame
 * shows the full lean. A dipped dt holds it; real time settles it.
 */
export function sampleHitSettle(dt: number): { x: number; y: number } {
  const x = _settleX;
  const y = _settleY;
  if (x === 0 && y === 0) return { x: 0, y: 0 };
  const keep = Math.exp(-HIT_SETTLE_RATE * Math.max(0, dt));
  _settleX *= keep;
  _settleY *= keep;
  if (Math.hypot(_settleX, _settleY) < 0.2) {
    _settleX = 0;
    _settleY = 0;
  }
  return { x, y };
}
