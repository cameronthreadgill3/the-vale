/**
 * Resting breath for the walker and nearby idle creatures.
 * One pixel, and only on the inhale crest, so the body stays planted
 * through the rest of the cycle. Contact shadows are not shifted.
 */

/** Radians per second. A full rest is about 3.4s. */
const BREATH_RATE = 1.85;
/** Sine crest. Below this the sprite stays on the ground. */
const BREATH_CREST = 0.86;

/**
 * Chase kinds run at about 48px/s and up. The idle mill stays under ~30,
 * so it reads as standing rather than a stride.
 */
export const IDLE_WALK_SPEED = 36;

/** Local tell. Creatures past this many tiles keep their existing stride. */
export const IDLE_BREATH_TILES = 8;

/** -1 on the inhale, otherwise 0. `phase` desyncs a pack. */
export function idleBreathLift(timeSec: number, phase = 0): number {
  const s = Math.sin(timeSec * BREATH_RATE + phase);
  return s > BREATH_CREST ? -1 : 0;
}
