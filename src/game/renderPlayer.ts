/** Draw the local player (sprite stand-in or accent orb fallback). */
import { PLAYER_RADIUS } from "@/game/canvasConstants";
import type { ValeCharacter } from "@/game/character";
import {
  drawPlayerSprite,
  getPlayerSprite,
  type Facing,
} from "@/game/playerSprites";
import { drawSoftShadow, GROUND_SHADOW_ALPHA } from "@/game/gfx/canvasUtil";

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  character: ValeCharacter,
  px: number,
  py: number,
  facing: Facing,
  walkFrame: number,
  playerFlash: number,
  accent: { accent: string; accentLite: string; accentDark: string },
): void {
  drawSoftShadow(ctx, px, py + 10, PLAYER_RADIUS * 1.05, PLAYER_RADIUS * 0.42, GROUND_SHADOW_ALPHA);

  const sheet = getPlayerSprite(character.classId);
  if (sheet) {
    drawPlayerSprite(ctx, sheet, px, py, facing, walkFrame, {
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
    ctx.fillStyle = "rgba(255,80,60," + Math.min(0.45, playerFlash * 2) + ")";
    ctx.beginPath();
    ctx.arc(px, py, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
}
