/** Ashwood Watch trail cairns on Thornreach. */
import type { ContinentId } from "@/game/continents";

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

/** Draw stacked-stone cairn markers. */
export function drawCairns(
  ctx: CanvasRenderingContext2D,
  cairns: CairnDef[],
  originX: number,
  originY: number,
  TILE: number,
): void {
  for (const c of cairns) {
    const sx = Math.floor(c.x * TILE - originX);
    const sy = Math.floor(c.y * TILE - originY);
    ctx.fillStyle = "#5a5648";
    ctx.fillRect(sx + 6, sy + 14, TILE - 12, 8);
    ctx.fillStyle = "#7a7668";
    ctx.fillRect(sx + 8, sy + 8, TILE - 16, 8);
    ctx.fillStyle = "#9a9688";
    ctx.fillRect(sx + 10, sy + 3, TILE - 20, 7);
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(sx + TILE / 2, sy + 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
