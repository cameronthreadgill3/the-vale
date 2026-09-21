/** Wayfinding objectives + distance helpers. */
import { TILE, type WorldMap } from "@/game/world";
import { docksOnContinent, getDock, type FolkDef } from "@/game/folk";
import type { ContinentId } from "@/game/continents";
import type { Enemy } from "@/game/enemies";
import {
  TEETH_RATS_NEEDED,
  ASHWOOD_CAIRNS_NEEDED,
  HOLLOW_WISPS_NEEDED,
  WATCHLINE_CAIRN_ID,
  CRESS_FOLK_ID,
  OLD_REED_FOLK_ID,
  CHOIR_KEEPER_FOLK_ID,
  VESPER_FOLK_ID,
  MISTMERE_PIER_DOCK_ID,
  CHOIR_LANDING_DOCK_ID,
  NIGHTGLASS_WHARF_DOCK_ID,
  ASH_PILGRIM_FOLK_ID,
  getTeethQuest,
  getAshwoodQuest,
  getHollowQuest,
  getGateWatchQuest,
  getMistmereQuest,
  getWatchlineQuest,
  getAshveilQuest,
  getChoirCountsQuest,
  getWharfQuest,
  getGreenGateQuest,
  getSpineQuest,
  getPaleQuest,
  getAshenQuest,
  getEmbercoilQuest,
  getCoilQuest,
  isTeethActive,
  isAshwoodActive,
  isHollowActive,
  isGateWatchActive,
  isMistmereActive,
  isWatchlineActive,
  isAshveilActive,
  isChoirCountsActive,
  isWharfActive,
  isGreenGateActive,
  isSpineActive,
  isPaleActive,
  isAshenActive,
  isEmbercoilActive,
  isCoilActive,
  loadQuestLog,
  type TeethQuestProgress,
  type AshwoodQuestProgress,
  type HollowQuestProgress,
  type GateWatchQuestProgress,
  type MistmereQuestProgress,
  type WatchlineQuestProgress,
  type AshveilQuestProgress,
  type ChoirCountsQuestProgress,
  type WharfQuestProgress,
  type GreenGateQuestProgress,
  type SpineQuestProgress,
  type PaleQuestProgress,
  type AshenQuestProgress,
  type EmbercoilQuestProgress,
  type CoilQuestProgress,
} from "@/game/quests";
import { ASHWOOD_CAIRNS } from "@/game/cairns";
import { huntZoneById } from "@/game/huntZones";

export type WayfindObjective = {
  label: string;
  x: number;
  y: number;
  kind: "folk" | "enemy" | "landmark" | "cairn";
};

export type RadarDot = {
  x: number;
  y: number;
  color: string;
  quest?: boolean;
};

export const WAYFIND_LABEL_RANGE = 8;
/** Hunt cairns read from farther than folk/gates so Rec. bands are wayfindable. */
export const HUNT_CAIRN_LABEL_RANGE = 12;
export const WAYFIND_RADAR_RANGE = 14;

export function resolveQuestObjective(
  player: { x: number; y: number },
  enemies: Enemy[],
  folk: FolkDef[],
  map: WorldMap,
): WayfindObjective | null {
  const log = loadQuestLog();
  if (isCoilActive(log)) {
    const q = getCoilQuest(log);
    if (q) return objectiveForCoil(q, player, enemies, folk, map);
  }
  if (isEmbercoilActive(log)) {
    const q = getEmbercoilQuest(log);
    if (q) return objectiveForEmbercoil(q, player, enemies, folk, map);
  }
  if (isAshenActive(log)) {
    const q = getAshenQuest(log);
    if (q) return objectiveForAshen(q, player, enemies, folk, map);
  }
  if (isPaleActive(log)) {
    const q = getPaleQuest(log);
    if (q) return objectiveForPale(q, player, enemies, folk, map);
  }
  if (isSpineActive(log)) {
    const q = getSpineQuest(log);
    if (q) return objectiveForSpine(q, player, enemies, folk, map);
  }
  if (isGreenGateActive(log)) {
    const q = getGreenGateQuest(log);
    if (q) return objectiveForGreenGate(q, player, enemies, folk, map);
  }
  if (isWharfActive(log)) {
    const q = getWharfQuest(log);
    if (q) return objectiveForWharf(q, player, enemies, folk, map);
  }
  if (isChoirCountsActive(log)) {
    const q = getChoirCountsQuest(log);
    if (q) return objectiveForChoirCounts(q, player, folk, map);
  }
  if (isAshveilActive(log)) {
    const q = getAshveilQuest(log);
    if (q) return objectiveForAshveil(q, player, enemies, folk, map);
  }
  if (isWatchlineActive(log)) {
    const q = getWatchlineQuest(log);
    if (q) return objectiveForWatchline(q, player, enemies, folk, map);
  }
  if (isMistmereActive(log)) {
    const q = getMistmereQuest(log);
    if (q) return objectiveForMistmere(q, player, folk, map);
  }
  if (isGateWatchActive(log)) {
    const q = getGateWatchQuest(log);
    if (q) return objectiveForGateWatch(q, player, folk, map);
  }
  if (isHollowActive(log)) {
    const q = getHollowQuest(log);
    if (q) return objectiveForHollow(q, player, enemies, folk, map);
  }
  if (isAshwoodActive(log)) {
    const q = getAshwoodQuest(log);
    if (q) return objectiveForAshwood(q, player, enemies, folk);
  }
  if (isTeethActive(log)) {
    const q = getTeethQuest(log);
    if (q) return objectiveForTeeth(q, player, enemies, folk);
  }
  return null;
}

export function objectiveForSpine(
  q: SpineQuestProgress,
  player: { x: number; y: number },
  enemies: Enemy[],
  folk: FolkDef[],
  map: WorldMap,
): WayfindObjective | null {
  if (q.status !== "active") return null;
  const rook = folk.find((f) => f.id === "rook");

  if (!q.reachedSpine) {
    const gate = continentGateOnMap(map, "verdant-spine");
    if (gate) {
      return {
        label: "Reach Verdant Spine gate",
        x: (gate.x + 0.5) * TILE,
        y: (gate.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const home = continentGateOnMap(map, "thornreach");
    if (home) {
      return {
        label: "Gate to Verdant Spine (Thornreach)",
        x: (home.x + 0.5) * TILE,
        y: (home.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Verdant Spine gate (Thornreach)",
      x: player.x + TILE * 8,
      y: player.y - TILE * 2,
      kind: "landmark",
    };
  }

  if (!q.identifiedVole) {
    const vole = nearestEnemy(player, enemies, "ash-vole");
    if (vole) {
      return { label: "Identify Ash-vole", x: vole.x, y: vole.y, kind: "enemy" };
    }
    if (map.continentId === "verdant-spine" && map.kind === "overworld") {
      return {
        label: "Find Ash-vole (Verdant Spine)",
        x: player.x + TILE * 6,
        y: player.y - TILE * 4,
        kind: "landmark",
      };
    }
    const toSpine = continentGateOnMap(map, "verdant-spine");
    if (toSpine) {
      return {
        label: "Gate to Ash-vole (Verdant Spine)",
        x: (toSpine.x + 0.5) * TILE,
        y: (toSpine.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const home = continentGateOnMap(map, "thornreach");
    if (home) {
      return {
        label: "Gate toward Verdant Spine",
        x: (home.x + 0.5) * TILE,
        y: (home.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Ash-vole (Verdant Spine)",
      x: player.x + TILE * 6,
      y: player.y - TILE * 4,
      kind: "landmark",
    };
  }

  if (!q.houndDone) {
    const hound = nearestEnemy(player, enemies, "bark-hound");
    if (hound) {
      return {
        label: "Defeat Bark Hound (0/1)",
        x: hound.x,
        y: hound.y,
        kind: "enemy",
      };
    }
    if (map.continentId === "verdant-spine" && map.kind === "overworld") {
      return {
        label: "Find Bark Hound (Verdant Spine)",
        x: player.x + TILE * 6,
        y: player.y - TILE * 4,
        kind: "landmark",
      };
    }
    const toSpine = continentGateOnMap(map, "verdant-spine");
    if (toSpine) {
      return {
        label: "Gate to Bark Hound (Verdant Spine)",
        x: (toSpine.x + 0.5) * TILE,
        y: (toSpine.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const home = continentGateOnMap(map, "thornreach");
    if (home) {
      return {
        label: "Gate toward Verdant Spine",
        x: (home.x + 0.5) * TILE,
        y: (home.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Bark Hound (Verdant Spine)",
      x: player.x + TILE * 6,
      y: player.y - TILE * 4,
      kind: "landmark",
    };
  }

  if (rook) {
    return {
      label: "Return to Rook",
      x: (rook.x + 0.5) * TILE,
      y: (rook.y + 0.5) * TILE,
      kind: "folk",
    };
  }
  const home = continentGateOnMap(map, "thornreach");
  if (home) {
    return {
      label: "Gate back to Rook (Thornreach)",
      x: (home.x + 0.5) * TILE,
      y: (home.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  return {
    label: "Return to Rook (Thornreach)",
    x: player.x + TILE * 8,
    y: player.y - TILE * 2,
    kind: "landmark",
  };
}

export function objectiveForPale(
  q: PaleQuestProgress,
  player: { x: number; y: number },
  enemies: Enemy[],
  folk: FolkDef[],
  map: WorldMap,
): WayfindObjective | null {
  if (q.status !== "active") return null;
  const rook = folk.find((f) => f.id === "rook");

  if (!q.reachedPale) {
    const gate = continentGateOnMap(map, "pale-wastes");
    if (gate) {
      return {
        label: "Reach Pale Wastes gate",
        x: (gate.x + 0.5) * TILE,
        y: (gate.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const toSpine = continentGateOnMap(map, "verdant-spine");
    if (toSpine) {
      return {
        label: "Gate to Pale Wastes (Verdant Spine)",
        x: (toSpine.x + 0.5) * TILE,
        y: (toSpine.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const home = continentGateOnMap(map, "thornreach");
    if (home) {
      return {
        label: "Gate toward Verdant Spine",
        x: (home.x + 0.5) * TILE,
        y: (home.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Pale Wastes gate (Verdant Spine)",
      x: player.x + TILE * 8,
      y: player.y - TILE * 2,
      kind: "landmark",
    };
  }

  if (!q.identifiedMite) {
    const mite = nearestEnemy(player, enemies, "briar-mite");
    if (mite) {
      return { label: "Identify Briar Mite", x: mite.x, y: mite.y, kind: "enemy" };
    }
    if (map.continentId === "pale-wastes" && map.kind === "overworld") {
      return {
        label: "Find Briar Mite (Pale Wastes)",
        x: player.x + TILE * 6,
        y: player.y - TILE * 4,
        kind: "landmark",
      };
    }
    const toPale = continentGateOnMap(map, "pale-wastes");
    if (toPale) {
      return {
        label: "Gate to Briar Mite (Pale Wastes)",
        x: (toPale.x + 0.5) * TILE,
        y: (toPale.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const toSpine = continentGateOnMap(map, "verdant-spine");
    if (toSpine) {
      return {
        label: "Gate toward Pale Wastes",
        x: (toSpine.x + 0.5) * TILE,
        y: (toSpine.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const home = continentGateOnMap(map, "thornreach");
    if (home) {
      return {
        label: "Gate toward Verdant Spine",
        x: (home.x + 0.5) * TILE,
        y: (home.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Briar Mite (Pale Wastes)",
      x: player.x + TILE * 6,
      y: player.y - TILE * 4,
      kind: "landmark",
    };
  }

  if (!q.ratDone) {
    const rat = nearestEnemy(player, enemies, "needle-rat");
    if (rat) {
      return {
        label: "Defeat Needle Rat (0/1)",
        x: rat.x,
        y: rat.y,
        kind: "enemy",
      };
    }
    if (map.continentId === "pale-wastes" && map.kind === "overworld") {
      return {
        label: "Find Needle Rat (Pale Wastes)",
        x: player.x + TILE * 6,
        y: player.y - TILE * 4,
        kind: "landmark",
      };
    }
    const toPale = continentGateOnMap(map, "pale-wastes");
    if (toPale) {
      return {
        label: "Gate to Needle Rat (Pale Wastes)",
        x: (toPale.x + 0.5) * TILE,
        y: (toPale.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const toSpine = continentGateOnMap(map, "verdant-spine");
    if (toSpine) {
      return {
        label: "Gate toward Pale Wastes",
        x: (toSpine.x + 0.5) * TILE,
        y: (toSpine.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const home = continentGateOnMap(map, "thornreach");
    if (home) {
      return {
        label: "Gate toward Verdant Spine",
        x: (home.x + 0.5) * TILE,
        y: (home.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Needle Rat (Pale Wastes)",
      x: player.x + TILE * 6,
      y: player.y - TILE * 4,
      kind: "landmark",
    };
  }

  if (rook) {
    return {
      label: "Return to Rook",
      x: (rook.x + 0.5) * TILE,
      y: (rook.y + 0.5) * TILE,
      kind: "folk",
    };
  }
  const home = continentGateOnMap(map, "thornreach");
  if (home) {
    return {
      label: "Gate back to Rook (Thornreach)",
      x: (home.x + 0.5) * TILE,
      y: (home.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  const toSpineHome = continentGateOnMap(map, "verdant-spine");
  if (toSpineHome) {
    return {
      label: "Gate toward Rook (Verdant Spine)",
      x: (toSpineHome.x + 0.5) * TILE,
      y: (toSpineHome.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  return {
    label: "Return to Rook (Thornreach)",
    x: player.x + TILE * 8,
    y: player.y - TILE * 2,
    kind: "landmark",
  };
}

export function objectiveForAshen(
  q: AshenQuestProgress,
  player: { x: number; y: number },
  enemies: Enemy[],
  folk: FolkDef[],
  map: WorldMap,
): WayfindObjective | null {
  if (q.status !== "active") return null;
  const rook = folk.find((f) => f.id === "rook");
  const pilgrim = folk.find((f) => f.id === ASH_PILGRIM_FOLK_ID);

  if (!q.reachedAshen) {
    const gate = continentGateOnMap(map, "ashen-marches");
    if (gate) {
      return {
        label: "Reach Ashen Marches gate",
        x: (gate.x + 0.5) * TILE,
        y: (gate.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    if (map.continentId !== "pale-wastes") {
      const home = continentGateOnMap(map, "thornreach");
      if (home) {
        return {
          label: "Gate to Ashen Marches (Thornreach)",
          x: (home.x + 0.5) * TILE,
          y: (home.y + 0.5) * TILE,
          kind: "landmark",
        };
      }
    }
    const toPale = continentGateOnMap(map, "pale-wastes");
    if (toPale) {
      return {
        label: "Gate to Ashen Marches (Pale Wastes)",
        x: (toPale.x + 0.5) * TILE,
        y: (toPale.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Ashen Marches gate (Pale Wastes)",
      x: player.x + TILE * 8,
      y: player.y - TILE * 2,
      kind: "landmark",
    };
  }

  if (!q.talkedAshPilgrim) {
    if (pilgrim) {
      return {
        label: "Talk to Ash Pilgrim",
        x: (pilgrim.x + 0.5) * TILE,
        y: (pilgrim.y + 0.5) * TILE,
        kind: "folk",
      };
    }
    const toAshen = continentGateOnMap(map, "ashen-marches");
    if (toAshen) {
      return {
        label: "Gate to Ash Pilgrim (Ashen Marches)",
        x: (toAshen.x + 0.5) * TILE,
        y: (toAshen.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    if (map.continentId !== "pale-wastes") {
      const home = continentGateOnMap(map, "thornreach");
      if (home) {
        return {
          label: "Gate toward Ashen Marches",
          x: (home.x + 0.5) * TILE,
          y: (home.y + 0.5) * TILE,
          kind: "landmark",
        };
      }
    }
    const toPale = continentGateOnMap(map, "pale-wastes");
    if (toPale) {
      return {
        label: "Gate toward Ashen Marches",
        x: (toPale.x + 0.5) * TILE,
        y: (toPale.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Ash Pilgrim (Ashen Marches)",
      x: player.x + TILE * 6,
      y: player.y - TILE * 4,
      kind: "landmark",
    };
  }

  if (!q.identifiedHound) {
    const hound = nearestEnemy(player, enemies, "bark-hound");
    if (hound) {
      return {
        label: "Identify Bark Hound",
        x: hound.x,
        y: hound.y,
        kind: "enemy",
      };
    }
    if (map.continentId === "ashen-marches" && map.kind === "overworld") {
      return {
        label: "Find Bark Hound (Ashen Marches)",
        x: player.x + TILE * 6,
        y: player.y - TILE * 4,
        kind: "landmark",
      };
    }
    const toAshen = continentGateOnMap(map, "ashen-marches");
    if (toAshen) {
      return {
        label: "Gate to Bark Hound (Ashen Marches)",
        x: (toAshen.x + 0.5) * TILE,
        y: (toAshen.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    if (map.continentId !== "pale-wastes") {
      const home = continentGateOnMap(map, "thornreach");
      if (home) {
        return {
          label: "Gate toward Ashen Marches",
          x: (home.x + 0.5) * TILE,
          y: (home.y + 0.5) * TILE,
          kind: "landmark",
        };
      }
    }
    const toPale = continentGateOnMap(map, "pale-wastes");
    if (toPale) {
      return {
        label: "Gate toward Ashen Marches",
        x: (toPale.x + 0.5) * TILE,
        y: (toPale.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Bark Hound (Ashen Marches)",
      x: player.x + TILE * 6,
      y: player.y - TILE * 4,
      kind: "landmark",
    };
  }

  if (!q.ratDone) {
    const rat = nearestEnemy(player, enemies, "needle-rat");
    if (rat) {
      return {
        label: "Defeat Needle Rat (0/1)",
        x: rat.x,
        y: rat.y,
        kind: "enemy",
      };
    }
    if (map.continentId === "ashen-marches" && map.kind === "overworld") {
      return {
        label: "Find Needle Rat (Ashen Marches)",
        x: player.x + TILE * 6,
        y: player.y - TILE * 4,
        kind: "landmark",
      };
    }
    const toAshen = continentGateOnMap(map, "ashen-marches");
    if (toAshen) {
      return {
        label: "Gate to Needle Rat (Ashen Marches)",
        x: (toAshen.x + 0.5) * TILE,
        y: (toAshen.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    if (map.continentId !== "pale-wastes") {
      const home = continentGateOnMap(map, "thornreach");
      if (home) {
        return {
          label: "Gate toward Ashen Marches",
          x: (home.x + 0.5) * TILE,
          y: (home.y + 0.5) * TILE,
          kind: "landmark",
        };
      }
    }
    const toPale = continentGateOnMap(map, "pale-wastes");
    if (toPale) {
      return {
        label: "Gate toward Ashen Marches",
        x: (toPale.x + 0.5) * TILE,
        y: (toPale.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Needle Rat (Ashen Marches)",
      x: player.x + TILE * 6,
      y: player.y - TILE * 4,
      kind: "landmark",
    };
  }

  if (rook) {
    return {
      label: "Return to Rook",
      x: (rook.x + 0.5) * TILE,
      y: (rook.y + 0.5) * TILE,
      kind: "folk",
    };
  }
  const home = continentGateOnMap(map, "thornreach");
  if (home) {
    return {
      label: "Gate back to Rook (Thornreach)",
      x: (home.x + 0.5) * TILE,
      y: (home.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  const toPaleHome = continentGateOnMap(map, "pale-wastes");
  if (toPaleHome) {
    return {
      label: "Gate toward Rook (Pale Wastes)",
      x: (toPaleHome.x + 0.5) * TILE,
      y: (toPaleHome.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  return {
    label: "Return to Rook (Thornreach)",
    x: player.x + TILE * 8,
    y: player.y - TILE * 2,
    kind: "landmark",
  };
}

export function objectiveForEmbercoil(
  q: EmbercoilQuestProgress,
  player: { x: number; y: number },
  enemies: Enemy[],
  folk: FolkDef[],
  map: WorldMap,
): WayfindObjective | null {
  if (q.status !== "active") return null;
  const rook = folk.find((f) => f.id === "rook");

  if (!q.reachedEmbercoil) {
    const gate = continentGateOnMap(map, "embercoil");
    if (gate) {
      return {
        label: "Reach Embercoil gate",
        x: (gate.x + 0.5) * TILE,
        y: (gate.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    if (map.continentId !== "ashen-marches") {
      const toAshen = continentGateOnMap(map, "ashen-marches");
      if (toAshen) {
        return {
          label: "Gate to Embercoil (Ashen Marches)",
          x: (toAshen.x + 0.5) * TILE,
          y: (toAshen.y + 0.5) * TILE,
          kind: "landmark",
        };
      }
    }
    const toPale = continentGateOnMap(map, "pale-wastes");
    if (toPale) {
      return {
        label: "Gate to Embercoil (Pale Wastes)",
        x: (toPale.x + 0.5) * TILE,
        y: (toPale.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Embercoil gate (Ashen Marches)",
      x: player.x + TILE * 8,
      y: player.y - TILE * 2,
      kind: "landmark",
    };
  }

  if (!q.identifiedRat) {
    const rat = nearestEnemy(player, enemies, "needle-rat");
    if (rat) {
      return { label: "Identify Needle Rat", x: rat.x, y: rat.y, kind: "enemy" };
    }
    if (map.continentId === "embercoil" && map.kind === "overworld") {
      return {
        label: "Find Needle Rat (Embercoil)",
        x: player.x + TILE * 6,
        y: player.y - TILE * 4,
        kind: "landmark",
      };
    }
    const toEmber = continentGateOnMap(map, "embercoil");
    if (toEmber) {
      return {
        label: "Gate to Needle Rat (Embercoil)",
        x: (toEmber.x + 0.5) * TILE,
        y: (toEmber.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    if (map.continentId !== "ashen-marches") {
      const toAshen = continentGateOnMap(map, "ashen-marches");
      if (toAshen) {
        return {
          label: "Gate toward Embercoil",
          x: (toAshen.x + 0.5) * TILE,
          y: (toAshen.y + 0.5) * TILE,
          kind: "landmark",
        };
      }
    }
    const toPale = continentGateOnMap(map, "pale-wastes");
    if (toPale) {
      return {
        label: "Gate toward Embercoil",
        x: (toPale.x + 0.5) * TILE,
        y: (toPale.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Needle Rat (Embercoil)",
      x: player.x + TILE * 6,
      y: player.y - TILE * 4,
      kind: "landmark",
    };
  }

  if (!q.houndDone) {
    const hound = nearestEnemy(player, enemies, "bark-hound");
    if (hound) {
      return {
        label: "Defeat Bark Hound (0/1)",
        x: hound.x,
        y: hound.y,
        kind: "enemy",
      };
    }
    if (map.continentId === "embercoil" && map.kind === "overworld") {
      return {
        label: "Find Bark Hound (Embercoil)",
        x: player.x + TILE * 6,
        y: player.y - TILE * 4,
        kind: "landmark",
      };
    }
    const toEmber = continentGateOnMap(map, "embercoil");
    if (toEmber) {
      return {
        label: "Gate to Bark Hound (Embercoil)",
        x: (toEmber.x + 0.5) * TILE,
        y: (toEmber.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    if (map.continentId !== "ashen-marches") {
      const toAshen = continentGateOnMap(map, "ashen-marches");
      if (toAshen) {
        return {
          label: "Gate toward Embercoil",
          x: (toAshen.x + 0.5) * TILE,
          y: (toAshen.y + 0.5) * TILE,
          kind: "landmark",
        };
      }
    }
    const toPale = continentGateOnMap(map, "pale-wastes");
    if (toPale) {
      return {
        label: "Gate toward Embercoil",
        x: (toPale.x + 0.5) * TILE,
        y: (toPale.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Bark Hound (Embercoil)",
      x: player.x + TILE * 6,
      y: player.y - TILE * 4,
      kind: "landmark",
    };
  }

  if (rook) {
    return {
      label: "Return to Rook",
      x: (rook.x + 0.5) * TILE,
      y: (rook.y + 0.5) * TILE,
      kind: "folk",
    };
  }
  const home = continentGateOnMap(map, "thornreach");
  if (home) {
    return {
      label: "Gate back to Rook (Thornreach)",
      x: (home.x + 0.5) * TILE,
      y: (home.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  const toAshenHome = continentGateOnMap(map, "ashen-marches");
  if (toAshenHome) {
    return {
      label: "Gate toward Rook (Ashen Marches)",
      x: (toAshenHome.x + 0.5) * TILE,
      y: (toAshenHome.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  const toPaleHome = continentGateOnMap(map, "pale-wastes");
  if (toPaleHome) {
    return {
      label: "Gate toward Rook (Pale Wastes)",
      x: (toPaleHome.x + 0.5) * TILE,
      y: (toPaleHome.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  return {
    label: "Return to Rook (Thornreach)",
    x: player.x + TILE * 8,
    y: player.y - TILE * 2,
    kind: "landmark",
  };
}

export function objectiveForCoil(
  q: CoilQuestProgress,
  player: { x: number; y: number },
  enemies: Enemy[],
  folk: FolkDef[],
  map: WorldMap,
): WayfindObjective | null {
  if (q.status !== "active") return null;
  const rook = folk.find((f) => f.id === "rook");
  const onCoil = map.continentId === "embercoil" && map.kind === "overworld";

  if (!q.reachedCoil && !onCoil) {
    const gate = continentGateOnMap(map, "embercoil");
    if (gate) {
      return {
        label: "Reach Embercoil gate",
        x: (gate.x + 0.5) * TILE,
        y: (gate.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    if (map.continentId !== "ashen-marches") {
      const toAshen = continentGateOnMap(map, "ashen-marches");
      if (toAshen) {
        return {
          label: "Gate to Embercoil (Ashen Marches)",
          x: (toAshen.x + 0.5) * TILE,
          y: (toAshen.y + 0.5) * TILE,
          kind: "landmark",
        };
      }
    }
    const toPale = continentGateOnMap(map, "pale-wastes");
    if (toPale) {
      return {
        label: "Gate to Embercoil (Pale Wastes)",
        x: (toPale.x + 0.5) * TILE,
        y: (toPale.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Embercoil gate (Ashen Marches)",
      x: player.x + TILE * 8,
      y: player.y - TILE * 2,
      kind: "landmark",
    };
  }

  if (!q.identifiedVole) {
    if (onCoil) {
      const vole = nearestEnemy(player, enemies, "ash-vole");
      if (vole) {
        return { label: "Identify Ash-vole", x: vole.x, y: vole.y, kind: "enemy" };
      }
      return {
        label: "Find Ash-vole (Embercoil)",
        x: player.x + TILE * 6,
        y: player.y - TILE * 4,
        kind: "landmark",
      };
    }
    const toEmber = continentGateOnMap(map, "embercoil");
    if (toEmber) {
      return {
        label: "Gate to Ash-vole (Embercoil)",
        x: (toEmber.x + 0.5) * TILE,
        y: (toEmber.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    if (map.continentId !== "ashen-marches") {
      const toAshen = continentGateOnMap(map, "ashen-marches");
      if (toAshen) {
        return {
          label: "Gate toward Embercoil",
          x: (toAshen.x + 0.5) * TILE,
          y: (toAshen.y + 0.5) * TILE,
          kind: "landmark",
        };
      }
    }
    const toPale = continentGateOnMap(map, "pale-wastes");
    if (toPale) {
      return {
        label: "Gate toward Embercoil",
        x: (toPale.x + 0.5) * TILE,
        y: (toPale.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Ash-vole (Embercoil)",
      x: player.x + TILE * 6,
      y: player.y - TILE * 4,
      kind: "landmark",
    };
  }

  if (!q.foxDone) {
    if (onCoil) {
      const fox = nearestEnemy(player, enemies, "gorse-fox");
      if (fox) {
        return {
          label: "Defeat Gorse Fox (0/1)",
          x: fox.x,
          y: fox.y,
          kind: "enemy",
        };
      }
      return {
        label: "Find Gorse Fox (Embercoil)",
        x: player.x + TILE * 6,
        y: player.y - TILE * 4,
        kind: "landmark",
      };
    }
    const toEmber = continentGateOnMap(map, "embercoil");
    if (toEmber) {
      return {
        label: "Gate to Gorse Fox (Embercoil)",
        x: (toEmber.x + 0.5) * TILE,
        y: (toEmber.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    if (map.continentId !== "ashen-marches") {
      const toAshen = continentGateOnMap(map, "ashen-marches");
      if (toAshen) {
        return {
          label: "Gate toward Embercoil",
          x: (toAshen.x + 0.5) * TILE,
          y: (toAshen.y + 0.5) * TILE,
          kind: "landmark",
        };
      }
    }
    const toPale = continentGateOnMap(map, "pale-wastes");
    if (toPale) {
      return {
        label: "Gate toward Embercoil",
        x: (toPale.x + 0.5) * TILE,
        y: (toPale.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Gorse Fox (Embercoil)",
      x: player.x + TILE * 6,
      y: player.y - TILE * 4,
      kind: "landmark",
    };
  }

  if (rook) {
    return {
      label: "Return to Rook",
      x: (rook.x + 0.5) * TILE,
      y: (rook.y + 0.5) * TILE,
      kind: "folk",
    };
  }
  const home = continentGateOnMap(map, "thornreach");
  if (home) {
    return {
      label: "Gate back to Rook (Thornreach)",
      x: (home.x + 0.5) * TILE,
      y: (home.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  const toAshenHome = continentGateOnMap(map, "ashen-marches");
  if (toAshenHome) {
    return {
      label: "Gate toward Rook (Ashen Marches)",
      x: (toAshenHome.x + 0.5) * TILE,
      y: (toAshenHome.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  const toPaleHome = continentGateOnMap(map, "pale-wastes");
  if (toPaleHome) {
    return {
      label: "Gate toward Rook (Pale Wastes)",
      x: (toPaleHome.x + 0.5) * TILE,
      y: (toPaleHome.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  return {
    label: "Return to Rook (Thornreach)",
    x: player.x + TILE * 8,
    y: player.y - TILE * 2,
    kind: "landmark",
  };
}

export function objectiveForGreenGate(
  q: GreenGateQuestProgress,
  player: { x: number; y: number },
  enemies: Enemy[],
  folk: FolkDef[],
  map: WorldMap,
): WayfindObjective | null {
  if (q.status !== "active") return null;
  const rook = folk.find((f) => f.id === "rook");

  if (!q.gateReached) {
    const gate = continentGateOnMap(map, "verdant-spine");
    if (gate) {
      return {
        label: "Reach Verdant Spine gate",
        x: (gate.x + 0.5) * TILE,
        y: (gate.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const home = continentGateOnMap(map, "thornreach");
    if (home) {
      return {
        label: "Gate to Verdant Spine (Thornreach)",
        x: (home.x + 0.5) * TILE,
        y: (home.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Verdant Spine gate (Thornreach)",
      x: player.x + TILE * 8,
      y: player.y - TILE * 2,
      kind: "landmark",
    };
  }

  if (!q.identifiedFox || !q.foxKilled) {
    const fox = nearestEnemy(player, enemies, "gorse-fox");
    if (fox) {
      const label = !q.identifiedFox
        ? "Identify Gorse Fox"
        : "Defeat Gorse Fox (0/1)";
      return { label, x: fox.x, y: fox.y, kind: "enemy" };
    }
    if (map.continentId === "verdant-spine" && map.kind === "overworld") {
      return {
        label: "Find Gorse Fox (Verdant Spine)",
        x: player.x + TILE * 6,
        y: player.y - TILE * 4,
        kind: "landmark",
      };
    }
    const toSpine = continentGateOnMap(map, "verdant-spine");
    if (toSpine) {
      return {
        label: "Gate to Gorse Fox (Verdant Spine)",
        x: (toSpine.x + 0.5) * TILE,
        y: (toSpine.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const home = continentGateOnMap(map, "thornreach");
    if (home) {
      return {
        label: "Gate toward Verdant Spine",
        x: (home.x + 0.5) * TILE,
        y: (home.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Gorse Fox (Verdant Spine)",
      x: player.x + TILE * 6,
      y: player.y - TILE * 4,
      kind: "landmark",
    };
  }

  if (rook) {
    return {
      label: "Return to Rook",
      x: (rook.x + 0.5) * TILE,
      y: (rook.y + 0.5) * TILE,
      kind: "folk",
    };
  }
  const home = continentGateOnMap(map, "thornreach");
  if (home) {
    return {
      label: "Gate back to Rook (Thornreach)",
      x: (home.x + 0.5) * TILE,
      y: (home.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  return {
    label: "Return to Rook (Thornreach)",
    x: player.x + TILE * 8,
    y: player.y - TILE * 2,
    kind: "landmark",
  };
}

export function objectiveForWharf(
  q: WharfQuestProgress,
  player: { x: number; y: number },
  enemies: Enemy[],
  folk: FolkDef[],
  map: WorldMap,
): WayfindObjective | null {
  if (q.status !== "active") return null;
  const rook = folk.find((f) => f.id === "rook");
  const cress = folk.find((f) => f.id === CRESS_FOLK_ID);
  const vesper = folk.find((f) => f.id === VESPER_FOLK_ID);

  if (!q.talkedCress) {
    if (cress) {
      return {
        label: "Talk to Cress (ledger)",
        x: (cress.x + 0.5) * TILE,
        y: (cress.y + 0.5) * TILE,
        kind: "folk",
      };
    }
    const home = continentGateOnMap(map, "thornreach");
    if (home) {
      return {
        label: "Gate to Cress (Thornreach depot)",
        x: (home.x + 0.5) * TILE,
        y: (home.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const toMist = continentGateOnMap(map, "mistmere");
    if (toMist) {
      return {
        label: "Gate toward Cress (Mistmere)",
        x: (toMist.x + 0.5) * TILE,
        y: (toMist.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const wharfHome = dockOnMap(map, NIGHTGLASS_WHARF_DOCK_ID);
    if (wharfHome) {
      return {
        label: "Sail toward Cress (Mistmere)",
        x: (wharfHome.x + 0.5) * TILE,
        y: (wharfHome.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Cress at Thornreach depot",
      x: player.x + TILE * 4,
      y: player.y + TILE * 2,
      kind: "landmark",
    };
  }

  if (!q.talkedVesper) {
    if (vesper) {
      return {
        label: "Talk to Captain Vesper",
        x: (vesper.x + 0.5) * TILE,
        y: (vesper.y + 0.5) * TILE,
        kind: "folk",
      };
    }
    const wharf = dockOnMap(map, NIGHTGLASS_WHARF_DOCK_ID);
    if (wharf) {
      return {
        label: "Nightglass Wharf / Vesper",
        x: (wharf.x + 0.5) * TILE,
        y: (wharf.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const toNight = continentGateOnMap(map, "nightglass-coast");
    if (toNight) {
      return {
        label: "Gate to Nightglass Coast",
        x: (toNight.x + 0.5) * TILE,
        y: (toNight.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const coastal = dockTowardContinent(map, "nightglass-coast");
    if (coastal) {
      return {
        label: `Sail ${coastal.name} → Nightglass`,
        x: (coastal.x + 0.5) * TILE,
        y: (coastal.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const toMist = continentGateOnMap(map, "mistmere");
    if (toMist) {
      return {
        label: "Mistmere gate / coastal dock",
        x: (toMist.x + 0.5) * TILE,
        y: (toMist.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Mistmere gate (Nightglass)",
      x: player.x + TILE * 8,
      y: player.y - TILE * 2,
      kind: "landmark",
    };
  }

  if (!q.houndDone) {
    const hound = nearestEnemy(player, enemies, "bark-hound");
    if (hound) {
      return {
        label: "Defeat Bark Hound (0/1)",
        x: hound.x,
        y: hound.y,
        kind: "enemy",
      };
    }
    if (map.continentId === "nightglass-coast" && map.kind === "overworld") {
      return {
        label: "Find Bark Hound (Nightglass Coast)",
        x: player.x + TILE * 6,
        y: player.y - TILE * 4,
        kind: "landmark",
      };
    }
    const toNight = continentGateOnMap(map, "nightglass-coast");
    if (toNight) {
      return {
        label: "Gate to Bark Hound (Nightglass)",
        x: (toNight.x + 0.5) * TILE,
        y: (toNight.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const coastal = dockTowardContinent(map, "nightglass-coast");
    if (coastal) {
      return {
        label: "Sail to Bark Hound (Nightglass)",
        x: (coastal.x + 0.5) * TILE,
        y: (coastal.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const toMist = continentGateOnMap(map, "mistmere");
    if (toMist) {
      return {
        label: "Mistmere gate / coastal dock",
        x: (toMist.x + 0.5) * TILE,
        y: (toMist.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Bark Hound (Nightglass Coast)",
      x: player.x + TILE * 6,
      y: player.y - TILE * 4,
      kind: "landmark",
    };
  }

  if (rook) {
    return {
      label: "Return to Rook",
      x: (rook.x + 0.5) * TILE,
      y: (rook.y + 0.5) * TILE,
      kind: "folk",
    };
  }
  const home = continentGateOnMap(map, "thornreach");
  if (home) {
    return {
      label: "Gate back to Rook (Thornreach)",
      x: (home.x + 0.5) * TILE,
      y: (home.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  const toMistHome = continentGateOnMap(map, "mistmere");
  if (toMistHome) {
    return {
      label: "Gate toward Rook (Mistmere)",
      x: (toMistHome.x + 0.5) * TILE,
      y: (toMistHome.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  const wharfHome = dockOnMap(map, NIGHTGLASS_WHARF_DOCK_ID);
  if (wharfHome) {
    return {
      label: "Sail toward Rook (Mistmere)",
      x: (wharfHome.x + 0.5) * TILE,
      y: (wharfHome.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  const landingHome = dockOnMap(map, CHOIR_LANDING_DOCK_ID);
  if (landingHome) {
    return {
      label: "Sail toward Rook (Mistmere)",
      x: (landingHome.x + 0.5) * TILE,
      y: (landingHome.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  return {
    label: "Return to Rook (Thornreach)",
    x: player.x + TILE * 8,
    y: player.y - TILE * 2,
    kind: "landmark",
  };
}

export function objectiveForChoirCounts(
  q: ChoirCountsQuestProgress,
  player: { x: number; y: number },
  folk: FolkDef[],
  map: WorldMap,
): WayfindObjective | null {
  if (q.status !== "active") return null;
  const rook = folk.find((f) => f.id === "rook");
  const reed = folk.find((f) => f.id === OLD_REED_FOLK_ID);
  const keeper = folk.find((f) => f.id === CHOIR_KEEPER_FOLK_ID);

  if (!q.talkedOldReed) {
    if (reed) {
      return {
        label: "Talk to Old Reed",
        x: (reed.x + 0.5) * TILE,
        y: (reed.y + 0.5) * TILE,
        kind: "folk",
      };
    }
    const gate = continentGateOnMap(map, "mistmere");
    if (gate) {
      return {
        label: "Cross Mistmere gate",
        x: (gate.x + 0.5) * TILE,
        y: (gate.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Mistmere gate (Thornreach)",
      x: player.x + TILE * 8,
      y: player.y - TILE * 2,
      kind: "landmark",
    };
  }

  if (!q.reachedChoir) {
    if (keeper) {
      return {
        label: "Talk to Choir Keeper",
        x: (keeper.x + 0.5) * TILE,
        y: (keeper.y + 0.5) * TILE,
        kind: "folk",
      };
    }
    const landing = dockOnMap(map, CHOIR_LANDING_DOCK_ID);
    if (landing) {
      return {
        label: "Choir Landing",
        x: (landing.x + 0.5) * TILE,
        y: (landing.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const pier = dockOnMap(map, MISTMERE_PIER_DOCK_ID);
    if (pier) {
      return {
        label: "Board Mistmere Pier",
        x: (pier.x + 0.5) * TILE,
        y: (pier.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const toMist = continentGateOnMap(map, "mistmere");
    if (toMist) {
      return {
        label: "Gate to Mistmere Pier",
        x: (toMist.x + 0.5) * TILE,
        y: (toMist.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Mistmere Pier",
      x: player.x + TILE * 8,
      y: player.y + TILE * 4,
      kind: "landmark",
    };
  }

  if (!q.talkedChoirKeeper) {
    if (keeper) {
      return {
        label: "Talk to Choir Keeper",
        x: (keeper.x + 0.5) * TILE,
        y: (keeper.y + 0.5) * TILE,
        kind: "folk",
      };
    }
    const landing = dockOnMap(map, CHOIR_LANDING_DOCK_ID);
    if (landing) {
      return {
        label: "Choir Landing / Choir Keeper",
        x: (landing.x + 0.5) * TILE,
        y: (landing.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const pier = dockOnMap(map, MISTMERE_PIER_DOCK_ID);
    if (pier) {
      return {
        label: "Sail to Choir Landing",
        x: (pier.x + 0.5) * TILE,
        y: (pier.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    const toMist = continentGateOnMap(map, "mistmere");
    if (toMist) {
      return {
        label: "Gate to Mistmere Pier",
        x: (toMist.x + 0.5) * TILE,
        y: (toMist.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Choir Keeper (Choir Landing)",
      x: player.x + TILE * 6,
      y: player.y,
      kind: "landmark",
    };
  }

  if (rook) {
    return {
      label: "Return to Rook",
      x: (rook.x + 0.5) * TILE,
      y: (rook.y + 0.5) * TILE,
      kind: "folk",
    };
  }
  const home = continentGateOnMap(map, "thornreach");
  if (home) {
    return {
      label: "Gate back to Rook (Thornreach)",
      x: (home.x + 0.5) * TILE,
      y: (home.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  const toMistHome = continentGateOnMap(map, "mistmere");
  if (toMistHome) {
    return {
      label: "Gate toward Rook (Mistmere)",
      x: (toMistHome.x + 0.5) * TILE,
      y: (toMistHome.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  const landingHome = dockOnMap(map, CHOIR_LANDING_DOCK_ID);
  if (landingHome) {
    return {
      label: "Sail toward Rook (Mistmere)",
      x: (landingHome.x + 0.5) * TILE,
      y: (landingHome.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  return {
    label: "Return to Rook (Thornreach)",
    x: player.x + TILE * 8,
    y: player.y - TILE * 2,
    kind: "landmark",
  };
}

export function objectiveForWatchline(
  q: WatchlineQuestProgress,
  player: { x: number; y: number },
  enemies: Enemy[],
  folk: FolkDef[],
  map: WorldMap,
): WayfindObjective | null {
  if (q.status !== "active") return null;
  const rook = folk.find((f) => f.id === "rook");
  const cress = folk.find((f) => f.id === CRESS_FOLK_ID);

  if (!q.talkedCress) {
    if (cress) {
      return {
        label: "Talk to Cress (ledger)",
        x: (cress.x + 0.5) * TILE,
        y: (cress.y + 0.5) * TILE,
        kind: "folk",
      };
    }
    const home = continentGateOnMap(map, "thornreach");
    if (home) {
      return {
        label: "Gate to Cress (Thornreach depot)",
        x: (home.x + 0.5) * TILE,
        y: (home.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Cress at Thornreach depot",
      x: player.x + TILE * 4,
      y: player.y + TILE * 2,
      kind: "landmark",
    };
  }

  if (!q.cairnInspected) {
    const cairn = ASHWOOD_CAIRNS.find((c) => c.id === WATCHLINE_CAIRN_ID);
    if (cairn && map.continentId === cairn.continentId && map.kind === "overworld") {
      return {
        label: "Recheck West Watch cairn",
        x: (cairn.x + 0.5) * TILE,
        y: (cairn.y + 0.5) * TILE,
        kind: "cairn",
      };
    }
    const home = continentGateOnMap(map, "thornreach");
    if (home) {
      return {
        label: "Gate to West Watch (Thornreach)",
        x: (home.x + 0.5) * TILE,
        y: (home.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find West Watch cairn (ashwood edge)",
      x: player.x - TILE * 6,
      y: player.y - TILE * 4,
      kind: "landmark",
    };
  }

  if (!q.houndDone) {
    const hound = nearestEnemy(player, enemies, "bark-hound");
    if (hound) {
      return {
        label: "Identify or clear Bark Hound",
        x: hound.x,
        y: hound.y,
        kind: "enemy",
      };
    }
    const ashwood = cairnPixel("ashwood-edge", player.x + TILE * 6, player.y);
    if (map.continentId === "thornreach" && map.kind === "overworld") {
      return {
        label: "Find Bark Hound (Ashwood Edge)",
        x: ashwood.x,
        y: ashwood.y,
        kind: "landmark",
      };
    }
    const home = continentGateOnMap(map, "thornreach");
    if (home) {
      return {
        label: "Gate to Bark Hound (Ashwood Edge)",
        x: (home.x + 0.5) * TILE,
        y: (home.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Bark Hound (Ashwood Edge)",
      x: ashwood.x,
      y: ashwood.y,
      kind: "landmark",
    };
  }

  if (rook) {
    return {
      label: "Return to Rook",
      x: (rook.x + 0.5) * TILE,
      y: (rook.y + 0.5) * TILE,
      kind: "folk",
    };
  }
  const home = continentGateOnMap(map, "thornreach");
  if (home) {
    return {
      label: "Gate back to Rook (Thornreach)",
      x: (home.x + 0.5) * TILE,
      y: (home.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  return {
    label: "Return to Rook (Thornreach)",
    x: player.x + TILE * 8,
    y: player.y - TILE * 2,
    kind: "landmark",
  };
}

export function objectiveForAshveil(
  q: AshveilQuestProgress,
  player: { x: number; y: number },
  enemies: Enemy[],
  folk: FolkDef[],
  map: WorldMap,
): WayfindObjective | null {
  if (q.status !== "active") return null;
  const rook = folk.find((f) => f.id === "rook");

  if (!q.reachedChamber) {
    if (map.kind === "hollow") {
      if (map.bossChamber) {
        return {
          label: "Reach Ashveil chamber",
          x: (map.bossChamber.x + 0.5) * TILE,
          y: (map.bossChamber.y + 0.5) * TILE,
          kind: "landmark",
        };
      }
      return {
        label: "Seek Ashveil chamber (deep)",
        x: player.x + TILE * 3,
        y: player.y,
        kind: "landmark",
      };
    }
    if (map.continentId === "thornreach") {
      const hollow = nearestHollowEntrance(player, map);
      if (hollow) {
        return {
          label: "Enter Thornreach hollow (Ashveil)",
          x: (hollow.x + 0.5) * TILE,
          y: (hollow.y + 0.5) * TILE,
          kind: "landmark",
        };
      }
    }
    const home = continentGateOnMap(map, "thornreach");
    if (home) {
      return {
        label: "Gate to Thornreach hollows",
        x: (home.x + 0.5) * TILE,
        y: (home.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find a Thornreach hollow",
      x: player.x + TILE * 6,
      y: player.y - TILE * 2,
      kind: "landmark",
    };
  }

  if (!q.identifiedEmber || !q.emberKilled) {
    const ember = nearestEnemy(player, enemies, "ashveil-ember");
    if (ember) {
      const label = !q.identifiedEmber
        ? "Identify Ashveil Ember"
        : "Defeat Ashveil Ember (0/1)";
      return { label, x: ember.x, y: ember.y, kind: "enemy" };
    }
    if (map.kind === "hollow" && map.bossChamber) {
      return {
        label: !q.identifiedEmber
          ? "Seek Ashveil Ember (chamber)"
          : "Defeat Ashveil Ember (chamber)",
        x: (map.bossChamber.x + 0.5) * TILE,
        y: (map.bossChamber.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    if (map.kind !== "hollow") {
      if (map.continentId === "thornreach") {
        const hollow = nearestHollowEntrance(player, map);
        if (hollow) {
          return {
            label: "Return to hollow (Ashveil Ember)",
            x: (hollow.x + 0.5) * TILE,
            y: (hollow.y + 0.5) * TILE,
            kind: "landmark",
          };
        }
      }
      const homeGate = continentGateOnMap(map, "thornreach");
      if (homeGate) {
        return {
          label: "Gate to Thornreach hollows",
          x: (homeGate.x + 0.5) * TILE,
          y: (homeGate.y + 0.5) * TILE,
          kind: "landmark",
        };
      }
    }
    return {
      label: "Seek Ashveil Ember deeper in",
      x: player.x + TILE * 3,
      y: player.y,
      kind: "landmark",
    };
  }

  if (rook) {
    return {
      label: "Return to Rook",
      x: (rook.x + 0.5) * TILE,
      y: (rook.y + 0.5) * TILE,
      kind: "folk",
    };
  }
  const home = continentGateOnMap(map, "thornreach");
  if (home) {
    return {
      label: "Gate back to Rook (Thornreach)",
      x: (home.x + 0.5) * TILE,
      y: (home.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  return {
    label: "Return to Rook (Thornreach)",
    x: player.x + TILE * 8,
    y: player.y - TILE * 2,
    kind: "landmark",
  };
}

export function objectiveForGateWatch(
  q: GateWatchQuestProgress,
  player: { x: number; y: number },
  folk: FolkDef[],
  map: WorldMap,
): WayfindObjective | null {
  if (q.status !== "active") return null;
  const rook = folk.find((f) => f.id === "rook");

  if (!q.gateReached) {
    const gate = mistmereGateOnMap(map);
    if (gate) {
      return {
        label: "Reach Mistmere gate",
        x: (gate.x + 0.5) * TILE,
        y: (gate.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Mistmere gate (Thornreach)",
      x: player.x + TILE * 8,
      y: player.y - TILE * 2,
      kind: "landmark",
    };
  }

  if (rook) {
    return {
      label: "Return to Rook",
      x: (rook.x + 0.5) * TILE,
      y: (rook.y + 0.5) * TILE,
      kind: "folk",
    };
  }
  return null;
}

export function objectiveForMistmere(
  q: MistmereQuestProgress,
  player: { x: number; y: number },
  folk: FolkDef[],
  map: WorldMap,
): WayfindObjective | null {
  if (q.status !== "active") return null;
  const rook = folk.find((f) => f.id === "rook");
  const reed = folk.find((f) => f.id === "old-reed");

  if (!q.talkedOldReed) {
    if (reed) {
      return {
        label: "Talk to Old Reed",
        x: (reed.x + 0.5) * TILE,
        y: (reed.y + 0.5) * TILE,
        kind: "folk",
      };
    }
    const gate = mistmereGateOnMap(map);
    if (gate) {
      return {
        label: "Travel to Mistmere",
        x: (gate.x + 0.5) * TILE,
        y: (gate.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find Mistmere gate (Thornreach)",
      x: player.x + TILE * 8,
      y: player.y - TILE * 2,
      kind: "landmark",
    };
  }

  if (rook) {
    return {
      label: "Return to Rook",
      x: (rook.x + 0.5) * TILE,
      y: (rook.y + 0.5) * TILE,
      kind: "folk",
    };
  }
  const home = continentGateOnMap(map, "thornreach");
  if (home) {
    return {
      label: "Gate back to Rook (Thornreach)",
      x: (home.x + 0.5) * TILE,
      y: (home.y + 0.5) * TILE,
      kind: "landmark",
    };
  }
  return {
    label: "Return to Rook (Thornreach)",
    x: player.x + TILE * 8,
    y: player.y - TILE * 2,
    kind: "landmark",
  };
}

function mistmereGateOnMap(
  map: WorldMap,
): { x: number; y: number } | null {
  return continentGateOnMap(map, "mistmere");
}

function continentGateOnMap(
  map: WorldMap,
  targetContinentId: string,
): { x: number; y: number } | null {
  if (!map.gates || map.gates.length === 0) return null;
  const g = map.gates.find((x) => x.targetContinentId === targetContinentId);
  return g ? { x: g.x, y: g.y } : null;
}

function dockOnMap(
  map: WorldMap,
  dockId: string,
): { x: number; y: number } | null {
  if (map.kind !== "overworld") return null;
  const dock = getDock(dockId);
  if (!dock || dock.continentId !== map.continentId) return null;
  return { x: dock.x, y: dock.y };
}

function dockTowardContinent(
  map: WorldMap,
  destContinentId: ContinentId,
): { id: string; name: string; x: number; y: number } | null {
  if (map.kind !== "overworld") return null;
  const dock = docksOnContinent(map.continentId).find((d) =>
    d.destinations.includes(destContinentId),
  );
  return dock
    ? { id: dock.id, name: dock.name, x: dock.x, y: dock.y }
    : null;
}

export function objectiveForHollow(
  q: HollowQuestProgress,
  player: { x: number; y: number },
  enemies: Enemy[],
  folk: FolkDef[],
  map: WorldMap,
): WayfindObjective | null {
  if (q.status !== "active") return null;
  const rook = folk.find((f) => f.id === "rook");

  if (!q.enteredHollow) {
    if (map.kind === "hollow") {
      return {
        label: "Seek Shade Wisps (hollow)",
        x: player.x,
        y: player.y,
        kind: "landmark",
      };
    }
    const hollow = nearestHollowEntrance(player, map);
    if (hollow) {
      return {
        label: "Enter Thornreach hollow",
        x: (hollow.x + 0.5) * TILE,
        y: (hollow.y + 0.5) * TILE,
        kind: "landmark",
      };
    }
    return {
      label: "Find a hollow entrance",
      x: player.x + TILE * 6,
      y: player.y - TILE * 2,
      kind: "landmark",
    };
  }

  if (!q.identifiedWisp || q.wispsKilled < HOLLOW_WISPS_NEEDED) {
    const wisp = nearestEnemy(player, enemies, "shade-wisp");
    if (wisp) {
      const label = !q.identifiedWisp
        ? "Identify Shade Wisp"
        : `Defeat Shade Wisp (${q.wispsKilled}/${HOLLOW_WISPS_NEEDED})`;
      return { label, x: wisp.x, y: wisp.y, kind: "enemy" };
    }
    if (map.kind !== "hollow") {
      const hollow = nearestHollowEntrance(player, map);
      if (hollow) {
        return {
          label: "Return to hollow (wisps)",
          x: (hollow.x + 0.5) * TILE,
          y: (hollow.y + 0.5) * TILE,
          kind: "landmark",
        };
      }
    }
    return {
      label: "Seek Shade Wisps deeper in",
      x: player.x + TILE * 3,
      y: player.y,
      kind: "landmark",
    };
  }

  if (rook) {
    return {
      label: "Return to Rook",
      x: (rook.x + 0.5) * TILE,
      y: (rook.y + 0.5) * TILE,
      kind: "folk",
    };
  }
  return null;
}

export function objectiveForAshwood(
  q: AshwoodQuestProgress,
  player: { x: number; y: number },
  enemies: Enemy[],
  folk: FolkDef[],
): WayfindObjective | null {
  if (q.status !== "active") return null;
  const rook = folk.find((f) => f.id === "rook");
  const nextCairn = ASHWOOD_CAIRNS.find((c) => !q.cairnsVisited.includes(c.id));
  if (nextCairn) {
    return {
      label: `Inspect ${nextCairn.name} (${q.cairnsVisited.length}/${ASHWOOD_CAIRNS_NEEDED})`,
      x: (nextCairn.x + 0.5) * TILE,
      y: (nextCairn.y + 0.5) * TILE,
      kind: "cairn",
    };
  }
  if (!q.wrongPreyDone) {
    const rat = nearestEnemy(player, enemies, "needle-rat");
    if (rat) return { label: "Wrong prey · Needle Rat", x: rat.x, y: rat.y, kind: "enemy" };
    const hound = nearestEnemy(player, enemies, "bark-hound");
    if (hound) return { label: "Wrong prey · Bark Hound", x: hound.x, y: hound.y, kind: "enemy" };
    return {
      label: "Find wrong prey (ashwood)",
      x: player.x + TILE * 6,
      y: player.y - TILE * 2,
      kind: "landmark",
    };
  }
  if (rook) {
    return {
      label: "Return to Rook",
      x: (rook.x + 0.5) * TILE,
      y: (rook.y + 0.5) * TILE,
      kind: "folk",
    };
  }
  return null;
}

export function objectiveForTeeth(
  q: TeethQuestProgress,
  player: { x: number; y: number },
  enemies: Enemy[],
  folk: FolkDef[],
): WayfindObjective | null {
  if (q.status !== "active") return null;
  const rook = folk.find((f) => f.id === "rook");
  if (!q.identifiedRat) {
    const rat = nearestEnemy(player, enemies, "needle-rat");
    if (rat) return { label: "Identify Needle Rat", x: rat.x, y: rat.y, kind: "enemy" };
    if (rook) {
      return {
        label: "Talk to Rook (watch)",
        x: (rook.x + 0.5) * TILE,
        y: (rook.y + 0.5) * TILE,
        kind: "folk",
      };
    }
  }
  if (q.ratsKilled < TEETH_RATS_NEEDED) {
    const rat = nearestEnemy(player, enemies, "needle-rat");
    if (rat) {
      return {
        label: `Defeat Needle Rat (${q.ratsKilled}/${TEETH_RATS_NEEDED})`,
        x: rat.x,
        y: rat.y,
        kind: "enemy",
      };
    }
    const ashwood = cairnPixel("ashwood-edge", player.x + TILE * 6, player.y);
    return {
      label: "Hunt Needle Rats (Ashwood Edge · Rec. 2–4)",
      x: ashwood.x,
      y: ashwood.y,
      kind: "landmark",
    };
  }
  if (!q.houndDone) {
    const hound = nearestEnemy(player, enemies, "bark-hound");
    if (hound) return { label: "Survive Bark Hound", x: hound.x, y: hound.y, kind: "enemy" };
    const north = cairnPixel("north-ashwood", player.x + TILE * 8, player.y - TILE * 2);
    return {
      label: "Find Bark Hound (North Ashwood · Rec. 3–5)",
      x: north.x,
      y: north.y,
      kind: "landmark",
    };
  }
  if (rook) {
    return {
      label: "Return to Rook",
      x: (rook.x + 0.5) * TILE,
      y: (rook.y + 0.5) * TILE,
      kind: "folk",
    };
  }
  return null;
}

function nearestHollowEntrance(
  player: { x: number; y: number },
  map: WorldMap,
): { x: number; y: number } | null {
  if (!map.hollows || map.hollows.length === 0) return null;
  let best: { x: number; y: number } | null = null;
  let bestD = Infinity;
  for (const h of map.hollows) {
    const hx = (h.x + 0.5) * TILE;
    const hy = (h.y + 0.5) * TILE;
    const d = Math.hypot(hx - player.x, hy - player.y);
    if (d < bestD) {
      bestD = d;
      best = { x: h.x, y: h.y };
    }
  }
  return best;
}

function nearestEnemy(
  player: { x: number; y: number },
  enemies: Enemy[],
  kindId: string,
): Enemy | null {
  let best: Enemy | null = null;
  let bestD = Infinity;
  for (const e of enemies) {
    if (e.hp <= 0) continue;
    if (e.kind.id !== kindId) continue;
    const d = Math.hypot(e.x - player.x, e.y - player.y);
    if (d < bestD) {
      bestD = d;
      best = e;
    }
  }
  return best;
}

function cairnPixel(
  zoneId: string,
  fallbackX: number,
  fallbackY: number,
): { x: number; y: number } {
  const zone = huntZoneById(zoneId);
  if (!zone) return { x: fallbackX, y: fallbackY };
  return { x: (zone.cairn.x + 0.5) * TILE, y: (zone.cairn.y + 0.5) * TILE };
}

export function tilesAway(
  player: { x: number; y: number },
  target: { x: number; y: number },
): number {
  return Math.max(
    0,
    Math.round(Math.hypot(target.x - player.x, target.y - player.y) / TILE),
  );
}
