/** Y-sort draw list for Tibia-adjacent depth (creatures, folk, player, canopies). */

export type DepthItem = {
  /** World Y used as sort key (south draws later / in front). */
  y: number;
  x?: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
};

export function flushDepth(ctx: CanvasRenderingContext2D, items: DepthItem[]): void {
  items.sort((a, b) => a.y - b.y || (a.x ?? 0) - (b.x ?? 0));
  for (const it of items) it.draw(ctx);
}
