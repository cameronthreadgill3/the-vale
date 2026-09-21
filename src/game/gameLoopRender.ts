/** Camera advance + world/player/HUD render for the game loop. */
import { TILE, type WorldMap } from "@/game/world";
import { type HudState, type PromptState } from "@/game/canvasConstants";
import { levelFromXp, progressInLevel, xpToNext } from "@/game/xp";
import { maxHpFor, maxManaFor } from "@/game/combat";
import { getClass } from "@/game/classes";
import {
  drawShipDocks,
  drawShopMarkers,
  drawNamedFolk,
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
import { WALK_FPS } from "@/game/playerSprites";
import { drawTile } from "@/game/gfx/drawTile";
import {
  resolveQuestObjective,
  tilesAway,
  drawObjectivePointer,
  drawCompass,
  drawRadar,
  collectRadarDots,
  drawWorldWayfindLabels,
} from "@/game/wayfinding";

/** Position-delta walk state (avoids patching assembled gameLoop). */
let _lastPx = 0;
let _lastPy = 0;
let _facing: Facing = "south";
let _walkPhase = 0;
let _moving = false;

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
    setHud, setPrompt, promptRef,
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
  ctx.imageSmoothingEnabled = false;
  for (let ty = startTY; ty <= endTY; ty++) {
    for (let tx = startTX; tx <= endTX; tx++) {
      const kind = map.tiles[ty]![tx]!;
      const sx = Math.floor(tx * TILE - originX);
      const sy = Math.floor(ty * TILE - originY);
      drawTile(ctx, kind, pal, sx, sy, tx, ty);
    }
  }
  if (map.darkness > 0) {
    const pxLight = Math.floor(player.x - originX);
    const pyLight = Math.floor(player.y - originY);
    const g = ctx.createRadialGradient(pxLight, pyLight, 28, pxLight, pyLight, 220);
    g.addColorStop(0, "rgba(0,0,0," + Math.max(0, map.darkness * 0.15) + ")");
    g.addColorStop(0.45, "rgba(0,0,0," + (map.darkness * 0.55) + ")");
    g.addColorStop(1, "rgba(0,0,0," + Math.min(0.55, map.darkness + 0.22) + ")");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, viewW, viewH);
  }
  drawShipDocks(ctx, docks, originX, originY);
  drawShopMarkers(ctx, shops, folk, originX, originY);
  drawNamedFolk(ctx, folk, originX, originY, player);
  drawWorldWayfindLabels(ctx, map, docks, player, originX, originY);
  mouse.worldX = originX + mouse.x;
  mouse.worldY = originY + mouse.y;
  drawEnemies(ctx, enemies, originX, originY);
  drawProjectiles(ctx, projectiles, originX, originY);
  const px = Math.floor(player.x - originX);
  const py = Math.floor(player.y - originY);
  const dx = player.x - _lastPx;
  const dy = player.y - _lastPy;
  const dist = Math.hypot(dx, dy);
  if (dist > 0.4) {
    _moving = true;
    if (Math.abs(dx) >= Math.abs(dy)) _facing = dx < 0 ? "west" : "east";
    else _facing = dy < 0 ? "north" : "south";
    _walkPhase += dt * WALK_FPS;
  } else {
    _moving = false;
    _walkPhase = 0;
  }
  _lastPx = player.x;
  _lastPy = player.y;
  const walkFrame = _moving ? (Math.floor(_walkPhase) % 4) : 0;
  drawPlayer(ctx, character, px, py, _facing, walkFrame, playerFlash, accent);
  drawFloatTexts(ctx, floatTexts, originX, originY);

  const objective = resolveQuestObjective(player, enemies, folk, map);
  const radarDots = collectRadarDots(player, enemies, folk, docks, map, objective);
  drawCompass(ctx, viewW);
  drawRadar(ctx, viewW, player, radarDots);
  if (objective) {
    const osx = Math.floor(objective.x - originX);
    const osy = Math.floor(objective.y - originY);
    drawObjectivePointer(ctx, viewW, viewH, px, py, osx, osy);
  }

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
      objectiveLabel: objective ? objective.label : null,
      objectiveDist: objective ? tilesAway(player, objective) : null,
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
