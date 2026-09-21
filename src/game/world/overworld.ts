/** Seeded continent overworld generation. */

import { WORLD_SEED, getContinent, type ContinentId } from "@/game/continents";
import { rngFrom, randInt, type Rng } from "@/game/rng";
import {
  MAP_W,
  MAP_H,
  clearArea,
  placeWalkable,
  type GroundTile,
  type GateMarker,
  type HollowMarker,
  type WorldMap,
} from "@/game/world/types";
import { stampThornreachTown } from "@/game/world/town";
import { stampHuntCairnTiles, huntZonesFor } from "@/game/huntZones";
import { stampProfessionSpots } from "@/game/professions";

/** Edge slots for gates - N/E/S/W midpoints with slight offsets. */
function gateSlots(
  count: number,
  w: number,
  h: number,
  rng: Rng,
): { x: number; y: number }[] {
  const slots = [
    { x: Math.floor(w / 2), y: 2 },
    { x: w - 3, y: Math.floor(h / 2) },
    { x: Math.floor(w / 2), y: h - 3 },
    { x: 2, y: Math.floor(h / 2) },
    { x: Math.floor(w / 3), y: 2 },
    { x: w - 3, y: Math.floor(h / 3) },
  ];
  const picked: { x: number; y: number }[] = [];
  const used = new Set<number>();
  for (let i = 0; i < count; i++) {
    let idx = i % slots.length;
    let guard = 0;
    while (used.has(idx) && guard < slots.length) {
      idx = (idx + 1 + randInt(rng, 0, 2)) % slots.length;
      guard++;
    }
    used.add(idx);
    const s = slots[idx]!;
    picked.push({
      x: s.x + randInt(rng, -1, 1),
      y: s.y + randInt(rng, -1, 1),
    });
  }
  return picked;
}

export function generateOverworld(continentId: ContinentId): WorldMap {
  const continent = getContinent(continentId);
  const seed = `${WORLD_SEED}|over|${continent.seedPrefix}`;
  const rng = rngFrom(seed);
  const w = MAP_W;
  const h = MAP_H;
  const tiles: GroundTile[][] = [];

  for (let y = 0; y < h; y++) {
    const row: GroundTile[] = [];
    for (let x = 0; x < w; x++) {
      const edge = x === 0 || y === 0 || x === w - 1 || y === h - 1;
      if (edge) {
        row.push("stone");
        continue;
      }
      const n = rng();
      const waterT = continent.waterBias;
      const dirtT = waterT + 0.08;
      const pathT = dirtT + 0.06;
      const flowerT = pathT + continent.flowerBias;
      const stoneT = flowerT + continent.stoneBias;
      if (n < waterT) row.push("water");
      else if (n < dirtT) row.push("dirt");
      else if (n < pathT) row.push("path");
      else if (n < flowerT) row.push("flower");
      else if (n < stoneT) row.push("stone");
      else row.push(rng() < 0.5 ? "grass" : "grassAlt");
    }
    tiles.push(row);
  }

  const midY = Math.floor(h / 2);
  for (let x = 2; x < w - 2; x++) {
    tiles[midY]![x] = "path";
    if (rng() < 0.35) tiles[midY - 1]![x] = "dirt";
    if (rng() < 0.35) tiles[midY + 1]![x] = "dirt";
  }

  const sx = continent.spawn.x;
  const sy = continent.spawn.y;
  clearArea(tiles, sx, sy, 2, "grass", w, h);
  for (let x = sx - 2; x <= sx + 2; x++) {
    if (x > 0 && x < w - 1) tiles[sy]![x] = "path";
  }
  // Plaza fountain (heal tile) — animated flower/fountain sheet
  tiles[sy]![sx] = "flower";

  for (let i = 0; i < 10; i++) {
    const tx = randInt(rng, 2, w - 3);
    const ty = randInt(rng, 2, h - 3);
    if (Math.abs(tx - sx) > 4 || Math.abs(ty - sy) > 4) {
      tiles[ty]![tx] = "stone";
    }
  }

  const gateTargets = continent.gates;
  const slots = gateSlots(gateTargets.length, w, h, rng);
  const gates: GateMarker[] = [];
  for (let i = 0; i < gateTargets.length; i++) {
    const slot = slots[i]!;
    const pos = placeWalkable(tiles, slot.x, slot.y, "gate", w, h);
    gates.push({
      x: pos.x,
      y: pos.y,
      targetContinentId: gateTargets[i]!,
    });
  }

  const huntCairns = huntZonesFor(continentId);
  const hollows: HollowMarker[] = [];
  const hollowCount = continent.hollowCount;
  for (let i = 0; i < hollowCount; i++) {
    let hx = 0;
    let hy = 0;
    let tries = 0;
    do {
      hx = randInt(rng, 5, w - 6);
      hy = randInt(rng, 5, h - 6);
      tries++;
    } while (
      tries < 40 &&
      (Math.hypot(hx - sx, hy - sy) < (continentId === "thornreach" ? 11 : 6) ||
        gates.some((g) => Math.hypot(g.x - hx, g.y - hy) < 4) ||
        hollows.some((h0) => Math.hypot(h0.x - hx, h0.y - hy) < 5) ||
        huntCairns.some((z) => Math.hypot(z.cairn.x - hx, z.cairn.y - hy) < 4))
    );
    const pos = placeWalkable(tiles, hx, hy, "hollow", w, h);
    hollows.push({ x: pos.x, y: pos.y, index: i });
  }

  // Extra ashwood groves after markers so spawn/gates/hollows/cairns stay walkable.
  for (let g = 0; g < 8; g++) {
    const gx = randInt(rng, 4, w - 5);
    const gy = randInt(rng, 4, h - 5);
    if (Math.hypot(gx - sx, gy - sy) < 7) continue;
    if (gates.some((gt) => Math.hypot(gt.x - gx, gt.y - gy) < 4)) continue;
    if (hollows.some((h0) => Math.hypot(h0.x - gx, h0.y - gy) < 4)) continue;
    if (huntCairns.some((z) => Math.hypot(z.cairn.x - gx, z.cairn.y - gy) < 4)) continue;
    const count = 4 + randInt(rng, 0, 5);
    for (let i = 0; i < count; i++) {
      const tx = gx + randInt(rng, -2, 2);
      const ty = gy + randInt(rng, -2, 2);
      if (tx <= 0 || ty <= 0 || tx >= w - 1 || ty >= h - 1) continue;
      const t = tiles[ty]![tx];
      if (t === "grass" || t === "grassAlt" || t === "dirt") {
        tiles[ty]![tx] = "stone";
      }
    }
  }

  const map: WorldMap = {
    kind: "overworld",
    continentId,
    hollowIndex: null,
    width: w,
    height: h,
    tiles,
    palette: continent.palette,
    darkness: 0,
    gates,
    hollows,
    exit: null,
    spawn: { x: sx, y: sy },
    returnTile: null,
  };
  stampThornreachTown(map);
  stampHuntCairnTiles(map);
  stampProfessionSpots(map);
  return map;
}

export function spawnNearArrivalGate(
  map: WorldMap,
  fromContinentId: ContinentId | null,
): { x: number; y: number } {
  if (fromContinentId) {
    const gate = map.gates.find((g) => g.targetContinentId === fromContinentId);
    if (gate) {
      const cx = Math.floor(map.width / 2);
      const cy = Math.floor(map.height / 2);
      const dx = Math.sign(cx - gate.x) || 0;
      const dy = Math.sign(cy - gate.y) || 0;
      // Step inward from the gate so we do not stand on the gate tile itself.
      const candidates = [
        { x: gate.x + dx, y: gate.y + dy },
        { x: gate.x + dx, y: gate.y },
        { x: gate.x, y: gate.y + dy },
        { x: gate.x - dx, y: gate.y - dy },
      ];
      for (const c of candidates) {
        if (
          c.x > 0 &&
          c.y > 0 &&
          c.x < map.width - 1 &&
          c.y < map.height - 1
        ) {
          return c;
        }
      }
      return { x: gate.x + dx, y: gate.y + dy };
    }
  }
  return { ...map.spawn };
}
