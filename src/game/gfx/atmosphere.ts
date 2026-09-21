/**
 * Lightweight atmosphere overlays — vignette, ashwood silver tint, hollow torch spots.
 * Pass 3: multi-frequency torch flicker; sconces aligned with cave-wall torch tiles.
 * Keep labels readable (low alpha, drawn under wayfinding).
 */
import { TILE, type WorldMap } from "@/game/world";
import { tileVariantAt } from "@/game/gfx/tiles";

function torchFlicker(timeSec: number, seed: number): number {
  return (
    0.76 +
    0.12 * Math.sin(timeSec * 7.1 + seed * 1.7) +
    0.08 * Math.sin(timeSec * 13.4 + seed * 2.3) +
    0.05 * Math.sin(timeSec * 23.0 + seed * 0.9)
  );
}

/** Soft screen vignette; alpha kept modest so HUD / labels stay clear. */
export function drawVignette(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  viewH: number,
  strength = 0.26,
): void {
  const cx = viewW / 2;
  const cy = viewH / 2;
  const r = Math.hypot(cx, cy) * 0.92;
  const g = ctx.createRadialGradient(cx, cy, r * 0.35, cx, cy, r);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.65, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(8,10,6,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, viewW, viewH);
}

/** Cool silver-leaf wash over ashwood (stone) clusters — overworld only. */
export function drawAshwoodTint(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
): void {
  if (map.kind !== "overworld") return;
  const startTX = Math.max(0, Math.floor(originX / TILE) - 1);
  const startTY = Math.max(0, Math.floor(originY / TILE) - 1);
  const endTX = Math.min(map.width - 1, Math.ceil((originX + viewW) / TILE) + 1);
  const endTY = Math.min(map.height - 1, Math.ceil((originY + viewH) / TILE) + 1);
  ctx.save();
  ctx.globalAlpha = 0.09;
  for (let ty = startTY; ty <= endTY; ty++) {
    for (let tx = startTX; tx <= endTX; tx++) {
      if (map.tiles[ty]![tx] !== "stone") continue;
      const sx = Math.floor(tx * TILE - originX);
      const sy = Math.floor(ty * TILE - originY);
      const g = ctx.createRadialGradient(sx + 16, sy + 8, 4, sx + 16, sy + 8, 42);
      g.addColorStop(0, "#d0e0d0");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(sx - 12, sy - 16, TILE + 24, TILE + 24);
    }
  }
  ctx.restore();
}

function walkable(map: WorldMap, tx: number, ty: number): boolean {
  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return false;
  const k = map.tiles[ty]![tx];
  return k !== "stone" && k !== "water";
}

/** Warm torch spots in hollows (plus player light already in darkness pass). */
export function drawHollowTorchSpots(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  player: { x: number; y: number },
  timeSec: number,
): void {
  if (map.kind !== "hollow" && map.darkness <= 0) return;
  const spots: { x: number; y: number; wall: boolean }[] = [
    { x: map.spawn.x * TILE, y: map.spawn.y * TILE, wall: false },
  ];
  const startTX = Math.max(0, Math.floor(originX / TILE));
  const startTY = Math.max(0, Math.floor(originY / TILE));
  const endTX = Math.min(map.width - 1, Math.ceil((originX + viewW) / TILE));
  const endTY = Math.min(map.height - 1, Math.ceil((originY + viewH) / TILE));
  let found = 0;
  for (let ty = startTY; ty <= endTY && found < 10; ty++) {
    for (let tx = startTX; tx <= endTX && found < 10; tx++) {
      const k = map.tiles[ty]![tx];
      const wallTorch =
        k === "stone" &&
        tileVariantAt(tx, ty) % 3 === 0 &&
        (walkable(map, tx + 1, ty) ||
          walkable(map, tx - 1, ty) ||
          walkable(map, tx, ty + 1) ||
          walkable(map, tx, ty - 1));
      if (k === "hollow" || k === "exit" || (k === "path" && (tx + ty) % 11 === 0) || wallTorch) {
        spots.push({
          x: (tx + 0.5) * TILE,
          y: (ty + 0.4) * TILE,
          wall: Boolean(wallTorch),
        });
        found++;
      }
    }
  }
  spots.push({ x: player.x, y: player.y, wall: false });
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < spots.length; i++) {
    const s = spots[i]!;
    const sx = Math.floor(s.x - originX);
    const sy = Math.floor(s.y - originY);
    const flicker = torchFlicker(timeSec, i);
    const isPlayer = i === spots.length - 1;
    const r = (isPlayer ? 74 : s.wall ? 56 : 48) * flicker;
    const g = ctx.createRadialGradient(sx, sy, 2, sx, sy, r);
    g.addColorStop(0, `rgba(255,190,90,${0.26 * flicker})`);
    g.addColorStop(0.35, `rgba(220,110,32,${0.1 * flicker})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
