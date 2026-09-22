import type { Biome, SettlementKind } from "./atlas";
import { placeFolk, type Npc } from "./life";
import { groundsFor, type ValeDungeon } from "./bestiary";

export const TILE = 48;
export const MAP_W = 128;
export const MAP_H = 128;

export const T_GRASS0 = 0;
export const T_WATER = 12;
export const T_SAND = 14;
export const T_FOREST = 15;

export type PropKind =
  | "fountain"
  | "tree"
  | "rock"
  | "house"
  | "cottage"
  | "hall"
  | "inn"
  | "mill"
  | "bank"
  | "chest"
  | "shop"
  | "stall"
  | "hides"
  | "magicshop"
  | "armory"
  | "fletcher"
  | "well"
  | "lantern"
  | "barrel"
  | "crate"
  | "drop"
  | "dock"
  | "portal"
  | "ruin"
  | "stairs"
  | "herb"
  | "bench"
  | "cairn"
  | "dummy"
  | "shieldpost"
  | "manafont";

export type WorldProp = {
  kind: PropKind;
  x: number;
  y: number;
  r: number;
  solid: boolean;
  taken?: boolean;
  label?: string;
  meta?: string;
  loot?: {
    id: string;
    item?: string;
    qty?: number;
    gold?: number;
    expires: number;
  };
};

export type World = {
  tiles: Uint8Array;
  blocked: Uint8Array;
  props: WorldProp[];
  townX: number;
  townY: number;
  townR: number;
  biome: Biome;
  kind: SettlementKind;
  underground?: boolean;
  floors?: { x: number; y: number }[];
  npcs?: Npc[];
  dungeon?: ValeDungeon;
};

export type WorldOpts = {
  biome?: Biome;
  kind?: SettlementKind;
  port?: boolean;
  portal?: boolean;
  shop?: boolean;
  name?: string;
  locationId?: string;
};

export function hash(x: number, y: number, s: number) {
  let n = x * 374761393 + y * 668265263 + s * 1274126177;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967296;
}

export function generateWorld(seed = 7, opts: WorldOpts = {}): World {
  const biome: Biome = opts.biome ?? "vale";
  const kind: SettlementKind = opts.kind ?? "city";
  const tiles = new Uint8Array(MAP_W * MAP_H);
  const blocked = new Uint8Array(MAP_W * MAP_H);
  const townX = (MAP_W / 2) * TILE;
  const townY = (MAP_H / 2) * TILE;
  const townR = (kind === "city" ? 12 : kind === "town" ? 9 : 7) * TILE;

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const i = y * MAP_W + x;
      const cx = (x + 0.5) * TILE;
      const cy = (y + 0.5) * TILE;
      const d = Math.hypot(cx - townX, cy - townY) / TILE;
      const h = hash(x, y, seed);
      if (d < (kind === "village" ? 6 : 10)) tiles[i] = 8 + ((h * 4) | 0);
      else if (d < (kind === "village" ? 8 : 13)) tiles[i] = 4 + ((h * 4) | 0);
      else if (biome === "wood" || (d > 26 && (biome === "vale" || biome === "marsh"))) tiles[i] = h > 0.42 ? T_FOREST : T_GRASS0 + ((h * 4) | 0);
      else if (biome === "waste" || biome === "coast") tiles[i] = h > 0.42 ? T_SAND : T_GRASS0 + ((h * 4) | 0);
      else if (biome === "ice") tiles[i] = h > 0.5 ? T_SAND : 8 + ((h * 3) | 0);
      else tiles[i] = T_GRASS0 + ((h * 4) | 0);

      const onPath =
        (Math.abs(x - MAP_W / 2) <= 1 && d > 9) || (Math.abs(y - MAP_H / 2) <= 1 && d > 9);
      if (onPath) tiles[i] = 4 + ((h * 4) | 0);
    }
  }

  const lakes = [
    { x: 28, y: 30, r: 7 },
    { x: 96, y: 40, r: 6 },
    { x: 36, y: 94, r: 8 },
    { x: 100, y: 98, r: 5 },
    { x: 18, y: 64, r: 5 },
  ];
  for (const L of lakes) {
    for (let y = L.y - L.r - 2; y <= L.y + L.r + 2; y++) {
      for (let x = L.x - L.r - 2; x <= L.x + L.r + 2; x++) {
        if (x < 1 || y < 1 || x >= MAP_W - 1 || y >= MAP_H - 1) continue;
        const d = Math.hypot(x - L.x, y - L.y);
        const i = y * MAP_W + x;
        if (d < L.r) {
          tiles[i] = T_WATER + (hash(x, y, seed + 3) > 0.5 ? 1 : 0);
          blocked[i] = 1;
        } else if (d < L.r + 1.6 && tiles[i] < 8) tiles[i] = T_SAND;
      }
    }
  }

  for (let x = 0; x < MAP_W; x++) {
    blocked[x] = 1;
    blocked[(MAP_H - 1) * MAP_W + x] = 1;
  }
  for (let y = 0; y < MAP_H; y++) {
    blocked[y * MAP_W] = 1;
    blocked[y * MAP_W + MAP_W - 1] = 1;
  }

  const props: WorldProp[] = [
    { kind: "fountain", x: townX, y: townY, r: 22, solid: false },
    { kind: "well", x: townX - 88, y: townY + 42, r: 16, solid: true },
  ];

  const benches: [number, number][] = [
    [-52, 8],
    [52, 10],
    [8, 52],
    [-10, -50],
  ];
  for (const [ox, oy] of benches) {
    props.push({ kind: "bench", x: townX + ox, y: townY + oy, r: 14, solid: false });
  }

  const lanterns: [number, number][] = [
    [-120, -40],
    [120, -36],
    [-118, 70],
    [122, 74],
    [0, -130],
    [0, 130],
    [-70, -110],
    [74, 118],
  ];
  for (const [ox, oy] of lanterns) {
    props.push({ kind: "lantern", x: townX + ox, y: townY + oy, r: 8, solid: false });
  }

  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2 + 0.35;
    const dist = townR - 28;
    props.push({
      kind: "tree",
      x: townX + Math.cos(ang) * dist,
      y: townY + Math.sin(ang) * dist,
      r: 18,
      solid: true,
    });
  }

  if (kind === "city") {
    props.push({ kind: "house", x: townX - 210, y: townY - 155, r: 38, solid: true });
    props.push({ kind: "cottage", x: townX + 205, y: townY - 145, r: 34, solid: true });
    props.push({ kind: "house", x: townX - 205, y: townY + 175, r: 38, solid: true });
    props.push({ kind: "cottage", x: townX + 215, y: townY + 165, r: 34, solid: true });
    props.push({ kind: "hall", x: townX - 95, y: townY - 210, r: 36, solid: true });
    props.push({ kind: "bank", x: townX - 40, y: townY + 205, r: 36, solid: true });
    props.push({ kind: "inn", x: townX + 90, y: townY - 205, r: 40, solid: true });
    props.push({ kind: "mill", x: townX + 230, y: townY + 40, r: 36, solid: true });
    props.push({ kind: "house", x: townX + 40, y: townY + 220, r: 36, solid: true });
  } else if (kind === "town") {
    props.push({ kind: "house", x: townX - 180, y: townY - 140, r: 36, solid: true });
    props.push({ kind: "cottage", x: townX + 190, y: townY - 130, r: 32, solid: true });
    props.push({ kind: "house", x: townX - 170, y: townY + 170, r: 36, solid: true });
    props.push({ kind: "cottage", x: townX + 180, y: townY + 160, r: 32, solid: true });
    props.push({ kind: "inn", x: townX + 20, y: townY - 190, r: 38, solid: true });
    props.push({ kind: "bank", x: townX - 20, y: townY + 185, r: 34, solid: true });
  } else {
    props.push({ kind: "cottage", x: townX - 140, y: townY - 110, r: 32, solid: true });
    props.push({ kind: "house", x: townX + 150, y: townY + 120, r: 34, solid: true });
    props.push({ kind: "bank", x: townX + 20, y: townY + 150, r: 30, solid: true });
  }

  if (kind === "city") {
    props.push({ kind: "hides", x: townX + 130, y: townY + 70, r: 32, solid: true, label: "Hides" });
    props.push({ kind: "magicshop", x: townX - 155, y: townY - 70, r: 34, solid: true, label: "The weave" });
    props.push({ kind: "armory", x: townX - 150, y: townY + 55, r: 36, solid: true, label: "Iron" });
    props.push({ kind: "fletcher", x: townX + 148, y: townY - 70, r: 34, solid: true, label: "Greenpath" });
    props.push({ kind: "barrel", x: townX + 100, y: townY + 88, r: 10, solid: false });
    props.push({ kind: "crate", x: townX + 108, y: townY + 52, r: 10, solid: false });
    props.push({ kind: "barrel", x: townX - 118, y: townY + 78, r: 10, solid: false });
    props.push({ kind: "dummy", x: townX - 58, y: townY - 158, r: 16, solid: true, label: "Post" });
    props.push({ kind: "shieldpost", x: townX - 22, y: townY - 158, r: 16, solid: true, label: "Shield" });
    props.push({ kind: "manafont", x: townX + 14, y: townY - 148, r: 18, solid: true, label: "Font" });
  } else if (kind === "town") {
    props.push({ kind: "hides", x: townX + 110, y: townY + 50, r: 28, solid: true, label: "Hides" });
    props.push({ kind: "armory", x: townX - 120, y: townY + 40, r: 30, solid: true, label: "Iron" });
    props.push({ kind: "dummy", x: townX - 50, y: townY - 140, r: 16, solid: true, label: "Post" });
    props.push({ kind: "shieldpost", x: townX - 16, y: townY - 140, r: 16, solid: true, label: "Shield" });
    props.push({ kind: "manafont", x: townX + 18, y: townY - 136, r: 16, solid: true, label: "Font" });
  } else if (opts.shop) {
    props.push({ kind: "hides", x: townX + 80, y: townY + 28, r: 24, solid: true, label: "Hides" });
  }
  if (opts.port) props.push({ kind: "dock", x: townX, y: townY + 210, r: 26, solid: false });
  if (opts.portal) props.push({ kind: "portal", x: townX - 110, y: townY - 40, r: 24, solid: false });
  props.push({ kind: "ruin", x: townX + 280, y: townY + 220, r: 22, solid: false });

  if (opts.locationId) {
    for (const g of groundsFor(opts.locationId)) {
      const cx = townX + g.ox * TILE;
      const cy = townY + g.oy * TILE;
      if (cx < 80 || cy < 80 || cx > MAP_W * TILE - 80 || cy > MAP_H * TILE - 80) continue;
      props.push({
        kind: "cairn",
        x: cx,
        y: cy,
        r: 18,
        solid: false,
        label: g.name,
        meta: g.id,
      });
    }
  }

  for (let i = 0; i < (kind === "village" ? 6 : 10); i++) {
    const ang = hash(i, 11, seed) * Math.PI * 2;
    const dist = (8 + hash(i, 12, seed) * 10) * TILE;
    const hx = townX + Math.cos(ang) * dist;
    const hy = townY + Math.sin(ang) * dist;
    if (Math.hypot(hx - townX, hy - townY) < 90) continue;
    props.push({ kind: "herb", x: hx, y: hy, r: 14, solid: false, taken: false });
  }

  for (let i = 0; i < 220; i++) {
    const x = 4 + hash(i, 1, seed) * (MAP_W - 8);
    const y = 4 + hash(i, 2, seed) * (MAP_H - 8);
    const wx = x * TILE;
    const wy = y * TILE;
    if (Math.hypot(wx - townX, wy - townY) < townR + 40) continue;
    const ti = (y | 0) * MAP_W + (x | 0);
    if (blocked[ti] || tiles[ti] === T_WATER) continue;
    if (hash(i, 9, seed) > 0.22) {
      props.push({ kind: "tree", x: wx, y: wy, r: 16, solid: true });
    } else {
      props.push({ kind: "rock", x: wx, y: wy, r: 12, solid: true });
    }
  }

  for (let i = 0; i < 14; i++) {
    const ang = hash(i, 4, seed) * Math.PI * 2;
    const dist = (18 + hash(i, 5, seed) * 40) * TILE;
    const wx = townX + Math.cos(ang) * dist;
    const wy = townY + Math.sin(ang) * dist;
    if (wx < 80 || wy < 80 || wx > MAP_W * TILE - 80 || wy > MAP_H * TILE - 80) continue;
    const tx = (wx / TILE) | 0;
    const ty = (wy / TILE) | 0;
    if (blocked[ty * MAP_W + tx]) continue;
    props.push({ kind: "chest", x: wx, y: wy, r: 14, solid: false, taken: false });
  }

  return {
    tiles,
    blocked,
    props,
    townX,
    townY,
    townR,
    biome,
    kind,
    npcs: placeFolk(seed, townX, townY, kind, opts.name ?? "the square", biome),
  };
}

export function tileAt(world: World, x: number, y: number) {
  const tx = Math.max(0, Math.min(MAP_W - 1, (x / TILE) | 0));
  const ty = Math.max(0, Math.min(MAP_H - 1, (y / TILE) | 0));
  return world.tiles[ty * MAP_W + tx];
}

export function blockedAt(world: World, x: number, y: number, extraR = 10) {
  const samples = [
    [x, y],
    [x - extraR, y],
    [x + extraR, y],
    [x, y - extraR],
    [x, y + extraR],
  ];
  for (const [sx, sy] of samples) {
    if (sx < TILE || sy < TILE || sx >= MAP_W * TILE - TILE || sy >= MAP_H * TILE - TILE) return true;
    const tx = (sx / TILE) | 0;
    const ty = (sy / TILE) | 0;
    if (world.blocked[ty * MAP_W + tx]) return true;
  }
  for (const p of world.props) {
    if (!p.solid || p.taken) continue;
    if (Math.hypot(x - p.x, y - p.y) < extraR + p.r * 0.4) return true;
  }
  return false;
}

export function tryMove(world: World, x: number, y: number, dx: number, dy: number, r: number) {
  const nx = x + dx;
  const ny = y + dy;
  if (!blockedAt(world, nx, ny, r)) return { x: nx, y: ny };
  if (!blockedAt(world, nx, y, r)) return { x: nx, y };
  if (!blockedAt(world, x, ny, r)) return { x, y: ny };
  return { x, y };
}

export function inTown(world: World, x: number, y: number) {
  return Math.hypot(x - world.townX, y - world.townY) < world.townR;
}
