/** Area spawn tables for Thornreach hunt zones; hollows keep the base seed. */

import {
  ENEMY_KINDS,
  spawnEnemies,
  type Enemy,
  type EnemyKindId,
} from "@/game/enemies";
import { WORLD_SEED, type ContinentId } from "@/game/continents";
import { rngFrom, type Rng } from "@/game/rng";
import { TILE, isSolid, type WorldMap } from "@/game/world";
import {
  HUNT_PLAZA_CLEAR_TILES,
  huntZonesFor,
  type HuntZone,
} from "@/game/huntZones";

function walkable(map: WorldMap, tx: number, ty: number): boolean {
  if (tx <= 0 || ty <= 0 || tx >= map.width - 1 || ty >= map.height - 1) return false;
  const tile = map.tiles[ty]![tx]!;
  if (isSolid(tile, map.kind)) return false;
  if (tile === "gate" || tile === "hollow" || tile === "exit") return false;
  return true;
}

function makeEnemy(
  kindId: EnemyKindId,
  px: number,
  py: number,
  id: string,
  wanderT: number,
): Enemy {
  const kind = ENEMY_KINDS[kindId];
  return {
    id,
    kind,
    x: px,
    y: py,
    homeX: px,
    homeY: py,
    hp: kind.maxHp,
    ai: "idle",
    attackCd: 0,
    windUpT: 0,
    wanderT,
    wanderDx: 0,
    wanderDy: 0,
    flash: 0,
    corpseT: 0,
  };
}

function tryPlaceInZone(
  rng: Rng,
  map: WorldMap,
  zone: HuntZone,
  blocked: Set<string>,
): { x: number; y: number } | null {
  const spawn = map.spawn;
  for (let attempt = 0; attempt < 48; attempt++) {
    const ang = rng() * Math.PI * 2;
    const r = Math.sqrt(rng()) * zone.radius;
    const tx = Math.round(zone.cairn.x + Math.cos(ang) * r);
    const ty = Math.round(zone.cairn.y + Math.sin(ang) * r);
    if (tx === zone.cairn.x && ty === zone.cairn.y) continue;
    if (!walkable(map, tx, ty) || blocked.has(`${tx},${ty}`)) continue;
    if (Math.hypot(tx - spawn.x, ty - spawn.y) < HUNT_PLAZA_CLEAR_TILES) continue;
    blocked.add(`${tx},${ty}`);
    return { x: (tx + 0.5) * TILE, y: (ty + 0.5) * TILE };
  }
  return null;
}

function spawnThornreachHunt(
  map: WorldMap,
  blockedTiles: { x: number; y: number }[],
): Enemy[] {
  const rng = rngFrom(`${WORLD_SEED}|foes|hunt|thornreach`);
  const blocked = new Set(blockedTiles.map((t) => `${t.x},${t.y}`));
  for (const z of huntZonesFor("thornreach")) {
    blocked.add(`${z.cairn.x},${z.cairn.y}`);
  }
  const out: Enemy[] = [];
  let serial = 0;

  for (const zone of huntZonesFor("thornreach")) {
    for (const entry of zone.table) {
      for (let i = 0; i < entry.count; i++) {
        const pos = tryPlaceInZone(rng, map, zone, blocked);
        if (!pos) continue;
        out.push(
          makeEnemy(
            entry.kind,
            pos.x,
            pos.y,
            `${zone.id}-${entry.kind}-${serial++}`,
            rng() * 2,
          ),
        );
      }
    }
  }

  return out;
}

/** Seeded fauna for the current map — hunt tables on Thornreach overworld. */
export function spawnHuntEcology(
  map: WorldMap,
  continentId: ContinentId,
  blockedTiles: { x: number; y: number }[],
): Enemy[] {
  if (map.kind === "overworld" && continentId === "thornreach") {
    return spawnThornreachHunt(map, blockedTiles);
  }
  return spawnEnemies(map, continentId, blockedTiles);
}

/** Guarantee enough Teeth-quest prey if a placement miss left the pack thin. */
export function ensureTeethPrey(
  enemies: Enemy[],
  map: WorldMap,
  continentId: ContinentId,
  blockedTiles: { x: number; y: number }[],
  needRats: number,
  needHounds: number,
): Enemy[] {
  if (map.kind !== "overworld" || continentId !== "thornreach") return enemies;
  const rats = enemies.filter((e) => e.kind.id === "needle-rat").length;
  const hounds = enemies.filter((e) => e.kind.id === "bark-hound").length;
  const extraRats = Math.max(0, needRats - rats);
  const extraHounds = Math.max(0, needHounds - hounds);
  if (extraRats === 0 && extraHounds === 0) return enemies;

  const rng = rngFrom(`${WORLD_SEED}|foes|hunt|teeth-pad|thornreach`);
  const blocked = new Set(blockedTiles.map((t) => `${t.x},${t.y}`));
  for (const e of enemies) {
    blocked.add(`${Math.floor(e.x / TILE)},${Math.floor(e.y / TILE)}`);
  }
  const ashwood = huntZonesFor("thornreach").find((z) => z.id === "ashwood-edge");
  const north = huntZonesFor("thornreach").find((z) => z.id === "north-ashwood");
  let serial = enemies.length;

  const place = (kindId: EnemyKindId, zone: HuntZone | undefined) => {
    if (!zone) return;
    const pos = tryPlaceInZone(rng, map, zone, blocked);
    if (!pos) return;
    enemies.push(
      makeEnemy(kindId, pos.x, pos.y, `pad-${kindId}-${serial++}`, rng() * 2),
    );
  };

  for (let i = 0; i < extraRats; i++) place("needle-rat", ashwood);
  for (let i = 0; i < extraHounds; i++) place("bark-hound", north);
  return enemies;
}

function tryPlaceOpen(
  rng: Rng,
  map: WorldMap,
  blocked: Set<string>,
  minDistFromSpawn: number,
): { x: number; y: number } | null {
  const spawn = map.spawn;
  for (let attempt = 0; attempt < 40; attempt++) {
    const tx = 2 + Math.floor(rng() * (map.width - 4));
    const ty = 2 + Math.floor(rng() * (map.height - 4));
    if (!walkable(map, tx, ty) || blocked.has(`${tx},${ty}`)) continue;
    if (Math.hypot(tx - spawn.x, ty - spawn.y) < minDistFromSpawn) continue;
    blocked.add(`${tx},${ty}`);
    return { x: (tx + 0.5) * TILE, y: (ty + 0.5) * TILE };
  }
  return null;
}

/** Guarantee Gorse Foxes on Verdant Spine while The Green Gate Keeps is sticky. */
export function ensureGorseFoxes(
  enemies: Enemy[],
  map: WorldMap,
  continentId: ContinentId,
  blockedTiles: { x: number; y: number }[],
  need: number,
): Enemy[] {
  if (map.kind !== "overworld" || continentId !== "verdant-spine") return enemies;
  const have = enemies.filter((e) => e.kind.id === "gorse-fox" && e.hp > 0).length;
  const extra = Math.max(0, need - have);
  if (extra === 0) return enemies;

  const rng = rngFrom(`${WORLD_SEED}|foes|hunt|green-gate|verdant-spine`);
  const blocked = new Set(blockedTiles.map((t) => `${t.x},${t.y}`));
  for (const e of enemies) {
    blocked.add(`${Math.floor(e.x / TILE)},${Math.floor(e.y / TILE)}`);
  }
  let serial = enemies.length;
  for (let i = 0; i < extra; i++) {
    const pos = tryPlaceOpen(rng, map, blocked, 6);
    if (!pos) continue;
    enemies.push(
      makeEnemy("gorse-fox", pos.x, pos.y, `pad-gorse-fox-${serial++}`, rng() * 2),
    );
  }
  return enemies;
}

/** Guarantee Ash-voles on Verdant Spine while The Spine Remembers is sticky. */
export function ensureAshVoles(
  enemies: Enemy[],
  map: WorldMap,
  continentId: ContinentId,
  blockedTiles: { x: number; y: number }[],
  need: number,
): Enemy[] {
  if (map.kind !== "overworld" || continentId !== "verdant-spine") return enemies;
  const have = enemies.filter((e) => e.kind.id === "ash-vole" && e.hp > 0).length;
  const extra = Math.max(0, need - have);
  if (extra === 0) return enemies;

  const rng = rngFrom(`${WORLD_SEED}|foes|hunt|spine-remembers|verdant-spine`);
  const blocked = new Set(blockedTiles.map((t) => `${t.x},${t.y}`));
  for (const e of enemies) {
    blocked.add(`${Math.floor(e.x / TILE)},${Math.floor(e.y / TILE)}`);
  }
  let serial = enemies.length;
  for (let i = 0; i < extra; i++) {
    const pos = tryPlaceOpen(rng, map, blocked, 6);
    if (!pos) continue;
    enemies.push(
      makeEnemy("ash-vole", pos.x, pos.y, `pad-ash-vole-${serial++}`, rng() * 2),
    );
  }
  return enemies;
}

/** Light Bark Hound pad on Verdant Spine while The Spine Remembers is sticky. */
export function ensureSpineHounds(
  enemies: Enemy[],
  map: WorldMap,
  continentId: ContinentId,
  blockedTiles: { x: number; y: number }[],
  need: number,
): Enemy[] {
  if (map.kind !== "overworld" || continentId !== "verdant-spine") return enemies;
  const have = enemies.filter((e) => e.kind.id === "bark-hound" && e.hp > 0).length;
  const extra = Math.max(0, need - have);
  if (extra === 0) return enemies;

  const rng = rngFrom(`${WORLD_SEED}|foes|hunt|spine-hound|verdant-spine`);
  const blocked = new Set(blockedTiles.map((t) => `${t.x},${t.y}`));
  for (const e of enemies) {
    blocked.add(`${Math.floor(e.x / TILE)},${Math.floor(e.y / TILE)}`);
  }
  let serial = enemies.length;
  for (let i = 0; i < extra; i++) {
    const pos = tryPlaceOpen(rng, map, blocked, 6);
    if (!pos) continue;
    enemies.push(
      makeEnemy("bark-hound", pos.x, pos.y, `pad-bark-hound-${serial++}`, rng() * 2),
    );
  }
  return enemies;
}

/** Guarantee Briar Mites on Pale Wastes while The Pale Gate Opens is sticky. */
export function ensureBriarMites(
  enemies: Enemy[],
  map: WorldMap,
  continentId: ContinentId,
  blockedTiles: { x: number; y: number }[],
  need: number,
): Enemy[] {
  if (map.kind !== "overworld" || continentId !== "pale-wastes") return enemies;
  const have = enemies.filter((e) => e.kind.id === "briar-mite" && e.hp > 0).length;
  const extra = Math.max(0, need - have);
  if (extra === 0) return enemies;

  const rng = rngFrom(`${WORLD_SEED}|foes|hunt|pale-gate|pale-wastes`);
  const blocked = new Set(blockedTiles.map((t) => `${t.x},${t.y}`));
  for (const e of enemies) {
    blocked.add(`${Math.floor(e.x / TILE)},${Math.floor(e.y / TILE)}`);
  }
  let serial = enemies.length;
  for (let i = 0; i < extra; i++) {
    const pos = tryPlaceOpen(rng, map, blocked, 6);
    if (!pos) continue;
    enemies.push(
      makeEnemy("briar-mite", pos.x, pos.y, `pad-briar-mite-${serial++}`, rng() * 2),
    );
  }
  return enemies;
}

/** Light Needle Rat pad on Pale Wastes while The Pale Gate Opens is sticky. */
export function ensurePaleRats(
  enemies: Enemy[],
  map: WorldMap,
  continentId: ContinentId,
  blockedTiles: { x: number; y: number }[],
  need: number,
): Enemy[] {
  if (map.kind !== "overworld" || continentId !== "pale-wastes") return enemies;
  const have = enemies.filter((e) => e.kind.id === "needle-rat" && e.hp > 0).length;
  const extra = Math.max(0, need - have);
  if (extra === 0) return enemies;

  const rng = rngFrom(`${WORLD_SEED}|foes|hunt|pale-rat|pale-wastes`);
  const blocked = new Set(blockedTiles.map((t) => `${t.x},${t.y}`));
  for (const e of enemies) {
    blocked.add(`${Math.floor(e.x / TILE)},${Math.floor(e.y / TILE)}`);
  }
  let serial = enemies.length;
  for (let i = 0; i < extra; i++) {
    const pos = tryPlaceOpen(rng, map, blocked, 6);
    if (!pos) continue;
    enemies.push(
      makeEnemy("needle-rat", pos.x, pos.y, `pad-needle-rat-${serial++}`, rng() * 2),
    );
  }
  return enemies;
}

/** Guarantee Bark Hounds on Ashen Marches while The Ashen Gate Opens is sticky. */
export function ensureAshenHounds(
  enemies: Enemy[],
  map: WorldMap,
  continentId: ContinentId,
  blockedTiles: { x: number; y: number }[],
  need: number,
): Enemy[] {
  if (map.kind !== "overworld" || continentId !== "ashen-marches") return enemies;
  const have = enemies.filter((e) => e.kind.id === "bark-hound" && e.hp > 0).length;
  const extra = Math.max(0, need - have);
  if (extra === 0) return enemies;

  const rng = rngFrom(`${WORLD_SEED}|foes|hunt|ashen-gate|ashen-marches`);
  const blocked = new Set(blockedTiles.map((t) => `${t.x},${t.y}`));
  for (const e of enemies) {
    blocked.add(`${Math.floor(e.x / TILE)},${Math.floor(e.y / TILE)}`);
  }
  let serial = enemies.length;
  for (let i = 0; i < extra; i++) {
    const pos = tryPlaceOpen(rng, map, blocked, 6);
    if (!pos) continue;
    enemies.push(
      makeEnemy("bark-hound", pos.x, pos.y, `pad-bark-hound-${serial++}`, rng() * 2),
    );
  }
  return enemies;
}

/** Light Needle Rat pad on Ashen Marches while The Ashen Gate Opens is sticky. */
export function ensureAshenRats(
  enemies: Enemy[],
  map: WorldMap,
  continentId: ContinentId,
  blockedTiles: { x: number; y: number }[],
  need: number,
): Enemy[] {
  if (map.kind !== "overworld" || continentId !== "ashen-marches") return enemies;
  const have = enemies.filter((e) => e.kind.id === "needle-rat" && e.hp > 0).length;
  const extra = Math.max(0, need - have);
  if (extra === 0) return enemies;

  const rng = rngFrom(`${WORLD_SEED}|foes|hunt|ashen-rat|ashen-marches`);
  const blocked = new Set(blockedTiles.map((t) => `${t.x},${t.y}`));
  for (const e of enemies) {
    blocked.add(`${Math.floor(e.x / TILE)},${Math.floor(e.y / TILE)}`);
  }
  let serial = enemies.length;
  for (let i = 0; i < extra; i++) {
    const pos = tryPlaceOpen(rng, map, blocked, 6);
    if (!pos) continue;
    enemies.push(
      makeEnemy("needle-rat", pos.x, pos.y, `pad-needle-rat-${serial++}`, rng() * 2),
    );
  }
  return enemies;
}
