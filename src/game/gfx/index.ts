/** Original procedural pixel gfx for The Vale (Tibia-adjacent look, no CipSoft assets). */
export { drawTile, DRAW_TILE_GRID, TILE_PX, fountainFrameAt } from "@/game/gfx/drawTile";
export {
  getTileSheet,
  getGrassEdgeSheet,
  getGrassSpillSheet,
  getGrassCornerSheet,
  getHardLipSheet,
  getPathContactSheet,
  getHardCornerSheet,
  getTreeDuffSheet,
  getWaterShoreSheet,
  getAshwoodCanopySheet,
  tileVariantAt,
  TILE_VARIANTS,
  FOUNTAIN_FRAMES,
  CANOPY_PX,
  warmTileSheets,
} from "@/game/gfx/tiles";
export {
  getPropSheet,
  getBannerSheet,
  getAwningSheet,
  propFlameFrame,
  propSwayFrame,
  propSwayLean,
  PROP_FLAME_FRAMES,
  PROP_SWAY_FRAMES,
} from "@/game/gfx/props";
export {
  getCairnSheet,
  drawHuntCairnSprite,
  drawWatchCairnSprite,
  warmCairnSheets,
  CAIRN_FRAME_W,
  CAIRN_FRAME_H,
} from "@/game/gfx/cairn";
export { drawTownOverlays } from "@/game/gfx/townDraw";
export {
  drawCreatureSprite,
  getCreatureSheet,
  creatureWalkFrame,
  CREATURE_FRAME,
  CREATURE_WALK_FRAMES,
  warmCreatureSheets,
} from "@/game/gfx/creatures";
export { drawEnemies, tickEnemyGfx, collectEnemyDepthItems, drawEnemyChrome } from "@/game/gfx/drawEnemies";
export {
  punchCreatureHit,
  tickCreatureHits,
  creatureHitLeft,
  drawSilhouetteFlash,
  drawOrbHitFlash,
  HIT_FLASH_SEC,
} from "@/game/gfx/hitFlash";
export { easeCombatFloats, drawCombatFloats } from "@/game/gfx/damageFloats";
export { drawFolkSprite, getFolkSheet, FOLK_FRAME, warmFolkSheets } from "@/game/gfx/folkSprites";
export {
  drawVignette,
  drawAshwoodTint,
  drawParallaxHaze,
  drawSurfaceLight,
  drawKeyLight,
  tickMotes,
  collectMoteDepthItems,
  drawHollowTorchSpots,
  drawHollowDungeonMarkers,
} from "@/game/gfx/atmosphere";
export { tickAshDrift, collectAshDriftDepthItems } from "@/game/gfx/ashDrift";
export { tickFootstepDust, groundKicksDust, drawFootstepDust } from "@/game/gfx/footstepDust";
export { tickAmbientFauna, drawAmbientFaunaFar, drawAmbientFaunaAbove } from "@/game/gfx/ambientFauna";
export { drawViewOverlay } from "@/game/gfx/viewOverlay";
export { drawScreenVignette, combatFocusTarget } from "@/game/gfx/screenVignette";
export {
  drawDirectionalRim,
  drawOrbDirectionalRim,
  rimStrengthForDistance,
} from "@/game/gfx/directionalRim";
export {
  makeCanvas,
  ctx2d,
  px,
  shadeHex,
  mixHex,
  paintVolume,
  drawSoftShadow,
  drawWithWarmRim,
  addPixelVolume,
  GROUND_SHADOW_ALPHA,
} from "@/game/gfx/canvasUtil";
export { flushDepth, type DepthItem } from "@/game/gfx/depth";
