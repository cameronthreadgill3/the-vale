/**
 * Soft camera for a fall and the return to the plaza.
 * Death eases the view onto the body and lets it rest. Respawn starts a
 * short step north of the spawn and the walk follow eases home.
 * One direction, no oscillation, so it does not read as shake.
 * Separate from combat hit-stop: that dip stays on the hit clock.
 */

/** Follow rate (1/s) while the view comes to rest on the body. */
export const DEATH_HOLD_EASE = 8.5;
/** How fast leftover walk lean fades once you have fallen (1/s). */
export const DEATH_LOOK_BLEED = 8;
/**
 * How far north of the plaza rest the respawn view starts, in pixels.
 * Kept under the walk camera's lag cap so the ease is not clamped into a pop.
 */
export const RESPAWN_SETTLE_PX = 24;

type Mode = "none" | "hold" | "arrive";

let mode: Mode = "none";

/** Arm the hold on the death tile. A second call does not stack. */
export function beginDeathHold(): void {
  mode = "hold";
}

export function deathHoldActive(): boolean {
  return mode === "hold";
}

/**
 * First camera sample after a finished fall.
 * One shot: the stored camera then eases home through the normal follow.
 * Returns null unless a death handoff is waiting.
 */
export function consumeRespawnSeed(): { x: number; y: number } | null {
  if (mode !== "arrive") return null;
  mode = "none";
  return { x: 0, y: -RESPAWN_SETTLE_PX };
}

/**
 * New loop. Drop a hold that did not finish.
 * Keep an arrival the first frame has not sampled yet.
 */
export function noteDeathCameraLoopStart(): void {
  if (mode === "hold") mode = "none";
}

/**
 * Loop teardown.
 * A finished death hands the next shell an arrival.
 * An aborted kick clears it.
 * Strict-mode remount of the new shell must not drop an unsampled arrival.
 */
export function endDeathCameraLoop(died: boolean, aborted: boolean): void {
  if (aborted) {
    mode = "none";
    return;
  }
  if (died && mode === "hold") {
    mode = "arrive";
    return;
  }
  if (mode !== "arrive") mode = "none";
}
