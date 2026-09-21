/**
 * Soft warm spill from open plaza doors and gate arches onto the step outside.
 * The doorway sheet already shows the hearth. This pass only lays a quiet
 * radial pool, same amber as the lanterns, steadier than a flame.
 * Alphas stay low so wayfinding labels keep the read.
 * Canvas 2D gradients only — not CipSoft.
 */
import { TILE, type WorldMap } from "@/game/world";
import { buildingsOnContinent, type TownBuilding } from "@/game/world/town";

type Dir = { dx: number; dy: number };

/** Outward face of a shop door — the side that meets the plaza. */
function doorFacing(b: TownBuilding): Dir {
  const { x, y } = b.door;
  if (y <= b.y) return { dx: 0, dy: -1 };
  if (y >= b.y + b.h - 1) return { dx: 0, dy: 1 };
  if (x <= b.x) return { dx: -1, dy: 0 };
  return { dx: 1, dy: 0 };
}

/** Approach from the square, so the arch leaks toward the path a walker uses. */
function approachDir(map: WorldMap, tx: number, ty: number): Dir {
  const dx = map.spawn.x - tx;
  const dy = map.spawn.y - ty;
  if (dx === 0 && dy === 0) return { dx: 0, dy: 1 };
  if (Math.abs(dx) >= Math.abs(dy)) return { dx: Math.sign(dx), dy: 0 };
  return { dx: 0, dy: Math.sign(dy) };
}

/** Slow interior breath. Shares the lantern amber, not the flame strobe. */
function interiorBreath(timeSec: number, seed: number): number {
  return (
    0.9 +
    0.06 * Math.sin(timeSec * 1.35 + seed) +
    0.04 * Math.sin(timeSec * 0.55 + seed * 1.7)
  );
}

function fillWarm(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  core: number,
  mid: number,
): void {
  const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, radius);
  g.addColorStop(0, `rgba(255, 176, 80, ${core})`);
  g.addColorStop(0.5, `rgba(220, 120, 40, ${mid})`);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  const d = radius * 2;
  ctx.fillRect(cx - radius, cy - radius, d, d);
}

function inView(sx: number, sy: number, viewW: number, viewH: number): boolean {
  return sx >= -TILE * 2 && sy >= -TILE * 2 && sx <= viewW + TILE && sy <= viewH + TILE;
}

/** Pool centered on the ground outside the opening, not on the jamb. */
function spillOntoStep(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  face: Dir,
  breath: number,
  reach: number,
  radius: number,
  core: number,
  mid: number,
): void {
  const jx = sx + TILE / 2 + face.dx * (TILE * reach);
  const jy = sy + TILE / 2 + face.dy * (TILE * reach) + 2;
  fillWarm(ctx, jx, jy, radius, core * breath, mid * breath);
}

/**
 * Interior hearth on the opening, then a pool biased onto the adjacent ground.
 * Doors: the painted gap sits on the east of the leaf.
 * Gates: the hearth sits in the arch, and the pool runs toward spawn.
 */
export function drawDoorGateSpill(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  timeSec: number,
): void {
  if (map.kind !== "overworld") return;

  for (const b of buildingsOnContinent(map.continentId)) {
    const sx = Math.floor(b.door.x * TILE - originX);
    const sy = Math.floor(b.door.y * TILE - originY);
    if (!inView(sx, sy, viewW, viewH)) continue;
    const face = doorFacing(b);
    const breath = interiorBreath(timeSec, b.door.x * 0.37 + b.door.y * 0.21);
    fillWarm(ctx, sx + 20, sy + 15, 11, 0.13 * breath, 0.045 * breath);
    spillOntoStep(ctx, sx, sy, face, breath, 0.42, 16, 0.11, 0.04);
    spillOntoStep(ctx, sx, sy, face, breath, 1, 22, 0.15, 0.055);
  }

  for (const gate of map.gates) {
    const sx = Math.floor(gate.x * TILE - originX);
    const sy = Math.floor(gate.y * TILE - originY);
    if (!inView(sx, sy, viewW, viewH)) continue;
    const face = approachDir(map, gate.x, gate.y);
    const breath = interiorBreath(timeSec, gate.x * 0.29 + gate.y * 0.17);
    fillWarm(ctx, sx + TILE / 2, sy + 17, 12, 0.12 * breath, 0.04 * breath);
    spillOntoStep(ctx, sx, sy, face, breath, 0.4, 14, 0.1, 0.035);
    spillOntoStep(ctx, sx, sy, face, breath, 1.05, 24, 0.14, 0.05);
  }
}
