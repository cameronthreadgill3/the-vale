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
export { drawViewOverlay } from "@/game/gfx/viewOverlay";
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
