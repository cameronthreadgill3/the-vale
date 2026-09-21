/** Facing + walk-frame state for the player sprite. */
import {
  facingFromMove,
  preloadPlayerSprite,
  WALK_FPS,
  type Facing,
} from "@/game/playerSprites";
import type { ClassId } from "@/game/classes";

export type SpriteWalkState = {
  facing: Facing;
  walkFrame: number;
  onMove: (dx: number, dy: number, dt: number, moved: boolean) => void;
};

export function createSpriteWalkState(classId: ClassId): SpriteWalkState {
  let facing: Facing = "south";
  let walkFrame = 0;
  let walkAccum = 0;
  void preloadPlayerSprite(classId);
  return {
    get facing() {
      return facing;
    },
    get walkFrame() {
      return walkFrame;
    },
    onMove(dx: number, dy: number, dt: number, moved: boolean) {
      if (dx !== 0 || dy !== 0) {
        facing = facingFromMove(dx, dy, facing);
      }
      if (moved) {
        walkAccum += dt * WALK_FPS;
        while (walkAccum >= 1) {
          walkAccum -= 1;
          walkFrame = (walkFrame + 1) % 4;
        }
      } else {
        walkFrame = 0;
        walkAccum = 0;
      }
    },
  };
}
