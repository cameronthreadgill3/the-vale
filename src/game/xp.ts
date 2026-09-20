/** Tibia-style cubic experience curve. Total XP required to *reach* level n. */
export function totalXpForLevel(level: number): number {
  if (level <= 1) return 0;
  const n = Math.floor(level);
  return Math.floor((50 / 3) * (n * n * n - 6 * n * n + 17 * n - 12));
}

export function xpToNext(level: number): number {
  return totalXpForLevel(level + 1) - totalXpForLevel(level);
}

export function progressInLevel(level: number, xp: number): number {
  const here = totalXpForLevel(level);
  const next = totalXpForLevel(level + 1);
  if (next <= here) return 1;
  return Math.max(0, Math.min(1, (xp - here) / (next - here)));
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (level < 500 && totalXpForLevel(level + 1) <= xp) level += 1;
  return level;
}

/** Tibia-like: killing much weaker foes is wasteful; near-level is efficient. */
export function awardedXp(playerLevel: number, enemyLevel: number, base: number): number {
  const diff = playerLevel - enemyLevel;
  let factor = 1;
  if (diff >= 10) factor = 0.12;
  else if (diff >= 5) factor = 0.45;
  else if (diff >= 2) factor = 0.75;
  else if (diff <= -4) factor = 1.25;
  return Math.max(1, Math.floor(base * factor));
}
