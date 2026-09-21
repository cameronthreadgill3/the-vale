/** Ashwood Watch trail cairns on Thornreach. */
import type { ContinentId } from "@/game/continents";
import { drawWatchCairnSprite } from "@/game/gfx/cairn";

export interface CairnDef {
  id: string;
  name: string;
  continentId: ContinentId;
  x: number;
  y: number;
}

/** Three watch cairns on the ashwood edge (away from plaza spawn ~24,18). */
export const ASHWOOD_CAIRNS: CairnDef[] = [
  { id: "cairn-west", name: "West Watch Cairn", continentId: "thornreach", x: 12, y: 10 },
  { id: "cairn-east", name: "East Watch Cairn", continentId: "thornreach", x: 36, y: 12 },
  { id: "cairn-south", name: "South Watch Cairn", continentId: "thornreach", x: 18, y: 30 },
];

export const ASHWOOD_CAIRN_IDS = ASHWOOD_CAIRNS.map((c) => c.id);

export function cairnsOnContinent(id: ContinentId): CairnDef[] {
  return ASHWOOD_CAIRNS.filter((c) => c.continentId === id);
}

export function getCairn(id: string): CairnDef | undefined {
  return ASHWOOD_CAIRNS.find((c) => c.id === id);
}

/** Draw stacked-stone cairn markers (same sheet family as hunt cairns). */
export function drawCairns(
  ctx: CanvasRenderingContext2D,
  cairns: CairnDef[],
  originX: number,
  originY: number,
  TILE: number,
): void {
  for (const c of cairns) {
    const sx = Math.floor(c.x * TILE - originX + TILE / 2);
    const sy = Math.floor(c.y * TILE - originY + TILE / 2);
    drawWatchCairnSprite(ctx, sx, sy);
  }
}
