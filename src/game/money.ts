/** Smallest coin is copper. 100c = 1s, 100s = 1g, 100g = 1p. */
export const COPPER = 1;
export const SILVER = 100;
export const GOLD = 10_000;
export const PLATINUM = 1_000_000;

export type Purse = { p: number; g: number; s: number; c: number };

export function splitCoins(copper: number): Purse {
  let n = Math.max(0, Math.floor(copper));
  const p = Math.floor(n / PLATINUM);
  n -= p * PLATINUM;
  const g = Math.floor(n / GOLD);
  n -= g * GOLD;
  const s = Math.floor(n / SILVER);
  n -= s * SILVER;
  return { p, g, s, c: n };
}

export function combineCoins(parts: Partial<Purse>): number {
  return (
    Math.max(0, Math.floor(parts.p ?? 0)) * PLATINUM +
    Math.max(0, Math.floor(parts.g ?? 0)) * GOLD +
    Math.max(0, Math.floor(parts.s ?? 0)) * SILVER +
    Math.max(0, Math.floor(parts.c ?? 0)) * COPPER
  );
}

export function formatCoins(copper: number): string {
  const { p, g, s, c } = splitCoins(copper);
  const parts: string[] = [];
  if (p) parts.push(`${p}p`);
  if (g) parts.push(`${g}g`);
  if (s) parts.push(`${s}s`);
  if (c || parts.length === 0) parts.push(`${c}c`);
  return parts.join(" ");
}
