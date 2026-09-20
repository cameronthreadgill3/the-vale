/** Movement and interaction-prompt helpers for the game loop. */
import { getContinent } from "@/game/continents";
import { TILE, isSolid, nearTile, type WorldMap } from "@/game/world";
import { PLAYER_RADIUS, INTERACT_RADIUS, type PromptState } from "@/game/canvasConstants";

export function tryMovePlayer(
  map: WorldMap,
  player: { x: number; y: number },
  nx: number,
  ny: number,
): boolean {
  const r = PLAYER_RADIUS;
  const samples = [
    [nx - r, ny - r],
    [nx + r, ny - r],
    [nx - r, ny + r],
    [nx + r, ny + r],
  ] as const;
  for (const [px, py] of samples) {
    const tx = Math.floor(px / TILE);
    const ty = Math.floor(py / TILE);
    if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return false;
    if (isSolid(map.tiles[ty]![tx]!, map.kind)) return false;
  }
  player.x = nx;
  player.y = ny;
  return true;
}

export function computePrompt(
  map: WorldMap,
  player: { x: number; y: number },
  docks: { id: string; name: string; x: number; y: number }[],
  folk: { id: string; name: string; x: number; y: number; shopId?: string }[],
  shops: { id: string; name: string; x: number; y: number }[],
): PromptState {
  const px = player.x / TILE;
  const py = player.y / TILE;
  let next: PromptState = null;
  if (map.kind === "overworld") {
    for (const g of map.gates) {
      if (nearTile(px, py, g.x, g.y, INTERACT_RADIUS)) {
        next = {
          kind: "gate",
          target: g.targetContinentId,
          name: getContinent(g.targetContinentId).name,
        };
        break;
      }
    }
    if (!next) {
      for (const h of map.hollows) {
        if (nearTile(px, py, h.x, h.y, INTERACT_RADIUS)) {
          next = { kind: "hollow", index: h.index };
          break;
        }
      }
    }
    if (!next) {
      for (const dk of docks) {
        if (nearTile(px, py, dk.x, dk.y, INTERACT_RADIUS)) {
          next = { kind: "ship", dockId: dk.id, name: dk.name };
          break;
        }
      }
    }
    if (!next) {
      for (const f of folk) {
        if (nearTile(px, py, f.x, f.y, INTERACT_RADIUS)) {
          next = {
            kind: "folk",
            folkId: f.id,
            name: f.name,
            hasShop: Boolean(f.shopId),
          };
          break;
        }
      }
    }
    if (!next) {
      for (const s of shops) {
        if (nearTile(px, py, s.x, s.y, INTERACT_RADIUS)) {
          next = { kind: "shop", shopId: s.id, name: s.name };
          break;
        }
      }
    }
  } else if (map.exit && nearTile(px, py, map.exit.x, map.exit.y, INTERACT_RADIUS)) {
    next = { kind: "exit" };
  }
  return next;
}
