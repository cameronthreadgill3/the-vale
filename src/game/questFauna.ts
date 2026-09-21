/** Extra early fauna while Teeth in the Grass is sticky. */
import { spawnHuntEcology, ensureTeethPrey, ensureGorseFoxes, ensureAshVoles, ensureSpineHounds, ensureBriarMites, ensurePaleRats, ensureAshenHounds, ensureAshenRats } from "@/game/spawnEcology";
import { isTeethActive, isGreenGateActive, isSpineActive, isPaleActive, isAshenActive, loadQuestLog } from "@/game/quests";
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
  if (
    map.kind === "overworld" &&
    continentId === "verdant-spine" &&
    isGreenGateActive(loadQuestLog())
  ) {
    ensureGorseFoxes(enemies, map, continentId, blocked, 2);
  }
  if (
    map.kind === "overworld" &&
    continentId === "verdant-spine" &&
    isSpineActive(loadQuestLog())
  ) {
    ensureAshVoles(enemies, map, continentId, blocked, 2);
    ensureSpineHounds(enemies, map, continentId, blocked, 1);
  }
  if (
    map.kind === "overworld" &&
    continentId === "pale-wastes" &&
    isPaleActive(loadQuestLog())
  ) {
    ensureBriarMites(enemies, map, continentId, blocked, 2);
    ensurePaleRats(enemies, map, continentId, blocked, 1);
  }
  if (
    map.kind === "overworld" &&
    continentId === "ashen-marches" &&
    isAshenActive(loadQuestLog())
  ) {
    ensureAshenHounds(enemies, map, continentId, blocked, 2);
    ensureAshenRats(enemies, map, continentId, blocked, 1);
  }
  const boost =
    map.kind === "overworld" &&
    continentId === "thornreach" &&
    isTeethActive(loadQuestLog());
  if (!boost) return enemies;
  // Hunt tables already densify Ashwood Edge; pad if placement missed Teeth prey.
  return ensureTeethPrey(enemies, map, continentId, blocked, 3, 1);
}
