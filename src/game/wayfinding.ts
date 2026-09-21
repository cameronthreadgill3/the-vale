/** Wayfinding barrel — quest pointer, compass, radar, labels, starter tip. */
export {
  WAYFIND_LABEL_RANGE,
  WAYFIND_RADAR_RANGE,
  resolveQuestObjective,
  objectiveForTeeth,
  objectiveForLines,
  tilesAway,
  type WayfindObjective,
  type RadarDot,
} from "@/game/wayfindingObjectives";
export {
  drawObjectivePointer,
  drawCompass,
  drawRadar,
  collectRadarDots,
} from "@/game/wayfindingDraw";
export {
  drawWorldWayfindLabels,
  STARTER_TIP,
  STARTER_TIP_MS,
} from "@/game/wayfindingLabels";
