/**
 * Thornreach professions lite — Gathering, Fishing, Crafting.
 * First Story / Accession texture only. Not a full crafting economy.
 */

import { TILE, type WorldMap } from "@/game/world/types";
import type { ContinentId } from "@/game/continents";
import type { ItemId } from "@/game/items";
import {
  levelFromXp,
  progressInLevel,
  xpToNext,
} from "@/game/xp";

export type ProfessionId = "gathering" | "fishing" | "crafting";

export interface ProfessionDef {
  id: ProfessionId;
  name: string;
  blurb: string;
}

export const PROFESSIONS: ProfessionDef[] = [
  {
    id: "gathering",
    name: "Gathering",
    blurb: "Briar-herb and ashwood scrap on the Thornreach skirts.",
  },
  {
    id: "fishing",
    name: "Fishing",
    blurb: "Basin minnows from the reed pond east of the square.",
  },
  {
    id: "crafting",
    name: "Crafting",
    blurb: "Bind two mats at Sera's kettle into ash-salve.",
  },
];

export const PROFESSION_IDS: ProfessionId[] = PROFESSIONS.map((p) => p.id);

export function emptyProfessionXp(): Record<ProfessionId, number> {
  return { gathering: 0, fishing: 0, crafting: 0 };
}

export function isProfessionId(v: unknown): v is ProfessionId {
  return typeof v === "string" && (PROFESSION_IDS as string[]).includes(v);
}

export function sanitizeProfessionXp(
  raw: unknown,
): Record<ProfessionId, number> {
  const base = emptyProfessionXp();
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;
  for (const id of PROFESSION_IDS) {
    const n = obj[id];
    if (typeof n === "number" && Number.isFinite(n) && n >= 0) {
      base[id] = Math.floor(n);
    }
  }
  return base;
}

export function professionSnapshot(xp: number) {
  const level = levelFromXp(xp);
  return {
    xp,
    level,
    progress: progressInLevel(level, xp),
    next: xpToNext(level),
  };
}

export function professionName(id: ProfessionId): string {
  return PROFESSIONS.find((p) => p.id === id)?.name ?? id;
}

export type ProfessionNodeKind = "herb" | "scrap" | "fish";

export interface ProfessionNode {
  id: string;
  kind: ProfessionNodeKind;
  name: string;
  continentId: ContinentId;
  x: number;
  y: number;
  itemId: ItemId;
  professionId: ProfessionId;
  /** Cubic-curve profession XP per successful pull. */
  xp: number;
  verb: "Gather" | "Fish";
}

/** Fixed Thornreach nodes — clear of plaza, hunt cairns, and watch cairns. */
export const THORNREACH_PROFESSION_NODES: ProfessionNode[] = [
  {
    id: "herb-watch-north",
    kind: "herb",
    name: "Briar Herb",
    continentId: "thornreach",
    x: 21,
    y: 13,
    itemId: "briar-herb",
    professionId: "gathering",
    xp: 22,
    verb: "Gather",
  },
  {
    id: "herb-store-north",
    kind: "herb",
    name: "Briar Herb",
    continentId: "thornreach",
    x: 30,
    y: 12,
    itemId: "briar-herb",
    professionId: "gathering",
    xp: 22,
    verb: "Gather",
  },
  {
    id: "scrap-west-skirt",
    kind: "scrap",
    name: "Ashwood Scrap",
    continentId: "thornreach",
    x: 18,
    y: 18,
    itemId: "ashwood-scrap",
    professionId: "gathering",
    xp: 22,
    verb: "Gather",
  },
  {
    id: "scrap-south-cobble",
    kind: "scrap",
    name: "Ashwood Scrap",
    continentId: "thornreach",
    x: 28,
    y: 24,
    itemId: "ashwood-scrap",
    professionId: "gathering",
    xp: 22,
    verb: "Gather",
  },
  {
    id: "fish-reed-west",
    kind: "fish",
    name: "Reed Pond",
    continentId: "thornreach",
    x: 32,
    y: 24,
    itemId: "basin-minnow",
    professionId: "fishing",
    xp: 20,
    verb: "Fish",
  },
  {
    id: "fish-reed-east",
    kind: "fish",
    name: "Reed Pond",
    continentId: "thornreach",
    x: 34,
    y: 25,
    itemId: "basin-minnow",
    professionId: "fishing",
    xp: 20,
    verb: "Fish",
  },
];

export function professionNodesOnContinent(id: ContinentId): ProfessionNode[] {
  return THORNREACH_PROFESSION_NODES.filter((n) => n.continentId === id);
}

export function getProfessionNode(id: string): ProfessionNode | undefined {
  return THORNREACH_PROFESSION_NODES.find((n) => n.id === id);
}

/** Session-only respawn clock — nodes refresh while you walk the square. */
export const NODE_RESPAWN_MS = 40_000;

const nodeUsedAt = new Map<string, number>();

export function isNodeReady(id: string, now = Date.now()): boolean {
  const used = nodeUsedAt.get(id);
  return used == null || now - used >= NODE_RESPAWN_MS;
}

export function markNodeUsed(id: string, now = Date.now()): void {
  nodeUsedAt.set(id, now);
}

export function nodeReadyInMs(id: string, now = Date.now()): number {
  const used = nodeUsedAt.get(id);
  if (used == null) return 0;
  return Math.max(0, NODE_RESPAWN_MS - (now - used));
}

export interface CraftIngredient {
  itemId: ItemId;
  qty: number;
}

export interface CraftRecipe {
  id: string;
  name: string;
  blurb: string;
  ingredients: CraftIngredient[];
  resultId: ItemId;
  resultQty: number;
  xp: number;
}

export const CRAFT_RECIPES: CraftRecipe[] = [
  {
    id: "ash-salve",
    name: "Ash-Salve",
    blurb: "Briar-herb and ashwood scrap, bound at the kettle.",
    ingredients: [
      { itemId: "briar-herb", qty: 1 },
      { itemId: "ashwood-scrap", qty: 1 },
    ],
    resultId: "ash-salve",
    resultQty: 1,
    /** Crafting beat vs gather 22 / fish 20 — kettle is the skill bump, not the mats. */
    xp: 36,
  },
];

export function getCraftRecipe(id: string): CraftRecipe | undefined {
  return CRAFT_RECIPES.find((r) => r.id === id);
}

/** Small reed pond east of Thornhearth — walkable banks stay dirt/grass. */
const REED_POND: { x: number; y: number }[] = [
  { x: 33, y: 24 },
  { x: 34, y: 24 },
  { x: 33, y: 25 },
];

export function stampProfessionSpots(map: WorldMap): void {
  if (map.kind !== "overworld" || map.continentId !== "thornreach") return;
  for (const p of REED_POND) {
    if (p.x <= 0 || p.y <= 0 || p.x >= map.width - 1 || p.y >= map.height - 1) {
      continue;
    }
    const t = map.tiles[p.y]![p.x]!;
    if (t === "gate" || t === "hollow" || t === "exit" || t === "wall" || t === "door") {
      continue;
    }
    map.tiles[p.y]![p.x] = "water";
  }
  for (const n of professionNodesOnContinent(map.continentId)) {
    if (n.x <= 0 || n.y <= 0 || n.x >= map.width - 1 || n.y >= map.height - 1) {
      continue;
    }
    const t = map.tiles[n.y]![n.x]!;
    if (t === "gate" || t === "hollow" || t === "exit" || t === "wall") {
      continue;
    }
    if (n.kind === "herb") {
      if (t === "grass" || t === "grassAlt" || t === "dirt" || t === "cobble") {
        map.tiles[n.y]![n.x] = "flower";
      }
    } else if (n.kind === "scrap") {
      if (t === "grass" || t === "grassAlt" || t === "path") {
        map.tiles[n.y]![n.x] = "dirt";
      }
    } else if (n.kind === "fish") {
      if (t === "water" || t === "stone") {
        map.tiles[n.y]![n.x] = "dirt";
      }
    }
  }
}

export function drawProfessionNodes(
  ctx: CanvasRenderingContext2D,
  nodes: ProfessionNode[],
  originX: number,
  originY: number,
): void {
  for (const n of nodes) {
    const sx = Math.floor(n.x * TILE - originX);
    const sy = Math.floor(n.y * TILE - originY);
    const ready = isNodeReady(n.id);
    ctx.save();
    ctx.globalAlpha = ready ? 1 : 0.38;
    if (n.kind === "herb") {
      ctx.fillStyle = "#1a2a14";
      ctx.fillRect(sx + 6, sy + 18, 20, 8);
      ctx.fillStyle = "#3a5a28";
      ctx.fillRect(sx + 8, sy + 16, 16, 8);
      ctx.fillStyle = "#6ab84a";
      ctx.beginPath();
      ctx.moveTo(sx + 16, sy + 4);
      ctx.lineTo(sx + 8, sy + 20);
      ctx.lineTo(sx + 24, sy + 20);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(sx + 16, sy + 8, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (n.kind === "scrap") {
      ctx.fillStyle = "#2a2014";
      ctx.fillRect(sx + 5, sy + 16, 22, 10);
      ctx.fillStyle = "#4a3a28";
      ctx.fillRect(sx + 7, sy + 14, 18, 8);
      ctx.fillStyle = "#8a6a3a";
      ctx.fillRect(sx + 9, sy + 10, 14, 8);
      ctx.fillStyle = "#c4c8c4";
      ctx.fillRect(sx + 11, sy + 8, 10, 4);
    } else {
      ctx.fillStyle = "#1a2a28";
      ctx.fillRect(sx + 6, sy + 14, 20, 12);
      ctx.fillStyle = "#3a5a4a";
      ctx.fillRect(sx + 8, sy + 16, 16, 10);
      ctx.fillStyle = "#5a8aaa";
      ctx.beginPath();
      ctx.ellipse(sx + 16, sy + 18, 9, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#7ab8c9";
      ctx.fillRect(sx + 21, sy + 6, 3, 12);
    }
    ctx.restore();
  }
}
