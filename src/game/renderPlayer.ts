/** Draw the local player (sprite stand-in or accent orb fallback). */
import { PLAYER_RADIUS } from "@/game/canvasConstants";
import type { ValeCharacter } from "@/game/character";
import {
  drawPlayerSprite,
  getPlayerSprite,
  PLAYER_SPRITE_SIZE,
  type Facing,
} from "@/game/playerSprites";
import { drawContactShadow } from "@/game/gfx/contactShadow";
import { drawOrbHitFlash } from "@/game/gfx/hitFlash";

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  character: ValeCharacter,
  px: number,
  py: number,
  facing: Facing,
  walkFrame: number,
  playerFlash: number,
  accent: { accent: string; accentLite: string; accentDark: string },
  /** Idle breath. The contact blob stays put so the body lifts off the ground. */
  lift = 0,
  /** Screen-space shift so the blob trails the boots (ground sticks, body leads). */
  shadowLagX = 0,
  shadowLagY = 0,
): void {
  const footY = py + PLAYER_SPRITE_SIZE * 0.35;
  drawContactShadow(
    ctx,
    px + shadowLagX,
    footY + shadowLagY,
    PLAYER_RADIUS * 1.55,
    PLAYER_RADIUS * 0.52,
    0.58,
  );

  const sheet = getPlayerSprite(character.classId);
  if (sheet) {
    drawPlayerSprite(ctx, sheet, px, py + lift, facing, walkFrame, {
      flash: playerFlash,
      glowColor: accent.accent,
    });
    return;
  }

  const grad = ctx.createRadialGradient(px - 3, py - 4, 2, px, py, PLAYER_RADIUS + 2);
  grad.addColorStop(0, accent.accentLite);
  grad.addColorStop(0.6, accent.accent);
  grad.addColorStop(1, accent.accentDark);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(px, py, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#0c0d0b";
  ctx.lineWidth = 2;
  ctx.stroke();
  if (playerFlash > 0) {
    drawOrbHitFlash(ctx, px, py, PLAYER_RADIUS, playerFlash);
  }
}
