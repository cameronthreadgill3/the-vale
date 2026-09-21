/** Wayfinding canvas overlays: pointer, compass, radar. */
import { TILE, type WorldMap } from "@/game/world";
import type { FolkDef, ShipDock } from "@/game/folk";
import type { Enemy } from "@/game/enemies";
import {
  WAYFIND_RADAR_RANGE,
  type RadarDot,
  type WayfindObjective,
} from "@/game/wayfindingObjectives";

/** Edge arrow / on-screen marker toward the quest objective. */
export function drawObjectivePointer(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  viewH: number,
  playerSx: number,
  playerSy: number,
  targetSx: number,
  targetSy: number,
): void {
  const dx = targetSx - playerSx;
  const dy = targetSy - playerSy;
  const len = Math.hypot(dx, dy);
  if (len < 10) return;
  const ux = dx / len;
  const uy = dy / len;

  const onScreen =
    targetSx > 28 &&
    targetSx < viewW - 28 &&
    targetSy > 40 &&
    targetSy < viewH - 28;

  if (onScreen) {
    const ax = targetSx;
    const ay = targetSy - 26;
    ctx.save();
    ctx.translate(ax, ay);
    ctx.fillStyle = "#f0d060";
    ctx.strokeStyle = "#0c0d0b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(9, 7);
    ctx.lineTo(0, 2);
    ctx.lineTo(-9, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  const margin = 30;
  const hit = clampRayToRect(
    playerSx,
    playerSy,
    playerSx + ux * 8000,
    playerSy + uy * 8000,
    margin,
    margin + 24,
    viewW - margin,
    viewH - margin,
  );
  if (!hit) return;
  const ang = Math.atan2(uy, ux);
  ctx.save();
  ctx.translate(hit.x, hit.y);
  ctx.rotate(ang);
  ctx.fillStyle = "#f0d060";
  ctx.strokeStyle = "#0c0d0b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(-11, 11);
  ctx.lineTo(-4, 0);
  ctx.lineTo(-11, -11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function clampRayToRect(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
): { x: number; y: number } | null {
  const dx = x1 - x0;
  const dy = y1 - y0;
  let tMin = 0;
  let tMax = 1;
  const planes: [number, number][] = [
    [-dx, x0 - left],
    [dx, right - x0],
    [-dy, y0 - top],
    [dy, bottom - y0],
  ];
  for (const [p, q] of planes) {
    if (Math.abs(p) < 1e-8) {
      if (q < 0) return null;
      continue;
    }
    const t = q / p;
    if (p < 0) tMin = Math.max(tMin, t);
    else tMax = Math.min(tMax, t);
    if (tMin > tMax) return null;
  }
  return { x: x0 + dx * tMax, y: y0 + dy * tMax };
}

/** Compact N/E/S/W compass (top-center). */
export function drawCompass(
  ctx: CanvasRenderingContext2D,
  viewW: number,
): void {
  const cx = viewW / 2;
  const cy = 34;
  const r = 17;
  ctx.save();
  ctx.fillStyle = "rgba(12,13,11,0.78)";
  ctx.strokeStyle = "rgba(240,208,96,0.65)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = "700 10px Figtree, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#f0d060";
  ctx.fillText("N", cx, cy - r + 1);
  ctx.fillStyle = "#c8c4b0";
  ctx.fillText("S", cx, cy + r - 1);
  ctx.fillText("W", cx - r + 1, cy);
  ctx.fillText("E", cx + r - 1, cy);
  ctx.fillStyle = "#f0d060";
  ctx.beginPath();
  ctx.moveTo(cx, cy - r + 6);
  ctx.lineTo(cx + 3.5, cy + 1);
  ctx.lineTo(cx, cy - 1);
  ctx.lineTo(cx - 3.5, cy + 1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Tiny radar under the compass. */
export function drawRadar(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  player: { x: number; y: number },
  dots: RadarDot[],
): void {
  const cx = viewW / 2;
  const cy = 76;
  const r = 21;
  ctx.save();
  ctx.fillStyle = "rgba(12,13,11,0.72)";
  ctx.strokeStyle = "rgba(122,184,201,0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#e8e6d9";
  ctx.beginPath();
  ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
  ctx.fill();
  const scale = (r - 3) / (WAYFIND_RADAR_RANGE * TILE);
  for (const d of dots) {
    const ox = (d.x - player.x) * scale;
    const oy = (d.y - player.y) * scale;
    if (Math.hypot(ox, oy) > r - 2) continue;
    ctx.fillStyle = d.color;
    ctx.beginPath();
    ctx.arc(cx + ox, cy + oy, d.quest ? 3.3 : 2.1, 0, Math.PI * 2);
    ctx.fill();
    if (d.quest) {
      ctx.strokeStyle = "#0c0d0b";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function collectRadarDots(
  player: { x: number; y: number },
  enemies: Enemy[],
  folk: FolkDef[],
  docks: ShipDock[],
  map: WorldMap,
  objective: WayfindObjective | null,
): RadarDot[] {
  const dots: RadarDot[] = [];
  const maxR = WAYFIND_RADAR_RANGE * TILE;
  const push = (x: number, y: number, color: string, quest = false) => {
    if (Math.hypot(x - player.x, y - player.y) > maxR) return;
    dots.push({ x, y, color, quest });
  };
  for (const f of folk) {
    push((f.x + 0.5) * TILE, (f.y + 0.5) * TILE, "#c9a227");
  };
  for (const dk of docks) {
    push((dk.x + 0.5) * TILE, (dk.y + 0.5) * TILE, "#7ab8c9");
  }
  if (map.kind === "overworld") {
    for (const g of map.gates) {
      push((g.x + 0.5) * TILE, (g.y + 0.5) * TILE, "#e8e6d9");
    }
    for (const h of map.hollows) {
      push((h.x + 0.5) * TILE, (h.y + 0.5) * TILE, "#b89ad4");
    }
  } else if (map.exit) {
    push((map.exit.x + 0.5) * TILE, (map.exit.y + 0.5) * TILE, "#c9a227");
  }
  for (const e of enemies) {
    if (e.hp <= 0) continue;
    const hunt =
      e.kind.id === "needle-rat" || e.kind.id === "bark-hound";
    push(e.x, e.y, hunt ? "#e07050" : "#8a9080");
  }
  if (objective) {
    push(objective.x, objective.y, "#f0d060", true);
  }
  return dots;
}

