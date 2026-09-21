/** Thornreach hunting grounds — cairns, rec-level labels, per-area spawn tables. */

import { TILE, clearArea, type WorldMap } from "@/game/world/types";
import type { ContinentId } from "@/game/continents";
import { drawSoftShadow } from "@/game/gfx/canvasUtil";

export type HuntPreyId =
  | "briar-mite"
  | "needle-rat"
  | "bark-hound"
  | "ash-vole"
  | "gorse-fox";

export type HuntSpawnEntry = {
  kind: HuntPreyId;
  count: number;
};

export type HuntZone = {
  id: string;
  name: string;
  /** Tibia-style recommended level band, e.g. "Rec. 2–4". */
  recLabel: string;
  recMin: number;
  recMax: number;
  continentId: ContinentId;
  /** Packed-earth cairn tile (zone landmark). */
  cairn: { x: number; y: number };
  /** Spawn disk radius from the cairn, in tiles. */
  radius: number;
  table: HuntSpawnEntry[];
  /** Primary prey named on the wayfinding sub-label. */
  preyHint: string;
  labelColor: string;
};

/** Plaza fountain stays clear of fauna (tiles from spawn). */
export const HUNT_PLAZA_CLEAR_TILES = 7;

export const THORNREACH_HUNT_ZONES: HuntZone[] = [
  {
    id: "ashwood-edge",
    name: "Ashwood Edge",
    recLabel: "Rec. 2–4",
    recMin: 2,
    recMax: 4,
    continentId: "thornreach",
    cairn: { x: 12, y: 16 },
    radius: 7,
    table: [
      { kind: "needle-rat", count: 4 },
      { kind: "ash-vole", count: 2 },
      { kind: "briar-mite", count: 1 },
    ],
    preyHint: "Needle Rat",
    labelColor: "#c9a227",
  },
  {
    id: "north-ashwood",
    name: "North Ashwood",
    recLabel: "Rec. 3–5",
    recMin: 3,
    recMax: 5,
    continentId: "thornreach",
    cairn: { x: 24, y: 8 },
    radius: 6,
    table: [
      { kind: "bark-hound", count: 2 },
      { kind: "needle-rat", count: 2 },
      { kind: "gorse-fox", count: 1 },
    ],
    preyHint: "Bark Hound",
    labelColor: "#d4a060",
  },
  {
    id: "east-basin",
    name: "East Basin",
    recLabel: "Rec. 1–3",
    recMin: 1,
    recMax: 3,
    continentId: "thornreach",
    cairn: { x: 36, y: 20 },
    radius: 7,
    table: [
      { kind: "ash-vole", count: 3 },
      { kind: "needle-rat", count: 3 },
      { kind: "briar-mite", count: 1 },
    ],
    preyHint: "Ash-vole",
    labelColor: "#9aaa70",
  },
  {
    id: "south-skirt",
    name: "South Skirt",
    recLabel: "Rec. 3–5",
    recMin: 3,
    recMax: 5,
    continentId: "thornreach",
    cairn: { x: 24, y: 28 },
    radius: 6,
    table: [
      { kind: "gorse-fox", count: 2 },
      { kind: "bark-hound", count: 1 },
      { kind: "needle-rat", count: 1 },
    ],
    preyHint: "Gorse Fox",
    labelColor: "#c97a4a",
  },
];

export function huntZonesFor(continentId: ContinentId): HuntZone[] {
  return continentId === "thornreach" ? THORNREACH_HUNT_ZONES : [];
}

export function huntZoneById(id: string): HuntZone | undefined {
  return THORNREACH_HUNT_ZONES.find((z) => z.id === id);
}

/** Closest hunt zone whose disk contains the tile (Thornreach overworld). */
export function huntZoneAt(
  continentId: ContinentId,
  tx: number,
  ty: number,
): HuntZone | null {
  if (continentId !== "thornreach") return null;
  let best: HuntZone | null = null;
  let bestD = Infinity;
  for (const z of THORNREACH_HUNT_ZONES) {
    const d = Math.hypot(tx - z.cairn.x, ty - z.cairn.y);
    if (d <= z.radius && d < bestD) {
      best = z;
      bestD = d;
    }
  }
  return best;
}

/** Wayfinding title: "Ashwood Edge · Rec. 2–4". */
export function huntZoneWayfindLabel(zone: HuntZone): string {
  return `${zone.name} · ${zone.recLabel}`;
}

/** Compact spawn-table line from unique kinds in the zone. */
export function huntZoneTableLabel(zone: HuntZone): string {
  const names: Record<HuntPreyId, string> = {
    "briar-mite": "Briar Mite",
    "needle-rat": "Needle Rat",
    "bark-hound": "Bark Hound",
    "ash-vole": "Ash-vole",
    "gorse-fox": "Gorse Fox",
  };
  const seen = new Set<HuntPreyId>();
  const parts: string[] = [];
  for (const entry of zone.table) {
    if (seen.has(entry.kind)) continue;
    seen.add(entry.kind);
    parts.push(names[entry.kind]);
  }
  return parts.join(" · ");
}

/**
 * Pack dirt/path under each cairn so the marker is never boxed by water/stone.
 * Skips tiles already claimed by gates / hollows / spawn plaza.
 */
export function stampHuntCairnTiles(map: WorldMap): void {
  if (map.kind !== "overworld") return;
  const zones = huntZonesFor(map.continentId);
  if (zones.length === 0) return;
  const w = map.width;
  const h = map.height;
  const spawn = map.spawn;
  for (const z of zones) {
    const cx = Math.max(2, Math.min(w - 3, z.cairn.x));
    const cy = Math.max(2, Math.min(h - 3, z.cairn.y));
    const tile = map.tiles[cy]![cx]!;
    if (tile === "gate" || tile === "hollow" || tile === "exit") continue;
    if (Math.hypot(cx - spawn.x, cy - spawn.y) < 4) continue;
    clearArea(map.tiles, cx, cy, 1, "dirt", w, h);
    map.tiles[cy]![cx] = "path";
  }
}

/** Stacked-stone cairn at each hunt-ground center. */
export function drawHuntCairns(
  ctx: CanvasRenderingContext2D,
  continentId: ContinentId,
  originX: number,
  originY: number,
): void {
  for (const z of huntZonesFor(continentId)) {
    const sx = Math.floor((z.cairn.x + 0.5) * TILE - originX);
    const sy = Math.floor((z.cairn.y + 0.5) * TILE - originY);
    drawSoftShadow(ctx, sx, sy + 6, 12, 5, 0.35);
    ctx.fillStyle = "#5a564c";
    ctx.beginPath();
    ctx.ellipse(sx, sy + 5, 11, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a3830";
    ctx.beginPath();
    ctx.ellipse(sx - 5, sy + 3, 6, 5, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(sx + 6, sy + 2, 5, 4, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8a8680";
    ctx.beginPath();
    ctx.ellipse(sx - 1, sy - 2, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c9c4b8";
    ctx.beginPath();
    ctx.ellipse(sx + 1, sy - 6, 4, 3.5, 0.1, 0, Math.PI * 2);
    ctx.fill();
    // Pale chalk mark — rec-level "bone" on the top stone.
    ctx.strokeStyle = z.labelColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx - 3, sy - 7);
    ctx.lineTo(sx + 3, sy - 5);
    ctx.stroke();
  }
}
