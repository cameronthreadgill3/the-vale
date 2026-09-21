/**
 * Lightweight atmosphere overlays — vignette, ashwood silver tint, hollow torch spots.
 * Keep labels readable (low alpha, drawn under wayfinding).
 */
import { TILE, type WorldMap } from "@/game/world";

/** Soft screen vignette; alpha kept modest so HUD / labels stay clear. */
export function drawVignette(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  viewH: number,
  strength = 0.28,
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
  ctx.globalAlpha = 0.07;
  for (let ty = startTY; ty <= endTY; ty++) {
    for (let tx = startTX; tx <= endTX; tx++) {
      if (map.tiles[ty]![tx] !== "stone") continue;
      const sx = Math.floor(tx * TILE - originX);
      const sy = Math.floor(ty * TILE - originY);
      const g = ctx.createRadialGradient(sx + 16, sy + 12, 4, sx + 16, sy + 12, 36);
      g.addColorStop(0, "#c8d8c8");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(sx - 8, sy - 8, TILE + 16, TILE + 16);
    }
  }
  ctx.restore();
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
  const spots: { x: number; y: number }[] = [
    { x: map.spawn.x * TILE, y: map.spawn.y * TILE },
  ];
  // sample a few hollow/exit tiles as sconces
  const startTX = Math.max(0, Math.floor(originX / TILE));
  const startTY = Math.max(0, Math.floor(originY / TILE));
  const endTX = Math.min(map.width - 1, Math.ceil((originX + viewW) / TILE));
  const endTY = Math.min(map.height - 1, Math.ceil((originY + viewH) / TILE));
  let found = 0;
  for (let ty = startTY; ty <= endTY && found < 6; ty++) {
    for (let tx = startTX; tx <= endTX && found < 6; tx++) {
      const k = map.tiles[ty]![tx];
      if (k === "hollow" || k === "exit" || (k === "path" && (tx + ty) % 11 === 0)) {
        spots.push({ x: (tx + 0.5) * TILE, y: (ty + 0.5) * TILE });
        found++;
      }
    }
  }
  spots.push({ x: player.x, y: player.y });
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < spots.length; i++) {
    const s = spots[i]!;
    const sx = Math.floor(s.x - originX);
    const sy = Math.floor(s.y - originY);
    const flicker = 0.85 + 0.15 * Math.sin(timeSec * 6 + i * 1.7);
    const r = (i === spots.length - 1 ? 70 : 48) * flicker;
    const g = ctx.createRadialGradient(sx, sy, 2, sx, sy, r);
    g.addColorStop(0, `rgba(255,180,80,${0.22 * flicker})`);
    g.addColorStop(0.4, `rgba(200,100,30,${0.08 * flicker})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
