/** Seeded hollow dungeon generation. */

import { WORLD_SEED, getContinent, type ContinentId, type BiomePalette } from "@/game/continents";
import { rngFrom, randInt } from "@/game/rng";
import {
  HOLLOW_W,
  HOLLOW_H,
  clearArea,
  type GroundTile,
  type WorldMap,
} from "@/game/world/types";

function shade(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.floor(((n >> 16) & 0xff) * factor);
  const g = Math.floor(((n >> 8) & 0xff) * factor);
  const b = Math.floor((n & 0xff) * factor);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function generateHollow(
  continentId: ContinentId,
  hollowIndex: number,
  returnTile: { x: number; y: number },
): WorldMap {
  const continent = getContinent(continentId);
  const seed = `${WORLD_SEED}|hollow|${continent.seedPrefix}|${hollowIndex}`;
  const rng = rngFrom(seed);
  const w = HOLLOW_W;
  const h = HOLLOW_H;
  const tiles: GroundTile[][] = [];

  for (let y = 0; y < h; y++) {
    const row: GroundTile[] = [];
    for (let x = 0; x < w; x++) {
      row.push("stone");
    }
    tiles.push(row);
  }

  const rooms: { x: number; y: number; rw: number; rh: number }[] = [];
  // Extra room so the last one can read as a chamber, not a second exit.
  const roomCount = 5 + randInt(rng, 0, 2);
  for (let i = 0; i < roomCount; i++) {
    const deep = i === roomCount - 1;
    const rw = randInt(rng, deep ? 6 : 4, deep ? 8 : 7);
    const rh = randInt(rng, deep ? 5 : 3, deep ? 7 : 6);
    const rx = randInt(rng, 2, w - rw - 2);
    const ry = randInt(rng, 2, h - rh - 2);
    rooms.push({ x: rx, y: ry, rw, rh });
    for (let y = ry; y < ry + rh; y++) {
      for (let x = rx; x < rx + rw; x++) {
        const n = rng();
        if (n < 0.08) tiles[y]![x] = "water";
        else if (n < 0.18) tiles[y]![x] = "dirt";
        else if (n < 0.28) tiles[y]![x] = "path";
        else tiles[y]![x] = rng() < 0.5 ? "grass" : "grassAlt";
      }
    }
  }

  for (let i = 1; i < rooms.length; i++) {
    const a = rooms[i - 1]!;
    const b = rooms[i]!;
    const ax = a.x + Math.floor(a.rw / 2);
    const ay = a.y + Math.floor(a.rh / 2);
    const bx = b.x + Math.floor(b.rw / 2);
    const by = b.y + Math.floor(b.rh / 2);
    let cx = ax;
    let cy = ay;
    while (cx !== bx) {
      tiles[cy]![cx] = "path";
      cx += cx < bx ? 1 : -1;
    }
    while (cy !== by) {
      tiles[cy]![cx] = "path";
      cy += cy < by ? 1 : -1;
    }
  }

  const first = rooms[0]!;
  const spawnX = first.x + Math.floor(first.rw / 2);
  const spawnY = first.y + Math.floor(first.rh / 2);
  clearArea(tiles, spawnX, spawnY, 1, "path", w, h);
  // Single exit at the entrance — the deep room is a chamber, not a second door.
  tiles[spawnY]![spawnX] = "exit";

  let chamberRoom = rooms[rooms.length - 1]!;
  if (
    chamberRoom.x === first.x &&
    chamberRoom.y === first.y &&
    rooms.length > 1
  ) {
    chamberRoom = rooms[rooms.length - 2]!;
  }
  const deepX = chamberRoom.x + Math.floor(chamberRoom.rw / 2);
  const deepY = chamberRoom.y + Math.floor(chamberRoom.rh / 2);
  if (deepX !== spawnX || deepY !== spawnY) {
    clearArea(tiles, deepX, deepY, 2, "path", w, h);
    tiles[deepY]![deepX] = "dirt";
  }
  const exitX = spawnX;
  const exitY = spawnY;
  const bossChamber =
    deepX !== spawnX || deepY !== spawnY ? { x: deepX, y: deepY } : null;

  for (let i = 0; i < 5; i++) {
    const tx = randInt(rng, 2, w - 3);
    const ty = randInt(rng, 2, h - 3);
    if (tiles[ty]![tx] !== "exit" && tiles[ty]![tx] !== "path") {
      if (rng() < 0.5) tiles[ty]![tx] = "water";
      else if (tiles[ty]![tx] !== "stone") tiles[ty]![tx] = "stone";
    }
  }

  const base = continent.palette;
  // Keep hollow mood but raise contrast so tiles / exits stay readable.
  const palette: BiomePalette = {
    grass: shade(base.grass, 0.88),
    grassAlt: shade(base.grassAlt, 0.88),
    dirt: shade(base.dirt, 0.9),
    path: shade(base.path, 0.95),
    stone: shade(base.stone, 0.92),
    water: shade(base.water, 0.9),
    flower: shade(base.flower, 0.85),
    gate: base.gate,
    hollow: base.hollow,
    exit: base.exit,
  };

  return {
    kind: "hollow",
    continentId,
    hollowIndex,
    width: w,
    height: h,
    tiles,
    palette,
    darkness: 0.2,
    gates: [],
    hollows: [],
    exit: { x: exitX, y: exitY },
    spawn: { x: spawnX, y: spawnY },
    returnTile,
    bossChamber,
  };
}
