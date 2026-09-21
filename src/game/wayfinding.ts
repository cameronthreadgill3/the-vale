/** Wayfinding barrel — quest pointer, compass, radar, labels, starter tip. */
export {
  WAYFIND_LABEL_RANGE,
  HUNT_CAIRN_LABEL_RANGE,
  WAYFIND_RADAR_RANGE,
  resolveQuestObjective,
  objectiveForTeeth,
  objectiveForAshwood,
  objectiveForHollow,
  objectiveForGateWatch,
  objectiveForMistmere,
  objectiveForWatchline,
  objectiveForAshveil,
  objectiveForChoirCounts,
  objectiveForWharf,
  objectiveForGreenGate,
  objectiveForSpine,
  objectiveForPale,
  objectiveForAshen,
  objectiveForEmbercoil,
  objectiveForCoil,
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
  huntZoneLabelForPlayer,
  STARTER_TIP,
  STARTER_TIP_MS,
} from "@/game/wayfindingLabels";
