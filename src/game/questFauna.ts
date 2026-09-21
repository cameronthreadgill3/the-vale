/** Extra early fauna while Teeth in the Grass is sticky. */
import {
  ENEMY_KINDS,
  spawnEnemies,
  type Enemy,
  type EnemyKindId,
} from "@/game/enemies";
import { WORLD_SEED, type ContinentId } from "@/game/continents";
import { rngFrom, randInt } from "@/game/rng";
import { TILE, isSolid, type WorldMap } from "@/game/world";
import { isTeethActive, loadQuestLog } from "@/game/quests";

export function spawnEnemiesForQuest(
  map: WorldMap,
  continentId: ContinentId,
  blockedTiles: { x: number; y: number }[],
): Enemy[] {
  const enemies = spawnEnemies(map, continentId, blockedTiles);
  const boost =
    map.kind === "overworld" &&
    continentId === "thornreach" &&
    isTeethActive(loadQuestLog());
  if (!boost) return enemies;

  const needRats = Math.max(
    0,
    5 - enemies.filter((e) => e.kind.id === "needle-rat").length,
  );
  const needHounds = Math.max(
    0,
    2 - enemies.filter((e) => e.kind.id === "bark-hound").length,
  );
  if (needRats === 0 && needHounds === 0) return enemies;

  const rng = rngFrom(`${WORLD_SEED}|foes|quest-boost|${continentId}`);
  const blocked = new Set(blockedTiles.map((t) => `${t.x},${t.y}`));
  for (const e of enemies) {
    blocked.add(`${Math.floor(e.x / TILE)},${Math.floor(e.y / TILE)}`);
  }
  let serial = enemies.length;

  const walkable = (tx: number, ty: number) => {
    if (tx <= 0 || ty <= 0 || tx >= map.width - 1 || ty >= map.height - 1) return false;
    const tile = map.tiles[ty]![tx]!;
    if (isSolid(tile, map.kind)) return false;
    if (tile === "gate" || tile === "hollow" || tile === "exit") return false;
    return true;
  };

  const place = (kindId: EnemyKindId, minDist: number) => {
    const spawn = map.spawn;
    for (let attempt = 0; attempt < 40; attempt++) {
      const tx = randInt(rng, 2, map.width - 3);
      const ty = randInt(rng, 2, map.height - 3);
      if (!walkable(tx, ty) || blocked.has(`${tx},${ty}`)) continue;
      if (Math.hypot(tx - spawn.x, ty - spawn.y) < minDist) continue;
      blocked.add(`${tx},${ty}`);
      const kind = ENEMY_KINDS[kindId];
      enemies.push({
        id: `quest-${kindId}-${serial++}`,
        kind,
        x: (tx + 0.5) * TILE,
        y: (ty + 0.5) * TILE,
        hp: kind.maxHp,
        ai: "idle",
        attackCd: 0,
        wanderT: rng() * 2,
        wanderDx: 0,
        wanderDy: 0,
        flash: 0,
        corpseT: 0,
      });
      return;
    }
  };

  for (let i = 0; i < needRats; i++) place("needle-rat", 5);
  for (let i = 0; i < needHounds; i++) place("bark-hound", 7);
  return enemies;
}
