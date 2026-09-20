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

type PromptCandidate = { prompt: NonNullable<PromptState>; dist: number };

/** Pick the nearest interactable when several overlap (folk on shop, etc.). */
export function computePrompt(
  map: WorldMap,
  player: { x: number; y: number },
  docks: { id: string; name: string; x: number; y: number }[],
  folk: { id: string; name: string; x: number; y: number; shopId?: string }[],
  shops: { id: string; name: string; x: number; y: number }[],
): PromptState {
  const px = player.x / TILE;
  const py = player.y / TILE;
  const candidates: PromptCandidate[] = [];

  const consider = (tx: number, ty: number, prompt: NonNullable<PromptState>) => {
    if (!nearTile(px, py, tx, ty, INTERACT_RADIUS)) return;
    const dist = Math.hypot(px - (tx + 0.5), py - (ty + 0.5));
    candidates.push({ prompt, dist });
  };

  if (map.kind === "overworld") {
    for (const g of map.gates) {
      consider(g.x, g.y, {
        kind: "gate",
        target: g.targetContinentId,
        name: getContinent(g.targetContinentId).name,
      });
    }
    for (const h of map.hollows) {
      consider(h.x, h.y, { kind: "hollow", index: h.index });
    }
    for (const dk of docks) {
      consider(dk.x, dk.y, { kind: "ship", dockId: dk.id, name: dk.name });
    }
    for (const f of folk) {
      consider(f.x, f.y, {
        kind: "folk",
        folkId: f.id,
        name: f.name,
        hasShop: Boolean(f.shopId),
      });
    }
    for (const s of shops) {
      // Skip shop marker if a folk with that shop already covers the tile.
      if (folk.some((f) => f.x === s.x && f.y === s.y && f.shopId === s.id)) continue;
      consider(s.x, s.y, { kind: "shop", shopId: s.id, name: s.name });
    }
  } else if (map.exit) {
    consider(map.exit.x, map.exit.y, { kind: "exit" });
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.dist - b.dist);
  return candidates[0]!.prompt;
}
