/** Camera advance + world/player/HUD render for the game loop. */
import { TILE, type WorldMap } from "@/game/world";
import { type HudState, type PromptState } from "@/game/canvasConstants";
import { levelFromXp, progressInLevel, xpToNext } from "@/game/xp";
import { maxHpFor, maxManaFor } from "@/game/combat";
import { getClass } from "@/game/classes";
import { getContinent } from "@/game/continents";
import {
  drawShipDocks,
  drawShopMarkers,
  drawNamedFolk,
  drawFloatingLabel,
} from "@/game/folkCanvas";
import {
  drawEnemies,
  drawFloatTexts,
  drawProjectiles,
  type Enemy,
  type FloatText,
  type Projectile,
} from "@/game/enemies";
import type { ValeCharacter } from "@/game/character";
import type { FolkDef, ShopDef, ShipDock } from "@/game/folk";
import { computePrompt } from "@/game/gameLoopFrame";
import { drawPlayer } from "@/game/renderPlayer";
import type { Facing } from "@/game/playerSprites";

export function advanceCameraAndRender(args: {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  map: WorldMap;
  player: { x: number; y: number };
  camX: number;
  camY: number;
  dt: number;
  enemies: Enemy[];
  floatTexts: FloatText[];
  projectiles: Projectile[];
  docks: ShipDock[];
  folk: FolkDef[];
  shops: ShopDef[];
  mouse: { x: number; y: number; worldX: number; worldY: number };
  playerFlash: number;
  accent: { accent: string; accentLite: string; accentDark: string };
  character: ValeCharacter;
  paused: boolean;
  facing?: Facing;
  walkFrame?: number;
  setHud: (h: HudState) => void;
  setPrompt: (p: PromptState) => void;
  promptRef: { current: PromptState };
  hudAccum: number;
  promptAccum: number;
}): { camX: number; camY: number; hudAccum: number; promptAccum: number } {
  let { camX, camY, hudAccum, promptAccum } = args;
  const {
    ctx, canvas, map, player, dt, enemies, floatTexts, projectiles,
    docks, folk, shops, mouse, playerFlash, accent, character, paused,
    facing = "south", walkFrame = 0, setHud, setPrompt, promptRef,
  } = args;

  camX += (player.x - camX) * Math.min(1, 8 * dt);
  camY += (player.y - camY) * Math.min(1, 8 * dt);
  const viewW = canvas.clientWidth;
  const viewH = canvas.clientHeight;
  const originX = camX - viewW / 2;
  const originY = camY - viewH / 2;
  ctx.fillStyle = "#0c0d0b";
  ctx.fillRect(0, 0, viewW, viewH);
  const startTX = Math.max(0, Math.floor(originX / TILE) - 1);
  const startTY = Math.max(0, Math.floor(originY / TILE) - 1);
  const endTX = Math.min(map.width - 1, Math.ceil((originX + viewW) / TILE) + 1);
  const endTY = Math.min(map.height - 1, Math.ceil((originY + viewH) / TILE) + 1);
  const pal = map.palette;
  for (let ty = startTY; ty <= endTY; ty++) {
    for (let tx = startTX; tx <= endTX; tx++) {
      const kind = map.tiles[ty]![tx]!;
      ctx.fillStyle = pal[kind];
      const sx = Math.floor(tx * TILE - originX);
      const sy = Math.floor(ty * TILE - originY);
      ctx.fillRect(sx, sy, TILE + 1, TILE + 1);
      if (kind === "grass" || kind === "grassAlt") {
        ctx.fillStyle = "rgba(0,0,0,0.08)";
        ctx.fillRect(sx, sy, TILE + 1, 1);
        ctx.fillRect(sx, sy, 1, TILE + 1);
      }
      if (kind === "gate") {
        ctx.strokeStyle = "#e8e6d9";
        ctx.lineWidth = 3;
        ctx.strokeRect(sx + 2, sy + 2, TILE - 4, TILE - 4);
        ctx.fillStyle = "rgba(255,255,255,0.22)";
        ctx.fillRect(sx + 6, sy + 6, TILE - 12, TILE - 12);
        ctx.fillStyle = pal.gate;
        ctx.fillRect(sx + TILE / 2 - 3, sy + 4, 6, TILE - 8);
      } else if (kind === "hollow") {
        ctx.beginPath();
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.arc(sx + TILE / 2, sy + TILE / 2, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pal.hollow;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = "#e8e6d9";
        ctx.lineWidth = 1.5;
        ctx.arc(sx + TILE / 2, sy + TILE / 2, 5, 0, Math.PI * 2);
        ctx.stroke();
      } else if (kind === "exit") {
        ctx.strokeStyle = "#e8e6d9";
        ctx.lineWidth = 3;
        ctx.strokeRect(sx + 4, sy + 4, TILE - 8, TILE - 8);
        ctx.fillStyle = "rgba(200,180,100,0.4)";
        ctx.fillRect(sx + 8, sy + 8, TILE - 16, TILE - 16);
        ctx.strokeStyle = pal.exit;
        ctx.lineWidth = 2;
        ctx.strokeRect(sx + 8, sy + 8, TILE - 16, TILE - 16);
      }
    }
  }
  if (map.darkness > 0) {
    const pxLight = Math.floor(player.x - originX);
    const pyLight = Math.floor(player.y - originY);
    const g = ctx.createRadialGradient(pxLight, pyLight, 28, pxLight, pyLight, 220);
    g.addColorStop(0, "rgba(0,0,0," + Math.max(0, map.darkness * 0.15) + ")");
    g.addColorStop(0.45, "rgba(0,0,0," + map.darkness * 0.55 + ")");
    g.addColorStop(1, "rgba(0,0,0," + Math.min(0.55, map.darkness + 0.22) + ")");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, viewW, viewH);
  }
  drawShipDocks(ctx, docks, originX, originY);
  drawShopMarkers(ctx, shops, folk, originX, originY);
  drawNamedFolk(ctx, folk, originX, originY, player);
  if (map.kind === "overworld") {
    const ptx = player.x / TILE;
    const pty = player.y / TILE;
    for (const g of map.gates) {
      if (Math.hypot(ptx - (g.x + 0.5), pty - (g.y + 0.5)) > 5.5) continue;
      const gx = Math.floor((g.x + 0.5) * TILE - originX);
      const gy = Math.floor((g.y + 0.5) * TILE - originY);
      drawFloatingLabel(ctx, gx, gy - 10, getContinent(g.targetContinentId).name, "#c9a227");
    }
    for (const h of map.hollows) {
      if (Math.hypot(ptx - (h.x + 0.5), pty - (h.y + 0.5)) > 5.5) continue;
      const hx = Math.floor((h.x + 0.5) * TILE - originX);
      const hy = Math.floor((h.y + 0.5) * TILE - originY);
      drawFloatingLabel(ctx, hx, hy - 10, "Hollow " + (h.index + 1), "#b89ad4");
    }
  } else if (map.exit) {
    const ptx = player.x / TILE;
    const pty = player.y / TILE;
    for (let ty = 0; ty < map.height; ty++) {
      for (let tx = 0; tx < map.width; tx++) {
        if (map.tiles[ty]![tx] !== "exit") continue;
        if (Math.hypot(ptx - (tx + 0.5), pty - (ty + 0.5)) > 5.5) continue;
        const ex = Math.floor((tx + 0.5) * TILE - originX);
        const ey = Math.floor((ty + 0.5) * TILE - originY);
        drawFloatingLabel(ctx, ex, ey - 10, "Exit hollow", "#c9a227");
      }
    }
  }
  mouse.worldX = originX + mouse.x;
  mouse.worldY = originY + mouse.y;
  drawEnemies(ctx, enemies, originX, originY);
  drawProjectiles(ctx, projectiles, originX, originY);
  const px = Math.floor(player.x - originX);
  const py = Math.floor(player.y - originY);
  drawPlayer(ctx, character, px, py, facing, walkFrame, playerFlash, accent);
  drawFloatTexts(ctx, floatTexts, originX, originY);

  hudAccum += dt;
  if (hudAccum >= 0.2) {
    hudAccum = 0;
    const cls = getClass(character.classId);
    const xp = character.combatXp;
    const combatLevel = levelFromXp(xp);
    setHud({
      x: Math.round(player.x / TILE),
      y: Math.round(player.y / TILE),
      level: combatLevel,
      xp,
      progress: progressInLevel(combatLevel, xp),
      next: xpToNext(combatLevel),
      hp: character.hp,
      maxHp: maxHpFor(character),
      mana: character.mana,
      maxMana: maxManaFor(character, cls),
    });
  }
  promptAccum += dt;
  if (promptAccum >= 0.15) {
    promptAccum = 0;
    const next = paused ? null : computePrompt(map, player, docks, folk, shops);
    promptRef.current = next;
    setPrompt(next);
  }
  return { camX, camY, hudAccum, promptAccum };
}
