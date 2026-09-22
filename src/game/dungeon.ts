import { dungeonFor, THEME_LIGHT, type DungeonTheme, type ValeDungeon } from "./bestiary";
import { MAP_H, MAP_W, TILE, T_FOREST, type World, type WorldProp } from "./world";
import { randInt, rngFrom, type Rng } from "./rng";

type Room = { x: number; y: number; w: number; h: number };

function wallTile(theme: DungeonTheme) {
  if (theme === "root") return T_FOREST;
  if (theme === "ash" || theme === "mine") return 15;
  if (theme === "tide") return 12;
  if (theme === "glass") return 14;
  return T_FOREST;
}

function overlaps(a: Room, b: Room, pad = 2) {
  return !(a.x + a.w + pad <= b.x || b.x + b.w + pad <= a.x || a.y + a.h + pad <= b.y || b.y + b.h + pad <= a.y);
}

function center(r: Room) {
  return { x: (r.x + (r.w / 2) | 0), y: (r.y + (r.h / 2) | 0) };
}

function carveRoom(tiles: Uint8Array, blocked: Uint8Array, r: Room, rng: Rng, floor0: number) {
  for (let y = r.y; y < r.y + r.h; y++) {
    for (let x = r.x; x < r.x + r.w; x++) {
      const i = y * MAP_W + x;
      tiles[i] = floor0 + ((rng() * 4) | 0);
      blocked[i] = 0;
    }
  }
}

function carveHall(tiles: Uint8Array, blocked: Uint8Array, x0: number, y0: number, x1: number, y1: number, rng: Rng, floor0: number) {
  const wide = 1;
  const paint = (x: number, y: number) => {
    for (let dy = -wide; dy <= wide; dy++) {
      for (let dx = -wide; dx <= 0; dx++) {
        const xx = x + dx;
        const yy = y + dy;
        if (xx < 2 || yy < 2 || xx >= MAP_W - 2 || yy >= MAP_H - 2) continue;
        const i = yy * MAP_W + xx;
        tiles[i] = floor0 + ((rng() * 3) | 0);
        blocked[i] = 0;
      }
    }
  };
  if (rng() < 0.5) {
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) paint(x, y0);
    for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) paint(x1, y);
  } else {
    for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) paint(x0, y);
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) paint(x, y1);
  }
}

function flood(blocked: Uint8Array, sx: number, sy: number): Uint8Array {
  const seen = new Uint8Array(MAP_W * MAP_H);
  const q = [sy * MAP_W + sx];
  seen[q[0]!] = 1;
  for (let i = 0; i < q.length; i++) {
    const p = q[i]!;
    const x = p % MAP_W;
    const y = (p / MAP_W) | 0;
    const n = [p - 1, p + 1, p - MAP_W, p + MAP_W];
    for (const j of n) {
      if (j < 0 || j >= seen.length || seen[j]) continue;
      const nx = j % MAP_W;
      if (Math.abs(nx - x) + Math.abs(((j / MAP_W) | 0) - y) !== 1) continue;
      if (blocked[j]) continue;
      seen[j] = 1;
      q.push(j);
    }
  }
  return seen;
}

function placeRooms(rng: Rng, theme: DungeonTheme): Room[] {
  const rooms: Room[] = [];
  const want = theme === "mine" ? randInt(rng, 11, 16) : randInt(rng, 9, 14);
  for (let t = 0; t < 90 && rooms.length < want; t++) {
    const w = randInt(rng, 6, theme === "barrow" ? 14 : 12);
    const h = randInt(rng, 5, theme === "barrow" ? 12 : 10);
    const r: Room = {
      x: randInt(rng, 6, MAP_W - w - 7),
      y: randInt(rng, 6, MAP_H - h - 7),
      w,
      h,
    };
    if (rooms.some((o) => overlaps(r, o))) continue;
    rooms.push(r);
  }
  return rooms;
}

/** Rooms + L-corridors, MST-connected, extra loops, flood-fill check. Same seed → same crypt. */
export function generateDungeon(seed: number, locationId = "thornvale-thornhearth"): World {
  const spec = dungeonFor(locationId);
  const rngBase = rngFrom(seed ^ 0xd06e0 ^ spec.theme.length * 9176);
  for (let attempt = 0; attempt < 8; attempt++) {
    const world = tryDungeon(rngFrom((seed ^ 0xd06e0) + attempt * 9973), spec, false);
    if (world) return world;
  }
  return tryDungeon(rngBase, spec, true)!;
}

function tryDungeon(rng: Rng, spec: ValeDungeon, force = false): World | null {
  const tiles = new Uint8Array(MAP_W * MAP_H);
  const blocked = new Uint8Array(MAP_W * MAP_H);
  const wall = wallTile(spec.theme);
  const floor0 = THEME_LIGHT[spec.theme].floor;
  tiles.fill(wall);
  blocked.fill(1);

  const rooms = placeRooms(rng, spec.theme);
  if (rooms.length < 6 && !force) return null;
  for (const r of rooms) carveRoom(tiles, blocked, r, rng, floor0);

  const order = rooms.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = order[i]!;
    order[i] = order[j]!;
    order[j] = t;
  }
  for (let i = 1; i < order.length; i++) {
    const a = center(rooms[order[i]!]!);
    const b = center(rooms[order[i - 1]!]!);
    carveHall(tiles, blocked, a.x, a.y, b.x, b.y, rng, floor0);
  }
  const extra = Math.min(3, (rooms.length / 4) | 0);
  for (let i = 0; i < extra; i++) {
    const a = center(rooms[randInt(rng, 0, rooms.length - 1)]!);
    const b = center(rooms[randInt(rng, 0, rooms.length - 1)]!);
    carveHall(tiles, blocked, a.x, a.y, b.x, b.y, rng, floor0);
  }

  const start = rooms[0]!;
  const sc = center(start);
  const reach = flood(blocked, sc.x, sc.y);
  for (const r of rooms) {
    const c = center(r);
    if (!reach[c.y * MAP_W + c.x] && !force) return null;
  }

  let far = start;
  let farD = 0;
  for (const r of rooms) {
    const c = center(r);
    const d = Math.hypot(c.x - sc.x, c.y - sc.y);
    if (d > farD) {
      far = r;
      farD = d;
    }
  }

  const sx = (sc.x + 0.5) * TILE;
  const sy = (sc.y + 0.5) * TILE;
  const fc = center(far);
  const props: WorldProp[] = [
    { kind: "stairs", x: sx, y: sy, r: 20, solid: false, label: spec.name },
    {
      kind: "cairn",
      x: (fc.x + 0.5) * TILE,
      y: (fc.y + 0.5) * TILE,
      r: 18,
      solid: false,
      label: spec.boss.name,
      meta: spec.boss.kind,
    },
  ];

  for (let i = 1; i < rooms.length; i++) {
    if (rng() > 0.45 && rooms[i] !== far) continue;
    const c = center(rooms[i]!);
    if (!reach[c.y * MAP_W + c.x]) continue;
    props.push({
      kind: "chest",
      x: (c.x + 0.5) * TILE + (rng() - 0.5) * 24,
      y: (c.y + 0.5) * TILE + (rng() - 0.5) * 24,
      r: 14,
      solid: false,
      taken: false,
    });
  }

  const floors: { x: number; y: number }[] = [];
  for (let y = 2; y < MAP_H - 2; y += 2) {
    for (let x = 2; x < MAP_W - 2; x += 2) {
      if (!blocked[y * MAP_W + x]) floors.push({ x: (x + 0.5) * TILE, y: (y + 0.5) * TILE });
    }
  }

  return {
    tiles,
    blocked,
    props,
    townX: sx,
    townY: sy,
    townR: 3.2 * TILE,
    biome: "vale",
    kind: "village",
    underground: true,
    floors,
    dungeon: spec,
  };
}
