/** World map generation barrel. */

import { getContinent, type ContinentId } from "@/game/continents";
import { generateHollow } from "@/game/world/hollow";
import { generateOverworld } from "@/game/world/overworld";
import type { WorldMap } from "@/game/world/types";

export {
  TILE,
  MAP_W,
  MAP_H,
  HOLLOW_W,
  HOLLOW_H,
  isSolid,
  isTownStructureTile,
  nearTile,
  type GroundTile,
  type GateMarker,
  type HollowMarker,
  type WorldMap,
} from "@/game/world/types";
export {
  stampThornreachTown,
  buildingsOnContinent,
  propsOnContinent,
  townBlockedTiles,
  buildingAtDoor,
  THORNREACH_DEPOT,
  THORNREACH_BUILDINGS,
  type TownBuilding,
  type TownProp,
  type TownPropKind,
} from "@/game/world/town";

export { generateOverworld, spawnNearArrivalGate } from "@/game/world/overworld";
export { generateHollow } from "@/game/world/hollow";

export function loadLocationMap(
  continentId: ContinentId,
  hollowIndex: number | null,
  hollowReturn: { x: number; y: number } | null,
): WorldMap {
  if (hollowIndex !== null) {
    const ret = hollowReturn ?? getContinent(continentId).spawn;
    return generateHollow(continentId, hollowIndex, ret);
  }
  return generateOverworld(continentId);
}
