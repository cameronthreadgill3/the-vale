/** Soft ground-contact blob for the player and creatures. Procedural canvas, not a 3D light. */

import { ctx2d, makeCanvas } from "@/game/gfx/canvasUtil";

const BLOB = 96;

let _blob: HTMLCanvasElement | OffscreenCanvas | null = null;

function contactBlob(): HTMLCanvasElement | OffscreenCanvas {
  if (_blob) return _blob;
  const canvas = makeCanvas(BLOB, BLOB);
  const g = ctx2d(canvas);
  g.imageSmoothingEnabled = true;
  g.clearRect(0, 0, BLOB, BLOB);
  const cx = BLOB / 2;
  const cy = BLOB / 2;
  const grad = g.createRadialGradient(cx, cy, BLOB * 0.02, cx, cy, BLOB / 2);
  grad.addColorStop(0, "rgba(10, 12, 8, 0.96)");
  grad.addColorStop(0.2, "rgba(10, 12, 8, 0.7)");
  grad.addColorStop(0.48, "rgba(10, 12, 8, 0.28)");
  grad.addColorStop(0.78, "rgba(10, 12, 8, 0.08)");
  grad.addColorStop(1, "rgba(10, 12, 8, 0)");
  g.fillStyle = grad;
  g.beginPath();
  g.arc(cx, cy, BLOB / 2, 0, Math.PI * 2);
  g.fill();
  _blob = canvas;
  return canvas;
}

/**
 * Oval ground blob. Stretching the cached radial into rx/ry keeps it an ellipse.
 * Smoothing stays on for this blit only so the falloff stays soft under pixel sprites.
 */
export function drawContactShadow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  alpha = 0.55,
): void {
  if (rx < 1 || ry < 1 || alpha <= 0.01) return;
  const blob = contactBlob();
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.globalAlpha = alpha;
  ctx.drawImage(blob, cx - rx, cy - ry, rx * 2, ry * 2);
  ctx.restore();
}
