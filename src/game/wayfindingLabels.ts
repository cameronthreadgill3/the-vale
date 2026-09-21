/** Wayfinding landmark labels + starter tip. */
import { TILE, type WorldMap } from "@/game/world";
import { getContinent } from "@/game/continents";
import type { ShipDock } from "@/game/folk";
import { drawFloatingLabel } from "@/game/folkCanvas";
import { WAYFIND_LABEL_RANGE } from "@/game/wayfindingObjectives";

/** High-contrast landmark labels within ~8 tiles. */
export function drawWorldWayfindLabels(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  docks: ShipDock[],
  player: { x: number; y: number },
  originX: number,
  originY: number,
): void {
  const ptx = player.x / TILE;
  const pty = player.y / TILE;
  const range = WAYFIND_LABEL_RANGE;

  if (map.kind === "overworld") {
    for (const g of map.gates) {
      if (Math.hypot(ptx - (g.x + 0.5), pty - (g.y + 0.5)) > range) continue;
      const gx = Math.floor((g.x + 0.5) * TILE - originX);
      const gy = Math.floor((g.y + 0.5) * TILE - originY);
      const name = getContinent(g.targetContinentId).name;
      drawFloatingLabel(ctx, gx, gy - 14, "Gate → " + name, "#f0d060");
    }
    for (const h of map.hollows) {
      if (Math.hypot(ptx - (h.x + 0.5), pty - (h.y + 0.5)) > range) continue;
      const hx = Math.floor((h.x + 0.5) * TILE - originX);
      const hy = Math.floor((h.y + 0.5) * TILE - originY);
      drawFloatingLabel(ctx, hx, hy - 14, "Hollow entrance", "#d4b8f0");
    }
    const sx = map.spawn.x;
    const sy = map.spawn.y;
    if (Math.hypot(ptx - (sx + 0.5), pty - (sy + 0.5)) <= range) {
      const fx = Math.floor((sx + 0.5) * TILE - originX);
      const fy = Math.floor((sy + 0.5) * TILE - originY);
      drawFloatingLabel(ctx, fx, fy - 18, "Fountain · Safe", "#7ab8c9");
    }
    for (const dk of docks) {
      if (Math.hypot(ptx - (dk.x + 0.5), pty - (dk.y + 0.5)) > range) continue;
      const dx = Math.floor((dk.x + 0.5) * TILE - originX);
      const dy = Math.floor((dk.y + 0.5) * TILE - originY);
      drawFloatingLabel(ctx, dx, dy - 14, "Ship dock · " + dk.name, "#7ab8c9");
    }
  } else {
    for (let ty = 0; ty < map.height; ty++) {
      for (let tx = 0; tx < map.width; tx++) {
        if (map.tiles[ty]![tx] !== "exit") continue;
        if (Math.hypot(ptx - (tx + 0.5), pty - (ty + 0.5)) > range) continue;
        const ex = Math.floor((tx + 0.5) * TILE - originX);
        const ey = Math.floor((ty + 0.5) * TILE - originY);
        drawFloatingLabel(ctx, ex, ey - 14, "Hollow exit", "#f0d060");
      }
    }
  }
}


export const STARTER_TIP =
  "Talk to Rook (watch) · Shops & depot on the square · Bank with Cress · Fountain heals";

export const STARTER_TIP_MS = 60_000;
