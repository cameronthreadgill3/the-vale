/** Thornhearth plaza safe area — no PvE aggression around the fountain. */

import type { ContinentId } from "@/game/continents";
import { TILE, type WorldMap } from "@/game/world";

/** Safe radius from plaza spawn (tiles). */
export const SAFE_ZONE_RADIUS_TILES = 4.25;

/** Thornreach square / fountain is the named safe area. */
export function isSafeContinent(continentId: ContinentId): boolean {
  return continentId === "thornreach";
}

export function isInSafeZone(
  continentId: ContinentId,
  map: WorldMap,
  worldX: number,
  worldY: number,
): boolean {
  if (map.kind !== "overworld") return false;
  if (!isSafeContinent(continentId)) return false;
  const tx = worldX / TILE;
  const ty = worldY / TILE;
  const dist = Math.hypot(tx - (map.spawn.x + 0.5), ty - (map.spawn.y + 0.5));
  return dist <= SAFE_ZONE_RADIUS_TILES;
}

export const SAFE_ZONE_LABEL = "Safe zone";
