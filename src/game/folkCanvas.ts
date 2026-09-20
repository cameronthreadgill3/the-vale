import { TILE, isSolid, type WorldMap } from "@/game/world";
import type { FolkDef, ShopDef, ShipDock } from "@/game/folk";

export function softClearTile(
  map: { width: number; height: number; tiles: string[][] },
  x: number,
  y: number,
): void {
  if (x <= 0 || y <= 0 || x >= map.width - 1 || y >= map.height - 1) return;
  const t = map.tiles[y]![x]!;
  if (t === "water" || t === "stone") {
    map.tiles[y]![x] = "path";
  }
}

/** Soft-clear a Chebyshev radius so spawn / docks are not boxed by stone. */
export function softClearRadius(
  map: { width: number; height: number; tiles: string[][] },
  x: number,
  y: number,
  radius = 1,
): void {
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      softClearTile(map, x + dx, y + dy);
    }
  }
}

export function softClearAll(
  map: { width: number; height: number; tiles: string[][] },
  folk: FolkDef[],
  shops: ShopDef[],
  docks: ShipDock[],
): void {
  for (const f of folk) softClearRadius(map, f.x, f.y, 1);
  for (const s of shops) softClearRadius(map, s.x, s.y, 1);
  for (const dk of docks) softClearRadius(map, dk.x, dk.y, 1);
}

/**
 * Prefer `preferred` if walkable after a soft clear; otherwise spiral out for
 * the nearest non-solid tile. Falls back to map.spawn.
 */
export function resolveWalkableSpawn(
  map: WorldMap,
  preferred: { x: number; y: number },
): { x: number; y: number } {
  softClearRadius(map, preferred.x, preferred.y, 1);

  const tryTile = (x: number, y: number): { x: number; y: number } | null => {
    if (x <= 0 || y <= 0 || x >= map.width - 1 || y >= map.height - 1) return null;
    softClearTile(map, x, y);
    const t = map.tiles[y]![x]!;
    // Avoid landing ON a gate/hollow/exit (walk-on auto-triggers).
    if (t === "gate" || t === "hollow" || t === "exit") return null;
    if (isSolid(t, map.kind)) return null;
    return { x, y };
  };

  const direct = tryTile(preferred.x, preferred.y);
  if (direct) return direct;

  for (let r = 1; r <= 8; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const hit = tryTile(preferred.x + dx, preferred.y + dy);
        if (hit) return hit;
      }
    }
  }

  softClearRadius(map, map.spawn.x, map.spawn.y, 2);
  return { x: map.spawn.x, y: map.spawn.y };
}

export function drawShipDocks(
  ctx: CanvasRenderingContext2D,
  docks: ShipDock[],
  originX: number,
  originY: number,
): void {
  for (const dk of docks) {
    const dsx = Math.floor(dk.x * TILE - originX);
    const dsy = Math.floor(dk.y * TILE - originY);
    ctx.fillStyle = "#4a3d28";
    ctx.fillRect(dsx + 4, dsy + 12, TILE - 8, 8);
    ctx.fillStyle = "#7ab8c9";
    ctx.beginPath();
    ctx.moveTo(dsx + 6, dsy + 10);
    ctx.lineTo(dsx + TILE - 6, dsy + 6);
    ctx.lineTo(dsx + TILE - 8, dsy + 18);
    ctx.lineTo(dsx + 8, dsy + 18);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#e8e6d9";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

export function drawShopMarkers(
  ctx: CanvasRenderingContext2D,
  shops: ShopDef[],
  folk: FolkDef[],
  originX: number,
  originY: number,
): void {
  for (const s of shops) {
    if (folk.some((f) => f.x === s.x && f.y === s.y)) continue;
    const ssx = Math.floor(s.x * TILE - originX);
    const ssy = Math.floor(s.y * TILE - originY);
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(ssx + 6, ssy + 4, TILE - 12, 6);
    ctx.fillStyle = "#3a2f1f";
    ctx.fillRect(ssx + 10, ssy + 10, TILE - 20, TILE - 16);
  }
}

function drawFloatingLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  color = "#e8e6d9",
): void {
  ctx.font = "600 11px Figtree, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  const padX = 5;
  const padY = 3;
  const w = ctx.measureText(label).width;
  const bx = x - w / 2 - padX;
  const by = y - 14 - padY;
  ctx.fillStyle = "rgba(12,13,11,0.75)";
  ctx.fillRect(bx, by, w + padX * 2, 14 + padY);
  ctx.strokeStyle = "rgba(201,162,39,0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(bx, by, w + padX * 2, 14 + padY);
  ctx.fillStyle = color;
  ctx.fillText(label, x, y - 4);
}

export function drawNamedFolk(
  ctx: CanvasRenderingContext2D,
  folk: FolkDef[],
  originX: number,
  originY: number,
  player?: { x: number; y: number },
): void {
  const px = player ? player.x / TILE : 0;
  const py = player ? player.y / TILE : 0;
  for (const f of folk) {
    const fsx = Math.floor((f.x + 0.5) * TILE - originX);
    const fsy = Math.floor((f.y + 0.5) * TILE - originY);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(fsx, fsy + 6, 9, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.arc(fsx, fsy - 1, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#e8e6d9";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = "#0c0d0b";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#e8e6d9";
    ctx.fillRect(fsx - 2, fsy - 12, 4, 3);
    if (player && Math.hypot(px - (f.x + 0.5), py - (f.y + 0.5)) <= 5.5) {
      drawFloatingLabel(ctx, fsx, fsy - 12, f.name, "#c9a227");
    }
  }
}

export { drawFloatingLabel };
