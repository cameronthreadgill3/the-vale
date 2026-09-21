/** Extra early fauna while Teeth in the Grass is sticky. */
import { spawnHuntEcology, ensureTeethPrey } from "@/game/spawnEcology";
import { isTeethActive, loadQuestLog } from "@/game/quests";
import type { Enemy } from "@/game/enemies";
import type { ContinentId } from "@/game/continents";
import { townBlockedTiles, type WorldMap } from "@/game/world";

export function spawnEnemiesForQuest(
  map: WorldMap,
  continentId: ContinentId,
  blockedTiles: { x: number; y: number }[],
): Enemy[] {
  const blocked = [...blockedTiles, ...townBlockedTiles(map)];
  const enemies = spawnHuntEcology(map, continentId, blocked);
  const boost =
    map.kind === "overworld" &&
    continentId === "thornreach" &&
    isTeethActive(loadQuestLog());
  if (!boost) return enemies;
  // Hunt tables already densify Ashwood Edge; pad if placement missed Teeth prey.
  return ensureTeethPrey(enemies, map, continentId, blocked, 3, 1);
}
