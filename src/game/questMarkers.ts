/** Ashwood-edge cairns / hunt markers for Lines in the Grass. */
import { TILE } from "@/game/world";

export type QuestCairn = {
  id: string;
  name: string;
  /** Tile coords on Thornreach overworld (west / north of Thornhearth). */
  x: number;
  y: number;
};

/** Two stone piles west + north of plaza spawn (~24,18). */
export const ASHWOOD_EDGE_CAIRNS: QuestCairn[] = [
  { id: "cairn-west", name: "Ashwood cairn (west)", x: 14, y: 17 },
  { id: "cairn-north", name: "Ashwood cairn (north)", x: 22, y: 10 },
];

export function cairnsForContinent(continentId: string): QuestCairn[] {
  return continentId === "thornreach" ? ASHWOOD_EDGE_CAIRNS : [];
}

export function nearestUnidentifiedCairn(
  player: { x: number; y: number },
  cairns: QuestCairn[],
  identified: string[],
): QuestCairn | null {
  let best: QuestCairn | null = null;
  let bestD = Infinity;
  for (const c of cairns) {
    if (identified.includes(c.id)) continue;
    const d = Math.hypot((c.x + 0.5) * TILE - player.x, (c.y + 0.5) * TILE - player.y);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

export function drawQuestCairns(
  ctx: CanvasRenderingContext2D,
  cairns: QuestCairn[],
  identified: Set<string>,
  originX: number,
  originY: number,
  player?: { x: number; y: number },
): void {
  for (const c of cairns) {
    const sx = Math.floor((c.x + 0.5) * TILE - originX);
    const sy = Math.floor((c.y + 0.5) * TILE - originY);
    const done = identified.has(c.id);
    ctx.fillStyle = done ? "#6a7260" : "#8a8680";
    ctx.beginPath();
    ctx.ellipse(sx, sy + 4, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = done ? "#4a5240" : "#5a5650";
    ctx.beginPath();
    ctx.ellipse(sx - 5, sy + 2, 6, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(sx + 5, sy + 1, 5, 4, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = done ? "#9aa288" : "#c9c4b8";
    ctx.beginPath();
    ctx.ellipse(sx - 1, sy - 3, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!done) {
      ctx.strokeStyle = "rgba(240,208,96,0.85)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sx - 12, sy - 12, 24, 22);
    }
    if (player) {
      const d = Math.hypot(player.x / TILE - (c.x + 0.5), player.y / TILE - (c.y + 0.5));
      if (d <= 8) {
        ctx.font = '700 10px "IBM Plex Mono", ui-monospace, monospace';
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = done ? "#9aa288" : "#f0d060";
        ctx.fillText(done ? "Cairn (read)" : "Cairn · Identify", sx, sy - 14);
      }
    }
  }
}
