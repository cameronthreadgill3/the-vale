/** Camera advance + world/player/HUD render for the game loop. */
import { TILE, type WorldMap } from "@/game/world";
import { type HudState, type PromptState } from "@/game/canvasConstants";
import { levelFromXp, progressInLevel, xpToNext } from "@/game/xp";
import { maxHpFor, maxManaFor } from "@/game/combat";
import { carriedWeight, maxSlotsFor, maxWeightFor } from "@/game/backpack";
import { isInSafeZone, isSafeContinent, SAFE_ZONE_RADIUS_TILES } from "@/game/safeZone";
import { getClass } from "@/game/classes";
import {
  drawShipDocks,
  drawShopMarkers,
  collectFolkDepthItems,
  drawFolkNameLabels,
} from "@/game/folkCanvas";
import { cairnsOnContinent, drawCairns } from "@/game/cairns";
import { drawProfessionNodes, professionNodesOnContinent } from "@/game/professions";
import {
  drawProjectiles,
  type Enemy,
  type FloatText,
  type Projectile,
} from "@/game/enemies";
import { drawCombatFloats, easeCombatFloats } from "@/game/gfx/damageFloats";
import { HIT_FLASH_SEC } from "@/game/gfx/hitFlash";
import { collectEnemyDepthItems, drawEnemyChrome, tickEnemyGfx } from "@/game/gfx/drawEnemies";
import {
  drawAshwoodTint,
  drawParallaxHaze,
  drawSurfaceLight,
  drawKeyLight,
  tickMotes,
  collectMoteDepthItems,
  drawHollowTorchSpots,
} from "@/game/gfx/atmosphere";
import { tickAshDrift, collectAshDriftDepthItems } from "@/game/gfx/ashDrift";
import { drawScreenVignette } from "@/game/gfx/screenVignette";
import { tickAmbientFauna, drawAmbientFaunaFar, drawAmbientFaunaAbove } from "@/game/gfx/ambientFauna";
import { drawViewOverlay } from "@/game/gfx/viewOverlay";
import type { ValeCharacter } from "@/game/character";
import { FOLK, type FolkDef, type ShopDef, type ShipDock } from "@/game/folk";
import { computePrompt } from "@/game/gameLoopFrame";
import { drawPlayer } from "@/game/renderPlayer";
import type { Facing } from "@/game/playerSprites";
import { WALK_FPS } from "@/game/playerSprites";
import { drawTile } from "@/game/gfx/drawTile";
import { drawTownOverlays } from "@/game/gfx/townDraw";
import {
  getAshwoodCanopySheet,
  paletteColor,
  tileVariantAt,
  CANOPY_PX,
  TILE_PX,
  warmTileSheets,
} from "@/game/gfx/tiles";
import { warmCreatureSheets } from "@/game/gfx/creatures";
import { warmFolkSheets } from "@/game/gfx/folkSprites";
import { flushDepth, type DepthItem } from "@/game/gfx/depth";
import { drawHuntCairns } from "@/game/huntZones";
import {
  resolveQuestObjective,
  tilesAway,
  drawObjectivePointer,
  drawCompass,
  drawRadar,
  collectRadarDots,
  drawWorldWayfindLabels,
  huntZoneLabelForPlayer,
} from "@/game/wayfinding";
import { playFootstep, playHit, syncAmbient } from "@/game/audio";
import {
  applyAshveilChamberReach,
  applyIdentify,
  getAshveilQuest,
  getGreenGateQuest,
  getSpineQuest,
  getPaleQuest,
  getAshenQuest,
  getEmbercoilQuest,
  getCoilQuest,
  getChoirRemembersQuest,
  getEdgeRemembersQuest,
  getWharfRemembersQuest,
  getMereRemembersQuest,
  getPaleRemembersQuest,
  isAshveilActive,
  isGreenGateActive,
  isSpineActive,
  isPaleActive,
  isAshenActive,
  isEmbercoilActive,
  isCoilActive,
  isChoirRemembersActive,
  isEdgeRemembersActive,
  isWharfRemembersActive,
  isMereRemembersActive,
  isPaleRemembersActive,
  loadQuestLog,
  notifyQuestUi,
  saveQuestLog,
} from "@/game/quests";
import {
  collectBodyMarkerDepthItem,
  tickBodyMarker,
} from "@/game/bodyMarker";
import { tickLootSparkles, drawLootSparkles } from "@/game/lootSparkle";

/** Position-delta walk state (avoids patching assembled gameLoop). */
let _lastPx = 0;
let _lastPy = 0;
let _facing: Facing = "south";
let _walkPhase = 0;
let _moving = false;
let _lastPlayerFlash = 0;
/** Drawn flash window. The assembled loop only holds playerFlash for ~0.18s. */
let _hitFlashVis = 0;
let _walkSampled = false;
let _atmosT = 0;
let _gfxWarmed = false;
/** Smoothed look-ahead so the view leans into the walk, then settles. */
let _lookX = 0;
let _lookY = 0;
/** Contact blob lags the boots by a few pixels. */
let _shadowLagX = 0;
let _shadowLagY = 0;

/** Catch-up rate (1/s). At a 140px/s walk the player leads center by ~24px, then settles. */
const CAM_EASE = 3.9;
const CAM_LOOK = 12;
const CAM_MAX_LAG = 34;
const CAM_SNAP = 240;
/** Rest the player a few pixels below center so more ground reads to the north. */
const CAM_SOUTH = 6;

function easeCamera(
  camX: number,
  camY: number,
  player: { x: number; y: number },
  dt: number,
): { camX: number; camY: number } {
  const dx = player.x - _lastPx;
  const dy = player.y - _lastPy;
  const jumped = _walkSampled && Math.hypot(dx, dy) > CAM_SNAP;
  if (!_walkSampled || jumped) {
    _lookX = 0;
    _lookY = 0;
    _shadowLagX = 0;
    _shadowLagY = 0;
    return { camX: player.x, camY: player.y - CAM_SOUTH };
  }

  const dist = Math.hypot(dx, dy);
  const dtSafe = Math.max(dt, 1 / 120);
  let wishX = 0;
  let wishY = 0;
  let lagX = 0;
  let lagY = 0;
  if (dist > 0.35) {
    const speed = dist / dtSafe;
    const aim = Math.min(1, speed / 90);
    wishX = (dx / dist) * CAM_LOOK * aim;
    wishY = (dy / dist) * CAM_LOOK * aim;
    const cap = Math.min(2.5, dist * 0.45);
    lagX = (-dx / dist) * cap;
    lagY = (-dy / dist) * cap;
  }
  const lookEase = 1 - Math.exp(-8 * dt);
  _lookX += (wishX - _lookX) * lookEase;
  _lookY += (wishY - _lookY) * lookEase;
  const lagEase = 1 - Math.exp(-12 * dt);
  _shadowLagX += (lagX - _shadowLagX) * lagEase;
  _shadowLagY += (lagY - _shadowLagY) * lagEase;

  const targetX = player.x + _lookX;
  const targetY = player.y + _lookY - CAM_SOUTH;
  const follow = 1 - Math.exp(-CAM_EASE * dt);
  let nx = camX + (targetX - camX) * follow;
  let ny = camY + (targetY - camY) * follow;
  const ox = nx - player.x;
  const oy = ny - player.y;
  const od = Math.hypot(ox, oy);
  if (od > CAM_MAX_LAG) {
    const scale = CAM_MAX_LAG / od;
    nx = player.x + ox * scale;
    ny = player.y + oy * scale;
  }
  return { camX: nx, camY: ny };
}

const ASHVEIL_CHAMBER_REACH_TILES = 2.4;
const ASHVEIL_IDENTIFY_TILES = 3.6;
const GREEN_GATE_IDENTIFY_TILES = 3.6;
const SPINE_IDENTIFY_TILES = 3.6;
const PALE_IDENTIFY_TILES = 3.6;
const ASHEN_IDENTIFY_TILES = 3.6;
const EMBERCOIL_IDENTIFY_TILES = 3.6;
const COIL_IDENTIFY_TILES = 3.6;
const CHOIR_REMEMBERS_IDENTIFY_TILES = 3.6;
const EDGE_REMEMBERS_IDENTIFY_TILES = 3.6;
const WHARF_REMEMBERS_IDENTIFY_TILES = 3.6;
const MERE_REMEMBERS_IDENTIFY_TILES = 3.6;
const PALE_REMEMBERS_IDENTIFY_TILES = 3.6;

/** Chamber reach + Ember Identify without patching assembled gameLoop. */
function tickAshveilField(
  player: { x: number; y: number },
  map: WorldMap,
  enemies: Enemy[],
): void {
  if (!isAshveilActive(loadQuestLog())) return;
  const log = loadQuestLog();
  const q = getAshveilQuest(log);
  if (!q || q.status !== "active") return;

  if (
    !q.reachedChamber &&
    map.kind === "hollow" &&
    map.continentId === "thornreach" &&
    map.bossChamber
  ) {
    const dist = Math.hypot(
      player.x / TILE - (map.bossChamber.x + 0.5),
      player.y / TILE - (map.bossChamber.y + 0.5),
    );
    if (dist <= ASHVEIL_CHAMBER_REACH_TILES) {
      const result = applyAshveilChamberReach(log);
      if (result) {
        saveQuestLog(result.log);
        notifyQuestUi(result.toast);
        return;
      }
    }
  }

  if (!q.identifiedEmber) {
    for (const e of enemies) {
      if (e.ai === "dead" || e.hp <= 0) continue;
      if (e.kind.id !== "ashveil-ember") continue;
      const dist = Math.hypot(e.x - player.x, e.y - player.y) / TILE;
      if (dist <= ASHVEIL_IDENTIFY_TILES) {
        const result = applyIdentify(loadQuestLog(), "ashveil-ember");
        if (result) {
          saveQuestLog(result.log);
          notifyQuestUi(result.toast);
        }
        break;
      }
    }
  }
}

/** Gorse Fox Identify on Verdant Spine without patching assembled gameLoop. */
function tickGreenGateField(
  player: { x: number; y: number },
  map: WorldMap,
  enemies: Enemy[],
): void {
  if (!isGreenGateActive(loadQuestLog())) return;
  const log = loadQuestLog();
  const q = getGreenGateQuest(log);
  if (!q || q.status !== "active" || q.identifiedFox) return;
  if (map.kind !== "overworld" || map.continentId !== "verdant-spine") return;

  for (const e of enemies) {
    if (e.ai === "dead" || e.hp <= 0) continue;
    if (e.kind.id !== "gorse-fox") continue;
    const dist = Math.hypot(e.x - player.x, e.y - player.y) / TILE;
    if (dist <= GREEN_GATE_IDENTIFY_TILES) {
      const result = applyIdentify(loadQuestLog(), "gorse-fox", "verdant-spine");
      if (result) {
        saveQuestLog(result.log);
        notifyQuestUi(result.toast);
      }
      break;
    }
  }
}

/** Ash-vole Identify on Verdant Spine without patching assembled gameLoop. */
function tickSpineField(
  player: { x: number; y: number },
  map: WorldMap,
  enemies: Enemy[],
): void {
  if (!isSpineActive(loadQuestLog())) return;
  const log = loadQuestLog();
  const q = getSpineQuest(log);
  if (!q || q.status !== "active" || q.identifiedVole) return;
  if (map.kind !== "overworld" || map.continentId !== "verdant-spine") return;

  for (const e of enemies) {
    if (e.ai === "dead" || e.hp <= 0) continue;
    if (e.kind.id !== "ash-vole") continue;
    const dist = Math.hypot(e.x - player.x, e.y - player.y) / TILE;
    if (dist <= SPINE_IDENTIFY_TILES) {
      const result = applyIdentify(loadQuestLog(), "ash-vole", "verdant-spine");
      if (result) {
        saveQuestLog(result.log);
        notifyQuestUi(result.toast);
      }
      break;
    }
  }
}

/** Briar Mite Identify on Pale Wastes without patching assembled gameLoop. */
function tickPaleField(
  player: { x: number; y: number },
  map: WorldMap,
  enemies: Enemy[],
): void {
  if (!isPaleActive(loadQuestLog())) return;
  const log = loadQuestLog();
  const q = getPaleQuest(log);
  if (!q || q.status !== "active" || q.identifiedMite) return;
  if (map.kind !== "overworld" || map.continentId !== "pale-wastes") return;

  for (const e of enemies) {
    if (e.ai === "dead" || e.hp <= 0) continue;
    if (e.kind.id !== "briar-mite") continue;
    const dist = Math.hypot(e.x - player.x, e.y - player.y) / TILE;
    if (dist <= PALE_IDENTIFY_TILES) {
      const result = applyIdentify(loadQuestLog(), "briar-mite", "pale-wastes");
      if (result) {
        saveQuestLog(result.log);
        notifyQuestUi(result.toast);
      }
      break;
    }
  }
}

/** Bark Hound Identify on Ashen Marches without patching assembled gameLoop. */
function tickAshenField(
  player: { x: number; y: number },
  map: WorldMap,
  enemies: Enemy[],
): void {
  if (!isAshenActive(loadQuestLog())) return;
  const log = loadQuestLog();
  const q = getAshenQuest(log);
  if (!q || q.status !== "active" || q.identifiedHound) return;
  if (map.kind !== "overworld" || map.continentId !== "ashen-marches") return;

  for (const e of enemies) {
    if (e.ai === "dead" || e.hp <= 0) continue;
    if (e.kind.id !== "bark-hound") continue;
    const dist = Math.hypot(e.x - player.x, e.y - player.y) / TILE;
    if (dist <= ASHEN_IDENTIFY_TILES) {
      const result = applyIdentify(loadQuestLog(), "bark-hound", "ashen-marches");
      if (result) {
        saveQuestLog(result.log);
        notifyQuestUi(result.toast);
      }
      break;
    }
  }
}

/** Needle Rat Identify on Embercoil without patching assembled gameLoop. */
function tickEmbercoilField(
  player: { x: number; y: number },
  map: WorldMap,
  enemies: Enemy[],
): void {
  if (!isEmbercoilActive(loadQuestLog())) return;
  const log = loadQuestLog();
  const q = getEmbercoilQuest(log);
  if (!q || q.status !== "active" || q.identifiedRat) return;
  if (map.kind !== "overworld" || map.continentId !== "embercoil") return;

  for (const e of enemies) {
    if (e.ai === "dead" || e.hp <= 0) continue;
    if (e.kind.id !== "needle-rat") continue;
    const dist = Math.hypot(e.x - player.x, e.y - player.y) / TILE;
    if (dist <= EMBERCOIL_IDENTIFY_TILES) {
      const result = applyIdentify(loadQuestLog(), "needle-rat", "embercoil");
      if (result) {
        saveQuestLog(result.log);
        notifyQuestUi(result.toast);
      }
      break;
    }
  }
}

/** Ash-vole Identify on Embercoil without patching assembled gameLoop. */
function tickCoilField(
  player: { x: number; y: number },
  map: WorldMap,
  enemies: Enemy[],
): void {
  if (!isCoilActive(loadQuestLog())) return;
  const log = loadQuestLog();
  const q = getCoilQuest(log);
  if (!q || q.status !== "active" || q.identifiedVole) return;
  if (map.kind !== "overworld" || map.continentId !== "embercoil") return;

  for (const e of enemies) {
    if (e.ai === "dead" || e.hp <= 0) continue;
    if (e.kind.id !== "ash-vole") continue;
    const dist = Math.hypot(e.x - player.x, e.y - player.y) / TILE;
    if (dist <= COIL_IDENTIFY_TILES) {
      const result = applyIdentify(loadQuestLog(), "ash-vole", "embercoil");
      if (result) {
        saveQuestLog(result.log);
        notifyQuestUi(result.toast);
      }
      break;
    }
  }
}

/** Briar Mite Identify on Sunken Choir without patching assembled gameLoop. */
function tickChoirRemembersField(
  player: { x: number; y: number },
  map: WorldMap,
  enemies: Enemy[],
): void {
  if (!isChoirRemembersActive(loadQuestLog())) return;
  const log = loadQuestLog();
  const q = getChoirRemembersQuest(log);
  if (!q || q.status !== "active" || q.identifiedMite) return;
  if (map.kind !== "overworld" || map.continentId !== "sunken-choir") return;

  for (const e of enemies) {
    if (e.ai === "dead" || e.hp <= 0) continue;
    if (e.kind.id !== "briar-mite") continue;
    const dist = Math.hypot(e.x - player.x, e.y - player.y) / TILE;
    if (dist <= CHOIR_REMEMBERS_IDENTIFY_TILES) {
      const result = applyIdentify(loadQuestLog(), "briar-mite", "sunken-choir");
      if (result) {
        saveQuestLog(result.log);
        notifyQuestUi(result.toast);
      }
      break;
    }
  }
}

/** Ash-vole Identify on Thornreach without patching assembled gameLoop. */
function tickEdgeRemembersField(
  player: { x: number; y: number },
  map: WorldMap,
  enemies: Enemy[],
): void {
  if (!isEdgeRemembersActive(loadQuestLog())) return;
  const log = loadQuestLog();
  const q = getEdgeRemembersQuest(log);
  if (!q || q.status !== "active" || q.identifiedVole) return;
  if (map.kind !== "overworld" || map.continentId !== "thornreach") return;

  for (const e of enemies) {
    if (e.ai === "dead" || e.hp <= 0) continue;
    if (e.kind.id !== "ash-vole") continue;
    const dist = Math.hypot(e.x - player.x, e.y - player.y) / TILE;
    if (dist <= EDGE_REMEMBERS_IDENTIFY_TILES) {
      const result = applyIdentify(loadQuestLog(), "ash-vole", "thornreach");
      if (result) {
        saveQuestLog(result.log);
        notifyQuestUi(result.toast);
      }
      break;
    }
  }
}

/** Gorse Fox Identify on Nightglass Coast without patching assembled gameLoop. */
function tickWharfRemembersField(
  player: { x: number; y: number },
  map: WorldMap,
  enemies: Enemy[],
): void {
  if (!isWharfRemembersActive(loadQuestLog())) return;
  const log = loadQuestLog();
  const q = getWharfRemembersQuest(log);
  if (!q || q.status !== "active" || q.identifiedFox) return;
  if (map.kind !== "overworld" || map.continentId !== "nightglass-coast") return;

  for (const e of enemies) {
    if (e.ai === "dead" || e.hp <= 0) continue;
    if (e.kind.id !== "gorse-fox") continue;
    const dist = Math.hypot(e.x - player.x, e.y - player.y) / TILE;
    if (dist <= WHARF_REMEMBERS_IDENTIFY_TILES) {
      const result = applyIdentify(loadQuestLog(), "gorse-fox", "nightglass-coast");
      if (result) {
        saveQuestLog(result.log);
        notifyQuestUi(result.toast);
      }
      break;
    }
  }
}

/** Briar Mite Identify on Mistmere without patching assembled gameLoop. */
function tickMereRemembersField(
  player: { x: number; y: number },
  map: WorldMap,
  enemies: Enemy[],
): void {
  if (!isMereRemembersActive(loadQuestLog())) return;
  const log = loadQuestLog();
  const q = getMereRemembersQuest(log);
  if (!q || q.status !== "active" || q.identifiedMite) return;
  if (map.kind !== "overworld" || map.continentId !== "mistmere") return;

  for (const e of enemies) {
    if (e.ai === "dead" || e.hp <= 0) continue;
    if (e.kind.id !== "briar-mite") continue;
    const dist = Math.hypot(e.x - player.x, e.y - player.y) / TILE;
    if (dist <= MERE_REMEMBERS_IDENTIFY_TILES) {
      const result = applyIdentify(loadQuestLog(), "briar-mite", "mistmere");
      if (result) {
        saveQuestLog(result.log);
        notifyQuestUi(result.toast);
      }
      break;
    }
  }
}

/** Ash-vole Identify on Pale Wastes without patching assembled gameLoop. */
function tickPaleRemembersField(
  player: { x: number; y: number },
  map: WorldMap,
  enemies: Enemy[],
): void {
  if (!isPaleRemembersActive(loadQuestLog())) return;
  const log = loadQuestLog();
  const q = getPaleRemembersQuest(log);
  if (!q || q.status !== "active" || q.identifiedVole) return;
  if (map.kind !== "overworld" || map.continentId !== "pale-wastes") return;

  for (const e of enemies) {
    if (e.ai === "dead" || e.hp <= 0) continue;
    if (e.kind.id !== "ash-vole") continue;
    const dist = Math.hypot(e.x - player.x, e.y - player.y) / TILE;
    if (dist <= PALE_REMEMBERS_IDENTIFY_TILES) {
      const result = applyIdentify(loadQuestLog(), "ash-vole", "pale-wastes");
      if (result) {
        saveQuestLog(result.log);
        notifyQuestUi(result.toast);
      }
      break;
    }
  }
}

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

  ({ camX, camY } = easeCamera(camX, camY, player, dt));
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
  if (!_gfxWarmed) {
    warmTileSheets(pal);
    warmCreatureSheets();
    warmFolkSheets(FOLK);
    _gfxWarmed = true;
  }
  ctx.imageSmoothingEnabled = false;
  _atmosT += dt;
  tickEnemyGfx(dt);
  for (let ty = startTY; ty <= endTY; ty++) {
    for (let tx = startTX; tx <= endTX; tx++) {
      const kind = map.tiles[ty]![tx]!;
      const sx = Math.floor(tx * TILE - originX);
      const sy = Math.floor(ty * TILE - originY);
      drawTile(ctx, kind, pal, sx, sy, tx, ty, map, _atmosT);
    }
  }
  drawAshwoodTint(ctx, map, originX, originY, viewW, viewH);
  drawSurfaceLight(ctx, map, originX, originY, viewW, viewH, _atmosT);
  drawParallaxHaze(ctx, map, originX, originY, viewW, viewH, _atmosT);
  tickAmbientFauna(dt, map, originX, originY, viewW, viewH, _atmosT);
  drawAmbientFaunaFar(ctx, originX, originY, viewW, viewH, _atmosT);
  drawTownOverlays(ctx, map, player, originX, originY, _atmosT);
  if (map.kind === "overworld" && isSafeContinent(map.continentId)) {
    const fx = Math.floor((map.spawn.x + 0.5) * TILE - originX);
    const fy = Math.floor((map.spawn.y + 0.5) * TILE - originY);
    ctx.save();
    ctx.beginPath();
    ctx.arc(fx, fy, SAFE_ZONE_RADIUS_TILES * TILE, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(122, 184, 201, 0.28)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.restore();
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
  if (map.kind === "overworld") {
    drawCairns(ctx, cairnsOnContinent(map.continentId), originX, originY, TILE);
    drawProfessionNodes(
      ctx,
      professionNodesOnContinent(map.continentId),
      originX,
      originY,
    );
  }
  drawShopMarkers(ctx, shops, folk, originX, originY);
  if (map.kind === "overworld") {
    drawHuntCairns(ctx, map.continentId, originX, originY);
  }
  mouse.worldX = originX + mouse.x;
  mouse.worldY = originY + mouse.y;
  const px = Math.floor(player.x - originX);
  const py = Math.floor(player.y - originY);
  const dx = player.x - _lastPx;
  const dy = player.y - _lastPy;
  const dist = Math.hypot(dx, dy);
  if (!_walkSampled) {
    _walkSampled = true;
    _moving = false;
  } else if (dist > 0.4) {
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
  const idleLift = !_moving && Math.sin(_atmosT * 1.65) > 0.05 ? -1 : 0;
  syncAmbient(map.kind);
  if (_moving && !paused && walkFrame % 2 === 0) playFootstep();
  if (playerFlash > _lastPlayerFlash + 0.02) _hitFlashVis = HIT_FLASH_SEC;
  if (playerFlash > _lastPlayerFlash + 0.2) playHit("player");
  _lastPlayerFlash = playerFlash;
  _hitFlashVis = Math.max(0, _hitFlashVis - dt);

  tickMotes(dt, map, originX, originY, viewW, viewH);
  tickAshDrift(dt, map, originX, originY, viewW, viewH, _atmosT);
  const groundShift = {
    x: Math.max(-2.5, Math.min(2.5, (camX - player.x) * 0.08)),
    y: Math.max(-2.5, Math.min(2.5, (camY - player.y) * 0.08)),
  };
  const depth: DepthItem[] = [
    ...collectFolkDepthItems(folk, originX, originY, _atmosT),
    ...collectEnemyDepthItems(enemies, originX, originY, groundShift),
    ...collectMoteDepthItems(originX, originY, _atmosT),
    ...collectAshDriftDepthItems(originX, originY, _atmosT),
    {
      y: player.y,
      x: player.x,
      draw: (c) => {
        drawPlayer(
          c,
          character,
          px,
          py,
          _facing,
          walkFrame,
          _hitFlashVis,
          accent,
          idleLift,
          _shadowLagX + groundShift.x,
          _shadowLagY + groundShift.y,
        );
      },
    },
  ];
  if (map.kind === "overworld") {
    const canopyPad = 2;
    const cStartTX = Math.max(0, startTX - canopyPad);
    const cStartTY = Math.max(0, startTY - canopyPad);
    const cEndTX = Math.min(map.width - 1, endTX + canopyPad);
    const cEndTY = Math.min(map.height - 1, endTY + canopyPad);
    const stoneColor = paletteColor(pal, "stone");
    const drawSize = Math.round(CANOPY_PX * (TILE / TILE_PX));
    for (let ty = cStartTY; ty <= cEndTY; ty++) {
      for (let tx = cStartTX; tx <= cEndTX; tx++) {
        if (map.tiles[ty]![tx] !== "stone") continue;
        const variant = tileVariantAt(tx, ty);
        const sheet = getAshwoodCanopySheet(stoneColor, variant);
        const sway = Math.round(Math.sin(_atmosT * 1.25 + tx * 1.7 + ty * 0.55) * 2);
        const crown = Math.round(Math.sin(_atmosT * 0.85 + ty * 1.4 + tx * 0.3) * 1);
        const dx0 = Math.floor(tx * TILE - originX + TILE / 2 - drawSize / 2) + sway;
        const dy0 = Math.floor(ty * TILE - originY + 8 - drawSize * 0.72) + crown;
        depth.push({
          y: (ty + 0.92) * TILE,
          x: (tx + 0.5) * TILE,
          draw: (c) => {
            c.imageSmoothingEnabled = false;
            c.drawImage(sheet as CanvasImageSource, dx0, dy0, drawSize, drawSize);
          },
        });
      }
    }
  }
  tickBodyMarker(map, player);
  const bodyMarkerItem = collectBodyMarkerDepthItem(map, originX, originY);
  if (bodyMarkerItem) depth.push(bodyMarkerItem);
  flushDepth(ctx, depth);
  drawAmbientFaunaAbove(ctx, originX, originY, viewW, viewH, _atmosT);
  drawKeyLight(ctx, viewW, viewH);
  drawProjectiles(ctx, projectiles, originX, originY);
  tickLootSparkles(dt);
  drawHollowTorchSpots(ctx, map, originX, originY, viewW, viewH, player, _atmosT);
  const outdoor = map.kind === "overworld";
  let plaza = 0;
  if (outdoor && map.continentId === "thornreach") {
    const dx = player.x / TILE - (map.spawn.x + 0.5);
    const dy = player.y / TILE - (map.spawn.y + 0.5);
    const dist = Math.hypot(dx, dy);
    plaza = dist >= 12 ? 0 : 1 - dist / 12;
  }
  drawViewOverlay(ctx, {
    dt,
    timeSec: _atmosT,
    viewW,
    viewH,
    outdoor,
    plaza,
  });
  drawScreenVignette(ctx, {
    dt,
    viewW,
    viewH,
    focusX: px,
    focusY: py,
    playerX: player.x,
    playerY: player.y,
    tile: TILE,
    foes: enemies,
  });
  drawLootSparkles(ctx, originX, originY, player);
  drawEnemyChrome(ctx, enemies, originX, originY);
  drawFolkNameLabels(ctx, folk, originX, originY, player);
  drawWorldWayfindLabels(ctx, map, docks, player, originX, originY);
  if (!paused) easeCombatFloats(floatTexts, dt);
  drawCombatFloats(ctx, floatTexts, originX, originY);


  tickAshveilField(player, map, enemies);
  tickGreenGateField(player, map, enemies);
  tickSpineField(player, map, enemies);
  tickPaleField(player, map, enemies);
  tickAshenField(player, map, enemies);
  tickEmbercoilField(player, map, enemies);
  tickCoilField(player, map, enemies);
  tickChoirRemembersField(player, map, enemies);
  tickEdgeRemembersField(player, map, enemies);
  tickWharfRemembersField(player, map, enemies);
  tickMereRemembersField(player, map, enemies);
  tickPaleRemembersField(player, map, enemies);
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
      weight: carriedWeight(character.inventory),
      maxWeight: maxWeightFor(character.premiumBackpack),
      slots: character.inventory.length,
      maxSlots: maxSlotsFor(character.premiumBackpack),
      inSafeZone: isInSafeZone(character.continentId, map, player.x, player.y),
      objectiveLabel: objective ? objective.label : null,
      objectiveDist: objective ? tilesAway(player, objective) : null,
      huntZoneLabel: huntZoneLabelForPlayer(map, player),
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
