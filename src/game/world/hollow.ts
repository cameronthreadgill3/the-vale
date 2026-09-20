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
  const roomCount = 4 + randInt(rng, 0, 2);
  for (let i = 0; i < roomCount; i++) {
    const rw = randInt(rng, 4, 7);
    const rh = randInt(rng, 3, 6);
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

  const last = rooms[rooms.length - 1]!;
  const exitX = last.x + Math.floor(last.rw / 2);
  const exitY = last.y + Math.floor(last.rh / 2);
  tiles[exitY]![exitX] = "exit";

  for (let i = 0; i < 5; i++) {
    const tx = randInt(rng, 2, w - 3);
    const ty = randInt(rng, 2, h - 3);
    if (tiles[ty]![tx] !== "exit" && tiles[ty]![tx] !== "path") {
      if (rng() < 0.5) tiles[ty]![tx] = "water";
      else if (tiles[ty]![tx] !== "stone") tiles[ty]![tx] = "stone";
    }
  }

  const base = continent.palette;
  const palette: BiomePalette = {
    grass: shade(base.grass, 0.65),
    grassAlt: shade(base.grassAlt, 0.65),
    dirt: shade(base.dirt, 0.7),
    path: shade(base.path, 0.75),
    stone: shade(base.stone, 0.85),
    water: shade(base.water, 0.8),
    flower: shade(base.flower, 0.6),
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
    darkness: 0.35,
    gates: [],
    hollows: [],
    exit: { x: exitX, y: exitY },
    spawn: { x: spawnX, y: spawnY },
    returnTile,
  };
}
