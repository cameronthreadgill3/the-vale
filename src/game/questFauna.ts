/** Extra early fauna while Teeth in the Grass is sticky. */
import { spawnHuntEcology, ensureTeethPrey, ensureGorseFoxes, ensureAshVoles, ensureSpineHounds, ensureBriarMites, ensurePaleRats, ensureAshenHounds, ensureAshenRats, ensureEmberRats, ensureEmberHounds, ensureCoilVoles, ensureCoilFoxes, ensureChoirMites, ensureChoirHounds, ensureEdgeVoles, ensureEdgeHounds, ensureWharfFoxes, ensureWharfRats } from "@/game/spawnEcology";
import { isTeethActive, isGreenGateActive, isSpineActive, isPaleActive, isAshenActive, isEmbercoilActive, isCoilActive, isChoirRemembersActive, isEdgeRemembersActive, isWharfRemembersActive, loadQuestLog } from "@/game/quests";
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
  if (
    map.kind === "overworld" &&
    continentId === "embercoil" &&
    isEmbercoilActive(loadQuestLog())
  ) {
    ensureEmberRats(enemies, map, continentId, blocked, 2);
    ensureEmberHounds(enemies, map, continentId, blocked, 1);
  }
  if (
    map.kind === "overworld" &&
    continentId === "embercoil" &&
    isCoilActive(loadQuestLog())
  ) {
    ensureCoilVoles(enemies, map, continentId, blocked, 2);
    ensureCoilFoxes(enemies, map, continentId, blocked, 1);
  }
  if (
    map.kind === "overworld" &&
    continentId === "sunken-choir" &&
    isChoirRemembersActive(loadQuestLog())
  ) {
    ensureChoirMites(enemies, map, continentId, blocked, 2);
    ensureChoirHounds(enemies, map, continentId, blocked, 1);
  }
  if (
    map.kind === "overworld" &&
    continentId === "thornreach" &&
    isEdgeRemembersActive(loadQuestLog())
  ) {
    ensureEdgeVoles(enemies, map, continentId, blocked, 2);
    ensureEdgeHounds(enemies, map, continentId, blocked, 1);
  }
  if (
    map.kind === "overworld" &&
    continentId === "nightglass-coast" &&
    isWharfRemembersActive(loadQuestLog())
  ) {
    ensureWharfFoxes(enemies, map, continentId, blocked, 2);
    ensureWharfRats(enemies, map, continentId, blocked, 1);
  }
  const boost =
    map.kind === "overworld" &&
    continentId === "thornreach" &&
    isTeethActive(loadQuestLog());
  if (!boost) return enemies;
  // Hunt tables already densify Ashwood Edge; pad if placement missed Teeth prey.
  return ensureTeethPrey(enemies, map, continentId, blocked, 3, 1);
}
