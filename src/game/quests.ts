/** Sticky quests - First Story Accession hunts on Thornreach. */

import type { ContinentId } from "@/game/continents";
import type { EnemyKindId } from "@/game/enemies";
import type { SkillId } from "@/game/skills";
import { getActiveQuestKey, GUEST_QUEST_KEY } from "@/account/storageScope";
import { ASHWOOD_CAIRN_IDS } from "@/game/cairns";

/** Guest key (offline). Active play uses getActiveQuestKey(). */
export const QUEST_STORAGE_KEY = GUEST_QUEST_KEY;

export const TEETH_QUEST_ID = "teeth-in-the-grass" as const;
export const ASHWOOD_QUEST_ID = "ashwood-watch" as const;
export const HOLLOW_QUEST_ID = "hollow-watch" as const;
export const GATE_QUEST_ID = "gate-watch" as const;
export const MISTMERE_QUEST_ID = "mistmere-crossing" as const;
export const WATCHLINE_QUEST_ID = "the-watchline-holds" as const;
export const ASHVEIL_QUEST_ID = "ashveil-under-the-watchline" as const;
export const CHOIR_COUNTS_QUEST_ID = "the-choir-counts" as const;
export const WHARF_QUEST_ID = "the-wharf-answers" as const;
export const GREEN_GATE_QUEST_ID = "the-green-gate-keeps" as const;

/** Depot clerk — Cress Ledger in folk.ts. */
export const CRESS_FOLK_ID = "cress-ledger" as const;
/** Mistmere reed-path guide — Old Reed in folk.ts. */
export const OLD_REED_FOLK_ID = "old-reed" as const;
/** Sunken Choir shopkeep — Choir Keeper in folk.ts. */
export const CHOIR_KEEPER_FOLK_ID = "choir-keeper" as const;
/** Nightglass Wharf captain — Captain Vesper in folk.ts. */
export const VESPER_FOLK_ID = "nightglass-pilot" as const;
/** Mistmere Pier dock — sail to Sunken Choir. */
export const MISTMERE_PIER_DOCK_ID = "mistmere-pier" as const;
/** Choir Landing dock on Sunken Choir. */
export const CHOIR_LANDING_DOCK_ID = "choir-landing" as const;
/** Nightglass Wharf dock on Nightglass Coast. */
export const NIGHTGLASS_WHARF_DOCK_ID = "nightglass-wharf" as const;
/** First Ashwood Watch cairn (West Watch) — recheck on the ashwood edge. */
export const WATCHLINE_CAIRN_ID = "cairn-west" as const;

export type QuestId =
  | typeof TEETH_QUEST_ID
  | typeof ASHWOOD_QUEST_ID
  | typeof HOLLOW_QUEST_ID
  | typeof GATE_QUEST_ID
  | typeof MISTMERE_QUEST_ID
  | typeof WATCHLINE_QUEST_ID
  | typeof ASHVEIL_QUEST_ID
  | typeof CHOIR_COUNTS_QUEST_ID
  | typeof WHARF_QUEST_ID
  | typeof GREEN_GATE_QUEST_ID;

export type QuestStatus = "active" | "complete";

export interface TeethQuestProgress {
  id: typeof TEETH_QUEST_ID;
  status: QuestStatus;
  /** First successful Identify of a Needle Rat (near-field look). */
  identifiedRat: boolean;
  /** Needle Rats defeated (target 3). */
  ratsKilled: number;
  /** Bark Hound killed or driven off. */
  houndDone: boolean;
}

export interface AshwoodQuestProgress {
  id: typeof ASHWOOD_QUEST_ID;
  status: QuestStatus;
  /** Inspected cairn ids (need all 3). */
  cairnsVisited: string[];
  /** Identify or kill 1 Needle Rat / Bark Hound after at least 1 cairn. */
  wrongPreyDone: boolean;
}

export interface HollowQuestProgress {
  id: typeof HOLLOW_QUEST_ID;
  status: QuestStatus;
  /** Entered any Thornreach hollow (hollowIndex set). */
  enteredHollow: boolean;
  /** First successful Identify of a Shade Wisp. */
  identifiedWisp: boolean;
  /** Shade Wisps defeated (target 2). */
  wispsKilled: number;
}

export interface GateWatchQuestProgress {
  id: typeof GATE_QUEST_ID;
  status: QuestStatus;
  /** Reached Mistmere gate (travel or stand/interact on mistmere-bound gate). */
  gateReached: boolean;
}

export interface MistmereQuestProgress {
  id: typeof MISTMERE_QUEST_ID;
  status: QuestStatus;
  /** Arrived on Mistmere via the known gate. */
  reachedMistmere: boolean;
  /** Talked to Old Reed on Mistmere. */
  talkedOldReed: boolean;
}

export interface WatchlineQuestProgress {
  id: typeof WATCHLINE_QUEST_ID;
  status: QuestStatus;
  /** Talked to Cress Ledger at the Thornreach depot. */
  talkedCress: boolean;
  /** Rechecked the first Ashwood Watch cairn (West Watch). */
  cairnInspected: boolean;
  /** Identified or cleared 1 Bark Hound. */
  houndDone: boolean;
}

export interface AshveilQuestProgress {
  id: typeof ASHVEIL_QUEST_ID;
  status: QuestStatus;
  /** Reached the marked Ashveil chamber in a Thornreach hollow. */
  reachedChamber: boolean;
  /** First successful Identify of the Ashveil Ember. */
  identifiedEmber: boolean;
  /** Ashveil Ember defeated (target 1). */
  emberKilled: boolean;
}

export interface ChoirCountsQuestProgress {
  id: typeof CHOIR_COUNTS_QUEST_ID;
  status: QuestStatus;
  /** Crossed Thornreach → Mistmere (gate or arrival). */
  reachedMistmere: boolean;
  /** Talked to Old Reed on the reed-path. */
  talkedOldReed: boolean;
  /** Sailed Mistmere Pier → Sunken Choir (or arrived at Choir Landing). */
  reachedChoir: boolean;
  /** Talked to Choir Keeper at Choir Landing. */
  talkedChoirKeeper: boolean;
}

export interface WharfQuestProgress {
  id: typeof WHARF_QUEST_ID;
  status: QuestStatus;
  /** Talked to Cress Ledger — Choir rumor entered in the depot ledger (flag only). */
  talkedCress: boolean;
  /** Arrived on Nightglass Coast (gate, ship, or stand). */
  reachedNightglass: boolean;
  /** Talked to Captain Vesper (nightglass-pilot) at Nightglass Wharf. */
  talkedVesper: boolean;
  /** Defeated 1 Bark Hound on Nightglass Coast. */
  houndDone: boolean;
}

export interface GreenGateQuestProgress {
  id: typeof GREEN_GATE_QUEST_ID;
  status: QuestStatus;
  /** Reached Verdant Spine gate (travel or stand/interact on verdant-spine-bound gate). */
  gateReached: boolean;
  /** First successful Identify of a Gorse Fox on Verdant Spine. */
  identifiedFox: boolean;
  /** Gorse Fox defeated on Verdant Spine (target 1). */
  foxKilled: boolean;
}

export type QuestLog = {
  [TEETH_QUEST_ID]?: TeethQuestProgress;
  [ASHWOOD_QUEST_ID]?: AshwoodQuestProgress;
  [HOLLOW_QUEST_ID]?: HollowQuestProgress;
  [GATE_QUEST_ID]?: GateWatchQuestProgress;
  [MISTMERE_QUEST_ID]?: MistmereQuestProgress;
  [WATCHLINE_QUEST_ID]?: WatchlineQuestProgress;
  [ASHVEIL_QUEST_ID]?: AshveilQuestProgress;
  [CHOIR_COUNTS_QUEST_ID]?: ChoirCountsQuestProgress;
  [WHARF_QUEST_ID]?: WharfQuestProgress;
  [GREEN_GATE_QUEST_ID]?: GreenGateQuestProgress;
};

export const TEETH_RATS_NEEDED = 3;
export const ASHWOOD_CAIRNS_NEEDED = 3;
export const HOLLOW_WISPS_NEEDED = 2;

export const TEETH_QUEST_TITLE = "Teeth in the Grass";
export const ASHWOOD_QUEST_TITLE = "Ashwood Watch";
export const HOLLOW_QUEST_TITLE = "Hollow Watch";
export const GATE_QUEST_TITLE = "Gate Watch";
export const MISTMERE_QUEST_TITLE = "Mistmere Crossing";
export const WAE_COMPLETE_LINE.replace(/^Rook:\s*/, "");
    }
    if (!watch.talkedCress) {
      return "Old Reed's word is good. Cress at the depot will set it in the ledger — then recheck the first cairn.";
    }
    if (!watch.cairnInspected) {
      return "The ledger holds. Recheck the first cairn on the ashwood edge — West Watch.";
    }
    if (!watch.houndDone) {
      return "West Watch is marked. Identify or clear one Bark Hound on the ashwood edge, then tell me the line holds.";
    }
    return "The line is nearly set. Survive. Learn. Progress — tell me the watchline holds.";
  }

  const mist = getMistmereQuest(log);
  if (mist) {
    if (mist.status === "complete") {
      return MISTMERE_COMPLETE_LINE.replace(/^Rook:\s*/, "");
    }
    if (!mist.reachedMistmere) {
      return "Gate Watch is done. Cross the Mistmere gate — Old Reed walks the reed-path on the far shore.";
    }
    if (!mist.talkedOldReed) {
      return "You stand on Mistmere. Find Old Reed — fog guide of the reed-path — then bring his word home.";
    }
    return "Old Reed spoke. Survive. Learn. Progress — the crossing ends when you tell me.";
  }

  const gate = getGateWatchQuest(log);
  if (gate) {
    if (gate.status === "complete") {
      return "The gate is known. Cross to Mistmere when ready — Old Reed still walks the reed-path.";
    }
    if (!gate.gateReached) {
      return "Walk Gate Watch. The Mistmere gate sits on Thornreach — stand the tile, travel, or press E. Know the road before you leave.";
    }
    return "The Mistmere gate is marked. Survive. Learn. Progress — the watch ends here.";
  }

  const hollow = getHollowQuest(log);
  if (hollow) {
    if (hollow.status === "complete") {
      return "Hollow quieted. Walk Gate Watch — the Mistmere gate on Thornreach still waits.";
    }
    if (!hollow.enteredHollow) {
      return "Something wrong under the nearest Thornreach hollow. Descend, Identify the shade flicker, then clear two wisps.";
    }
    if (!hollow.identifiedWisp) {
      return "You are under the stone. Identify a Shade Wisp — Name and Rank — before you swing wild.";
    }
    if (hollow.wispsKilled < HOLLOW_WISPS_NEEDED) {
      return `Shade Wisps ${hollow.wispsKilled}/${HOLLOW_WISPS_NEEDED}. Clear the flicker, then return when the hollow holds.`;
    }
    return "The hollow is nearly quiet. Survive. Learn. Progress.";
  }

  const ash = getAshwoodQuest(log);
  if (ash) {
    if (ash.status === "complete") {
      return "Ashwood watch is settled. Something wrong under the nearest hollow — talk when you are ready to descend.";
    }
    const n = ash.cairnsVisited.length;
    if (n < ASHWOOD_CAIRNS_NEEDED) {
      return `Walk the ashwood watch. Cairns mark the edge — inspect them (${n}/${ASHWOOD_CAIRNS_NEEDED}). Wrong prey still shows between the stones.`;
    }
    if (!ash.wrongPreyDone) {
      return "Cairns are marked. Identify or clear one Needle Rat or Bark Hound still haunting the watch.";
    }
    return "The watch is nearly done. Survive. Learn. Progress.";
  }

  const q = getTeethQuest(log);
  if (!q) return null;
  if (q.status === "complete") {
    return "Teeth are settled. Walk the ashwood watch when you are ready — cairns still mark wrong prey.";
  }
  if (!q.identifiedRat) {
    return "Ashwood edge has wrong prey. Identify first - Name and Rank. Then clear three Needle Rats and one Bark Hound near Thornhearth.";
  }
  if (q.ratsKilled < TEETH_RATS_NEEDED) {
    return `Good eyes. Needle Rats ${q.ratsKilled}/${TEETH_RATS_NEEDED} - keep the basin grass honest.`;
  }
  if (!q.houndDone) {
    return "Rats down. One Bark Hound still packs the ashwood skirts - survive it or drive it off.";
  }
  return "Survive. Learn. Progress.";
}
TCHLINE_QUEST_TITLE = "The Watchline Holds";
export const ASHVEIL_QUEST_TITLE = "Ashveil Under the Watchline";
export const CHOIR_COUNTS_QUEST_TITLE = "The Choir Counts";
export const WHARF_QUEST_TITLE = "The Wharf Answers";
export const GREEN_GATE_QUEST_TITLE = "The Green Gate Keeps";

export const TEETH_START_TOAST =
  "Rook: Ashwood edge has wrong prey - Identify first.";

export const TEETH_COMPLETE_LINE =
  "Rook: Survive. Learn. Progress. The edge will remember your footing.";

export const ASHWOOD_START_TOAST =
  "Rook: Walk the ashwood watch — cairns mark where wrong prey still shows.";

export const ASHWOOD_COMPLETE_LINE =
  "Rook: The watch remembers. Survive. Learn. Progress.";

export const HOLLOW_START_TOAST =
  "Rook: Something wrong under the nearest Thornreach hollow — Identify the flicker.";

export const HOLLOW_COMPLETE_LINE =
  "Rook: The hollow quieted. Survive. Learn. Progress.";

export const GATE_START_TOAST =
  "Rook: Walk the Mistmere gate on Thornreach — know the road before you leave.";

export const GATE_COMPLETE_LINE =
  "Rook: The gate remembers your step. Survive. Learn. Progress.";

export const MISTMERE_START_TOAST =
  "Rook: The gate is known. Cross to Mistmere — Old Reed walks the reed-path.";

export const MISTMERE_COMPLETE_LINE =
  "Rook: Mistmere remembers your crossing. Survive. Learn. Progress.";

export const WATCHLINE_START_TOAST =
  "Rook: Old Reed's word is good. Cress will set it in the ledger; recheck the first cairn, then tell me the watchline holds.";

export const WATCHLINE_COMPLETE_LINE =
  "Rook: The line holds. Survive. Learn. Progress — now the road has a memory.";

export const ASHVEIL_START_TOAST =
  "Rook: The line holds above. Now follow its memory below—Ashveil waits in the deep chamber. Name the Ember before you strike, then bring me its quiet.";

export const ASHVEIL_COMPLETE_LINE =
  "Rook: The Ember is quiet. The road's memory runs under stone now. Survive. Learn. Progress.";

export const CHOIR_COUNTS_START_TOAST =
  "Rook: The Ember is quiet, but its memory reached the water. Cross to Mistmere, ask Old Reed what the fog carried, then take the Choir's rumor home.";

export const CHOIR_COUNTS_COMPLETE_LINE =
  "Rook: The stone went quiet; the water kept count. Survive. Learn. Progress — the road remembers beyond Thornreach.";

export const WHARF_START_TOAST =
  "Rook: The water kept count. Cress will put the rumor in the ledger; take its mark to Nightglass and ask Vesper what the shore has learned. Survive. Learn. Progress.";

export const WHARF_COMPLETE_LINE =
  "Rook: Nightglass answered, and the ledger holds. Survive. Learn. Progress — the road carries what the water remembers.";

export const GREEN_GATE_START_TOAST =
  "Rook: Nightglass answered, and the ledger holds. Take the green gate, name what hunts beyond it, and bring its measure home. Survive. Learn. Progress.";

export const GREEN_GATE_COMPLETE_LINE =
  "Rook: The green gate kept its word. Nightglass is not alone, and the far road knows your footing now. Survive. Learn. Progress.";

export const TEETH_REWARDS = {
  gold: 28,
  combatXp: 55,
  skill: "shielding" as SkillId,
  skillXp: 22,
};

export const ASHWOOD_REWARDS = {
  gold: 35,
  combatXp: 70,
  skill: "shielding" as SkillId,
  skillXp: 25,
};

export const HOLLOW_REWARDS = {
  gold: 40,
  combatXp: 80,
  skill: "magic" as SkillId,
  skillXp: 28,
};

export const GATE_REWARDS = {
  gold: 45,
  combatXp: 90,
  skill: "distance" as SkillId,
  skillXp: 28,
};

export const MISTMERE_REWARDS = {
  gold: 50,
  combatXp: 100,
  skill: "distance" as SkillId,
  skillXp: 30,
};

export const WATCHLINE_REWARDS = {
  gold: 55,
  combatXp: 110,
  skill: "shielding" as SkillId,
  skillXp: 32,
};

export const ASHVEIL_REWARDS = {
  gold: 60,
  combatXp: 120,
  skill: "magic" as SkillId,
  skillXp: 36,
};

export const CHOIR_COUNTS_REWARDS = {
  gold: 65,
  combatXp: 130,
  skill: "distance" as SkillId,
  skillXp: 38,
};

export const WHARF_REWARDS = {
  gold: 70,
  combatXp: 140,
  skill: "distance" as SkillId,
  skillXp: 42,
};

export const GREEN_GATE_REWARDS = {
  gold: 75,
  combatXp: 150,
  skill: "shielding" as SkillId,
  skillXp: 45,
};

export function loadQuestLog(): QuestLog {
  try {
    const raw = localStorage.getItem(getActiveQuestKey());
    if (!raw) return {};
    return sanitizeQuestLog(JSON.parse(raw));
  } catch {
    return {};
  }
}

export function saveQuestLog(log: QuestLog): void {
  localStorage.setItem(getActiveQuestKey(), JSON.stringify(log));
}

/** GameApp binds this so field ticks (chamber / Identify) can toast + refresh HUD. */
let questUiHandler: ((toast?: string) => void) | null = null;

export function setQuestUiHandler(handler: ((toast?: string) => void) | null): void {
  questUiHandler = handler;
}

export function notifyQuestUi(toast?: string): void {
  questUiHandler?.(toast);
}

export function clearQuestLog(): void {
  localStorage.removeItem(getActiveQuestKey());
}

export function emptyTeethQuest(): TeethQuestProgress {
  return {
    id: TEETH_QUEST_ID,
    status: "active",
    identifiedRat: false,
    ratsKilled: 0,
    houndDone: false,
  };
}

export function emptyAshwoodQuest(): AshwoodQuestProgress {
  return {
    id: ASHWOOD_QUEST_ID,
    status: "active",
    cairnsVisited: [],
    wrongPreyDone: false,
  };
}

export function emptyHollowQuest(): HollowQuestProgress {
  return {
    id: HOLLOW_QUEST_ID,
    status: "active",
    enteredHollow: false,
    identifiedWisp: false,
    wispsKilled: 0,
  };
}

export function emptyGateWatchQuest(): GateWatchQuestProgress {
  return {
    id: GATE_QUEST_ID,
    status: "active",
    gateReached: false,
  };
}

export function emptyMistmereQuest(): MistmereQuestProgress {
  return {
    id: MISTMERE_QUEST_ID,
    status: "active",
    reachedMistmere: false,
    talkedOldReed: false,
  };
}

export function emptyWatchlineQuest(): WatchlineQuestProgress {
  return {
    id: WATCHLINE_QUEST_ID,
    status: "active",
    talkedCress: false,
    cairnInspected: false,
    houndDone: false,
  };
}

export function emptyAshveilQuest(): AshveilQuestProgress {
  return {
    id: ASHVEIL_QUEST_ID,
    status: "active",
    reachedChamber: false,
    identifiedEmber: false,
    emberKilled: false,
  };
}

export function emptyChoirCountsQuest(): ChoirCountsQuestProgress {
  return {
    id: CHOIR_COUNTS_QUEST_ID,
    status: "active",
    reachedMistmere: false,
    talkedOldReed: false,
    reachedChoir: false,
    talkedChoirKeeper: false,
  };
}

export function emptyWharfQuest(): WharfQuestProgress {
  return {
    id: WHARF_QUEST_ID,
    status: "active",
    talkedCress: false,
    reachedNightglass: false,
    talkedVesper: false,
    houndDone: false,
  };
}

export function emptyGreenGateQuest(): GreenGateQuestProgress {
  return {
    id: GREEN_GATE_QUEST_ID,
    status: "active",
    gateReached: false,
    identifiedFox: false,
    foxKilled: false,
  };
}

function sanitizeCairns(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const allowed = new Set(ASHWOOD_CAIRN_IDS);
  const out: string[] = [];
  for (const id of raw) {
    if (typeof id === "string" && allowed.has(id) && !out.includes(id)) {
      out.push(id);
    }
  }
  return out;
}

export function sanitizeQuestLog(raw: unknown): QuestLog {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  const log: QuestLog = {};

  const teeth = obj[TEETH_QUEST_ID];
  if (teeth && typeof teeth === "object") {
    const t = teeth as Record<string, unknown>;
    const status: QuestStatus =
      t.status === "complete" ? "complete" : "active";
    const ratsKilled =
      typeof t.ratsKilled === "number" && Number.isFinite(t.ratsKilled)
        ? Math.max(0, Math.min(99, Math.floor(t.ratsKilled)))
        : 0;
    log[TEETH_QUEST_ID] = {
      id: TEETH_QUEST_ID,
      status,
      identifiedRat: Boolean(t.identifiedRat),
      ratsKilled,
      houndDone: Boolean(t.houndDone),
    };
  }

  const ash = obj[ASHWOOD_QUEST_ID];
  if (ash && typeof ash === "object") {
    const a = ash as Record<string, unknown>;
    const status: QuestStatus =
      a.status === "complete" ? "complete" : "active";
    log[ASHWOOD_QUEST_ID] = {
      id: ASHWOOD_QUEST_ID,
      status,
      cairnsVisited: sanitizeCairns(a.cairnsVisited),
      wrongPreyDone: Boolean(a.wrongPreyDone),
    };
  }

  const hollow = obj[HOLLOW_QUEST_ID];
  if (hollow && typeof hollow === "object") {
    const h = hollow as Record<string, unknown>;
    const status: QuestStatus =
      h.status === "complete" ? "complete" : "active";
    const wispsKilled =
      typeof h.wispsKilled === "number" && Number.isFinite(h.wispsKilled)
        ? Math.max(0, Math.min(99, Math.floor(h.wispsKilled)))
        : 0;
    log[HOLLOW_QUEST_ID] = {
      id: HOLLOW_QUEST_ID,
      status,
      enteredHollow: Boolean(h.enteredHollow),
      identifiedWisp: Boolean(h.identifiedWisp),
      wispsKilled,
    };
  }

  const gate = obj[GATE_QUEST_ID];
  if (gate && typeof gate === "object") {
    const g = gate as Record<string, unknown>;
    const status: QuestStatus =
      g.status === "complete" ? "complete" : "active";
    log[GATE_QUEST_ID] = {
      id: GATE_QUEST_ID,
      status,
      gateReached: Boolean(g.gateReached),
    };
  }

  const mist = obj[MISTMERE_QUEST_ID];
  if (mist && typeof mist === "object") {
    const m = mist as Record<string, unknown>;
    const status: QuestStatus =
      m.status === "complete" ? "complete" : "active";
    log[MISTMERE_QUEST_ID] = {
      id: MISTMERE_QUEST_ID,
      status,
      reachedMistmere: Boolean(m.reachedMistmere),
      talkedOldReed: Boolean(m.talkedOldReed),
    };
  }

  const watch = obj[WATCHLINE_QUEST_ID];
  if (watch && typeof watch === "object") {
    const w = watch as Record<string, unknown>;
    const status: QuestStatus =
      w.status === "complete" ? "complete" : "active";
    log[WATCHLINE_QUEST_ID] = {
      id: WATCHLINE_QUEST_ID,
      status,
      talkedCress: Boolean(w.talkedCress),
      cairnInspected: Boolean(w.cairnInspected),
      houndDone: Boolean(w.houndDone),
    };
  }

  const ashveil = obj[ASHVEIL_QUEST_ID];
  if (ashveil && typeof ashveil === "object") {
    const a = ashveil as Record<string, unknown>;
    const status: QuestStatus =
      a.status === "complete" ? "complete" : "active";
    log[ASHVEIL_QUEST_ID] = {
      id: ASHVEIL_QUEST_ID,
      status,
      reachedChamber: Boolean(a.reachedChamber),
      identifiedEmber: Boolean(a.identifiedEmber),
      emberKilled: Boolean(a.emberKilled),
    };
  }

  const choir = obj[CHOIR_COUNTS_QUEST_ID];
  if (choir && typeof choir === "object") {
    const c = choir as Record<string, unknown>;
    const status: QuestStatus =
      c.status === "complete" ? "complete" : "active";
    log[CHOIR_COUNTS_QUEST_ID] = {
      id: CHOIR_COUNTS_QUEST_ID,
      status,
      reachedMistmere: Boolean(c.reachedMistmere),
      talkedOldReed: Boolean(c.talkedOldReed),
      reachedChoir: Boolean(c.reachedChoir),
      talkedChoirKeeper: Boolean(c.talkedChoirKeeper),
    };
  }

  const wharf = obj[WHARF_QUEST_ID];
  if (wharf && typeof wharf === "object") {
    const w = wharf as Record<string, unknown>;
    const status: QuestStatus =
      w.status === "complete" ? "complete" : "active";
    log[WHARF_QUEST_ID] = {
      id: WHARF_QUEST_ID,
      status,
      talkedCress: Boolean(w.talkedCress),
      reachedNightglass: Boolean(w.reachedNightglass),
      talkedVesper: Boolean(w.talkedVesper),
      houndDone: Boolean(w.houndDone),
    };
  }

  const green = obj[GREEN_GATE_QUEST_ID];
  if (green && typeof green === "object") {
    const g = green as Record<string, unknown>;
    const status: QuestStatus =
      g.status === "complete" ? "complete" : "active";
    log[GREEN_GATE_QUEST_ID] = {
      id: GREEN_GATE_QUEST_ID,
      status,
      gateReached: Boolean(g.gateReached),
      identifiedFox: Boolean(g.identifiedFox),
      foxKilled: Boolean(g.foxKilled),
    };
  }

  return log;
}

export function getTeethQuest(log: QuestLog | undefined): TeethQuestProgress | null {
  return log?.[TEETH_QUEST_ID] ?? null;
}

export function getAshwoodQuest(
  log: QuestLog | undefined,
): AshwoodQuestProgress | null {
  return log?.[ASHWOOD_QUEST_ID] ?? null;
}

export function getHollowQuest(
  log: QuestLog | undefined,
): HollowQuestProgress | null {
  return log?.[HOLLOW_QUEST_ID] ?? null;
}

export function getGateWatchQuest(
  log: QuestLog | undefined,
): GateWatchQuestProgress | null {
  return log?.[GATE_QUEST_ID] ?? null;
}

export function getMistmereQuest(
  log: QuestLog | undefined,
): MistmereQuestProgress | null {
  return log?.[MISTMERE_QUEST_ID] ?? null;
}

export function getWatchlineQuest(
  log: QuestLog | undefined,
): WatchlineQuestProgress | null {
  return log?.[WATCHLINE_QUEST_ID] ?? null;
}

export function getAshveilQuest(
  log: QuestLog | undefined,
): AshveilQuestProgress | null {
  return log?.[ASHVEIL_QUEST_ID] ?? null;
}

export function getChoirCountsQuest(
  log: QuestLog | undefined,
): ChoirCountsQuestProgress | null {
  return log?.[CHOIR_COUNTS_QUEST_ID] ?? null;
}

export function getWharfQuest(
  log: QuestLog | undefined,
): WharfQuestProgress | null {
  return log?.[WHARF_QUEST_ID] ?? null;
}

export function getGreenGateQuest(
  log: QuestLog | undefined,
): GreenGateQuestProgress | null {
  return log?.[GREEN_GATE_QUEST_ID] ?? null;
}

export function isTeethActive(log: QuestLog | undefined): boolean {
  const q = getTeethQuest(log);
  return Boolean(q && q.status === "active");
}

export function isAshwoodActive(log: QuestLog | undefined): boolean {
  const q = getAshwoodQuest(log);
  return Boolean(q && q.status === "active");
}

export function isHollowActive(log: QuestLog | undefined): boolean {
  const q = getHollowQuest(log);
  return Boolean(q && q.status === "active");
}

export function isGateWatchActive(log: QuestLog | undefined): boolean {
  const q = getGateWatchQuest(log);
  return Boolean(q && q.status === "active");
}

export function isMistmereActive(log: QuestLog | undefined): boolean {
  const q = getMistmereQuest(log);
  return Boolean(q && q.status === "active");
}

export function isWatchlineActive(log: QuestLog | undefined): boolean {
  const q = getWatchlineQuest(log);
  return Boolean(q && q.status === "active");
}

export function isAshveilActive(log: QuestLog | undefined): boolean {
  const q = getAshveilQuest(log);
  return Boolean(q && q.status === "active");
}

export function isChoirCountsActive(log: QuestLog | undefined): boolean {
  const q = getChoirCountsQuest(log);
  return Boolean(q && q.status === "active");
}

export function isWharfActive(log: QuestLog | undefined): boolean {
  const q = getWharfQuest(log);
  return Boolean(q && q.status === "active");
}

export function isGreenGateActive(log: QuestLog | undefined): boolean {
  const q = getGreenGateQuest(log);
  return Boolean(q && q.status === "active");
}

export function teethObjectivesMet(q: TeethQuestProgress): boolean {
  return (
    q.identifiedRat &&
    q.ratsKilled >= TEETH_RATS_NEEDED &&
    q.houndDone
  );
}

export function ashwoodObjectivesMet(q: AshwoodQuestProgress): boolean {
  return (
    q.cairnsVisited.length >= ASHWOOD_CAIRNS_NEEDED && q.wrongPreyDone
  );
}

export function hollowObjectivesMet(q: HollowQuestProgress): boolean {
  return (
    q.enteredHollow &&
    q.identifiedWisp &&
    q.wispsKilled >= HOLLOW_WISPS_NEEDED
  );
}

export function gateWatchObjectivesMet(q: GateWatchQuestProgress): boolean {
  return q.gateReached;
}

export function mistmereObjectivesMet(q: MistmereQuestProgress): boolean {
  return q.reachedMistmere && q.talkedOldReed;
}

export function watchlineObjectivesMet(q: WatchlineQuestProgress): boolean {
  return q.talkedCress && q.cairnInspected && q.houndDone;
}

export function ashveilObjectivesMet(q: AshveilQuestProgress): boolean {
  return q.reachedChamber && q.identifiedEmber && q.emberKilled;
}

export function choirCountsObjectivesMet(q: ChoirCountsQuestProgress): boolean {
  return (
    q.reachedMistmere &&
    q.talkedOldReed &&
    q.reachedChoir &&
    q.talkedChoirKeeper
  );
}

export function wharfObjectivesMet(q: WharfQuestProgress): boolean {
  return q.talkedCress && q.talkedVesper && q.houndDone;
}

export function greenGateObjectivesMet(q: GreenGateQuestProgress): boolean {
  return q.gateReached && q.identifiedFox && q.foxKilled;
}

/** HUD lines for Teeth sticky panel. */
export function teethHudLines(q: TeethQuestProgress): string[] {
  if (q.status === "complete") {
    return ["Complete - Survive / Learn / Progress"];
  }
  return [
    q.identifiedRat
      ? "[done] Identify Needle Rat"
      : "[ ] Identify a Needle Rat (near look)",
    `${q.ratsKilled >= TEETH_RATS_NEEDED ? "[done]" : "[ ]"} Defeat Needle Rats ${Math.min(q.ratsKilled, TEETH_RATS_NEEDED)}/${TEETH_RATS_NEEDED}`,
    q.houndDone
      ? "[done] Survive / drive off Bark Hound"
      : "[ ] Survive or drive off 1 Bark Hound",
  ];
}

/** HUD lines for Ashwood Watch. */
export function ashwoodHudLines(q: AshwoodQuestProgress): string[] {
  if (q.status === "complete") {
    return ["Complete - The watch remembers"];
  }
  const n = Math.min(q.cairnsVisited.length, ASHWOOD_CAIRNS_NEEDED);
  return [
    `${n >= ASHWOOD_CAIRNS_NEEDED ? "[done]" : "[ ]"} Inspect cairns ${n}/${ASHWOOD_CAIRNS_NEEDED}`,
    q.wrongPreyDone
      ? "[done] Wrong prey Identified / cleared"
      : "[ ] Identify or clear 1 wrong prey (after a cairn)",
  ];
}

/** HUD lines for Hollow Watch. */
export function hollowHudLines(q: HollowQuestProgress): string[] {
  if (q.status === "complete") {
    return ["Complete - The hollow quieted"];
  }
  return [
    q.enteredHollow
      ? "[done] Enter a Thornreach hollow"
      : "[ ] Enter the nearest Thornreach hollow",
    q.identifiedWisp
      ? "[done] Identify Shade Wisp"
      : "[ ] Identify a Shade Wisp (near look)",
    `${q.wispsKilled >= HOLLOW_WISPS_NEEDED ? "[done]" : "[ ]"} Defeat Shade Wisps ${Math.min(q.wispsKilled, HOLLOW_WISPS_NEEDED)}/${HOLLOW_WISPS_NEEDED}`,
  ];
}

/** HUD lines for Gate Watch. */
export function gateWatchHudLines(q: GateWatchQuestProgress): string[] {
  if (q.status === "complete") {
    return ["Complete - The gate remembers"];
  }
  return [
    q.gateReached
      ? "[done] Reach Mistmere gate"
      : "[ ] Reach Mistmere gate on Thornreach",
    q.gateReached
      ? "[ ] Return to Rook (talk)"
      : "[ ] Return to Rook after the gate",
  ];
}

export function mistmereHudLines(q: MistmereQuestProgress): string[] {
  if (q.status === "complete") {
    return ["Complete - Mistmere remembers the crossing"];
  }
  return [
    q.reachedMistmere
      ? "[done] Travel to Mistmere"
      : "[ ] Travel to Mistmere (gate)",
    q.talkedOldReed
      ? "[done] Talk to Old Reed"
      : "[ ] Talk to Old Reed (reed-path)",
    q.reachedMistmere && q.talkedOldReed
      ? "[ ] Return to Rook (word of the reeds)"
      : "[ ] Return to Rook after Old Reed",
  ];
}

/** HUD lines for The Watchline Holds (consumed if HUD wires the helper). */
export function watchlineHudLines(q: WatchlineQuestProgress): string[] {
  if (q.status === "complete") {
    return ["Complete - The watchline holds"];
  }
  return [
    q.talkedCress
      ? "[done] Talk to Cress (ledger)"
      : "[ ] Talk to Cress at the depot (ledger)",
    q.cairnInspected
      ? "[done] Recheck West Watch cairn"
      : "[ ] Recheck the first cairn (West Watch)",
    q.houndDone
      ? "[done] Bark Hound Identified / cleared"
      : "[ ] Identify or clear 1 Bark Hound (Ashwood Edge)",
    q.talkedCress && q.cairnInspected && q.houndDone
      ? "[ ] Return to Rook (the line holds)"
      : "[ ] Return to Rook when the line holds",
  ];
}

/** HUD lines for Ashveil Under the Watchline. */
export function ashveilHudLines(q: AshveilQuestProgress): string[] {
  if (q.status === "complete") {
    return ["Complete - The Ember is quiet"];
  }
  return [
    q.reachedChamber
      ? "[done] Reach Ashveil chamber"
      : "[ ] Reach the Ashveil chamber (Thornreach hollow)",
    q.identifiedEmber
      ? "[done] Identify Ashveil Ember"
      : "[ ] Identify the Ashveil Ember (near look)",
    q.emberKilled
      ? "[done] Defeat Ashveil Ember 1/1"
      : "[ ] Defeat Ashveil Ember 0/1",
    q.reachedChamber && q.identifiedEmber && q.emberKilled
      ? "[ ] Return to Rook (its quiet)"
      : "[ ] Return to Rook with the Ember's quiet",
  ];
}

/** HUD lines for The Choir Counts. */
export function choirCountsHudLines(q: ChoirCountsQuestProgress): string[] {
  if (q.status === "complete") {
    return ["Complete - The water kept count"];
  }
  return [
    q.reachedMistmere
      ? "[done] Cross to Mistmere"
      : "[ ] Cross Thornreach → Mistmere gate",
    q.talkedOldReed
      ? "[done] Talk to Old Reed"
      : "[ ] Talk to Old Reed (reed-path)",
    q.reachedChoir
      ? "[done] Sail to Sunken Choir"
      : "[ ] Sail Mistmere Pier → Sunken Choir",
    q.talkedChoirKeeper
      ? "[done] Talk to Choir Keeper"
      : "[ ] Talk to Choir Keeper (Choir Landing)",
    q.reachedMistmere &&
    q.talkedOldReed &&
    q.reachedChoir &&
    q.talkedChoirKeeper
      ? "[ ] Return to Rook (the Choir's rumor)"
      : "[ ] Return to Rook with the Choir's rumor",
  ];
}

/** HUD lines for The Wharf Answers. */
export function wharfHudLines(q: WharfQuestProgress): string[] {
  if (q.status === "complete") {
    return ["Complete - Nightglass answered"];
  }
  return [
    q.talkedCress
      ? "[done] Talk to Cress (ledger)"
      : "[ ] Talk to Cress at the depot (Choir rumor)",
    q.reachedNightglass
      ? "[done] Sail to Nightglass Coast"
      : "[ ] Sail to Nightglass Coast",
    q.talkedVesper
      ? "[done] Talk to Captain Vesper"
      : "[ ] Talk to Captain Vesper (Nightglass Wharf)",
    q.houndDone
      ? "[done] Defeat Bark Hound 1/1"
      : "[ ] Defeat Bark Hound 0/1 (Nightglass Coast)",
    q.talkedCress && q.talkedVesper && q.houndDone
      ? "[ ] Return to Rook (the shore's word)"
      : "[ ] Return to Rook with what the shore learned",
  ];
}

/** HUD lines for The Green Gate Keeps. */
export function greenGateHudLines(q: GreenGateQuestProgress): string[] {
  if (q.status === "complete") {
    return ["Complete - The green gate kept"];
  }
  return [
    q.gateReached
      ? "[done] Reach Verdant Spine gate"
      : "[ ] Reach Verdant Spine gate on Thornreach",
    q.identifiedFox
      ? "[done] Identify Gorse Fox"
      : "[ ] Identify a Gorse Fox (near look)",
    q.foxKilled
      ? "[done] Defeat Gorse Fox 1/1"
      : "[ ] Defeat Gorse Fox 0/1 (Verdant Spine)",
    q.gateReached && q.identifiedFox && q.foxKilled
      ? "[ ] Return to Rook (its measure)"
      : "[ ] Return to Rook with the green gate's measure",
  ];
}


export type QuestEventResult = {
  log: QuestLog;
  toast?: string;
  /** Which quest just completed (rewards). */
  completedId?: QuestId;
  /** Ashwood auto-started after Teeth. */
  startedAshwood?: boolean;
  /** Hollow Watch auto-started after Ashwood. */
  startedHollow?: boolean;
  /** Gate Watch auto-started after Hollow. */
  startedGateWatch?: boolean;
  /** Mistmere Crossing auto-started after Gate Watch. */
  startedMistmere?: boolean;
  /** The Watchline Holds auto-started after Mistmere Crossing. */
  startedWatchline?: boolean;
  /** Ashveil Under the Watchline auto-started after Watchline Holds. */
  startedAshveil?: boolean;
  /** The Choir Counts auto-started after Ashveil Under the Watchline. */
  startedChoirCounts?: boolean;
  /** The Wharf Answers auto-started after The Choir Counts. */
  startedWharf?: boolean;
  /** The Green Gate Keeps auto-started after The Wharf Answers. */
  startedGreenGate?: boolean;
};

/** If Teeth is complete and Ashwood missing, start Ashwood Watch. */
export function ensureAshwoodAfterTeeth(log: QuestLog): {
  log: QuestLog;
  started: boolean;
} {
  const teeth = getTeethQuest(log);
  if (!teeth || teeth.status !== "complete") {
    return { log, started: false };
  }
  if (getAshwoodQuest(log)) {
    return { log, started: false };
  }
  return {
    log: withAshwoodQuest(log, emptyAshwoodQuest()),
    started: true,
  };
}

/** If Ashwood is complete and Hollow Watch missing, start Hollow Watch. */
export function ensureHollowAfterAshwood(log: QuestLog): {
  log: QuestLog;
  started: boolean;
} {
  const ash = getAshwoodQuest(log);
  if (!ash || ash.status !== "complete") {
    return { log, started: false };
  }
  if (getHollowQuest(log)) {
    return { log, started: false };
  }
  return {
    log: withHollowQuest(log, emptyHollowQuest()),
    started: true,
  };
}

/** If Hollow Watch is complete and Gate Watch missing, start Gate Watch. */
export function ensureGateWatchAfterHollow(log: QuestLog): {
  log: QuestLog;
  started: boolean;
} {
  const hollow = getHollowQuest(log);
  if (!hollow || hollow.status !== "complete") {
    return { log, started: false };
  }
  if (getGateWatchQuest(log)) {
    return { log, started: false };
  }
  return {
    log: withGateWatchQuest(log, emptyGateWatchQuest()),
    started: true,
  };
}

/** If Gate Watch is complete and Mistmere Crossing missing, start it. */
export function ensureMistmereAfterGate(log: QuestLog): {
  log: QuestLog;
  started: boolean;
} {
  const gate = getGateWatchQuest(log);
  if (!gate || gate.status !== "complete") {
    return { log, started: false };
  }
  if (getMistmereQuest(log)) {
    return { log, started: false };
  }
  return {
    log: withMistmereQuest(log, emptyMistmereQuest()),
    started: true,
  };
}

/** If Mistmere Crossing is complete and Watchline Holds missing, start it. */
export function ensureWatchlineAfterMistmere(log: QuestLog): {
  log: QuestLog;
  started: boolean;
} {
  const mist = getMistmereQuest(log);
  if (!mist || mist.status !== "complete") {
    return { log, started: false };
  }
  if (getWatchlineQuest(log)) {
    return { log, started: false };
  }
  return {
    log: withWatchlineQuest(log, emptyWatchlineQuest()),
    started: true,
  };
}

/** If Watchline Holds is complete and Ashveil quest missing, start it. */
export function ensureAshveilAfterWatchline(log: QuestLog): {
  log: QuestLog;
  started: boolean;
} {
  const watch = getWatchlineQuest(log);
  if (!watch || watch.status !== "complete") {
    return { log, started: false };
  }
  if (getAshveilQuest(log)) {
    return { log, started: false };
  }
  return {
    log: withAshveilQuest(log, emptyAshveilQuest()),
    started: true,
  };
}

/** If Ashveil is complete and The Choir Counts missing, start it. */
export function ensureChoirCountsAfterAshveil(log: QuestLog): {
  log: QuestLog;
  started: boolean;
} {
  const ashveil = getAshveilQuest(log);
  if (!ashveil || ashveil.status !== "complete") {
    return { log, started: false };
  }
  if (getChoirCountsQuest(log)) {
    return { log, started: false };
  }
  return {
    log: withChoirCountsQuest(log, emptyChoirCountsQuest()),
    started: true,
  };
}

/** If The Choir Counts is complete and The Wharf Answers missing, start it. */
export function ensureNightglassAfterChoir(log: QuestLog): {
  log: QuestLog;
  started: boolean;
} {
  const choir = getChoirCountsQuest(log);
  if (!choir || choir.status !== "complete") {
    return { log, started: false };
  }
  if (getWharfQuest(log)) {
    return { log, started: false };
  }
  return {
    log: withWharfQuest(log, emptyWharfQuest()),
    started: true,
  };
}

/** If The Wharf Answers is complete and The Green Gate Keeps missing, start it. */
export function ensureGreenGateAfterWharf(log: QuestLog): {
  log: QuestLog;
  started: boolean;
} {
  const wharf = getWharfQuest(log);
  if (!wharf || wharf.status !== "complete") {
    return { log, started: false };
  }
  if (getGreenGateQuest(log)) {
    return { log, started: false };
  }
  return {
    log: withGreenGateQuest(log, emptyGreenGateQuest()),
    started: true,
  };
}

export function withTeethQuest(
  log: QuestLog | undefined,
  quest: TeethQuestProgress,
): QuestLog {
  return { ...(log ?? {}), [TEETH_QUEST_ID]: quest };
}

export function withAshwoodQuest(
  log: QuestLog | undefined,
  quest: AshwoodQuestProgress,
): QuestLog {
  return { ...(log ?? {}), [ASHWOOD_QUEST_ID]: quest };
}

export function withHollowQuest(
  log: QuestLog | undefined,
  quest: HollowQuestProgress,
): QuestLog {
  return { ...(log ?? {}), [HOLLOW_QUEST_ID]: quest };
}

export function withGateWatchQuest(
  log: QuestLog | undefined,
  quest: GateWatchQuestProgress,
): QuestLog {
  return { ...(log ?? {}), [GATE_QUEST_ID]: quest };
}

export function withMistmereQuest(
  log: QuestLog | undefined,
  quest: MistmereQuestProgress,
): QuestLog {
  return { ...(log ?? {}), [MISTMERE_QUEST_ID]: quest };
}

export function withWatchlineQuest(
  log: QuestLog | undefined,
  quest: WatchlineQuestProgress,
): QuestLog {
  return { ...(log ?? {}), [WATCHLINE_QUEST_ID]: quest };
}

export function withAshveilQuest(
  log: QuestLog | undefined,
  quest: AshveilQuestProgress,
): QuestLog {
  return { ...(log ?? {}), [ASHVEIL_QUEST_ID]: quest };
}

export function withChoirCountsQuest(
  log: QuestLog | undefined,
  quest: ChoirCountsQuestProgress,
): QuestLog {
  return { ...(log ?? {}), [CHOIR_COUNTS_QUEST_ID]: quest };
}

export function withWharfQuest(
  log: QuestLog | undefined,
  quest: WharfQuestProgress,
): QuestLog {
  return { ...(log ?? {}), [WHARF_QUEST_ID]: quest };
}

export function withGreenGateQuest(
  log: QuestLog | undefined,
  quest: GreenGateQuestProgress,
): QuestLog {
  return { ...(log ?? {}), [GREEN_GATE_QUEST_ID]: quest };
}

function finishTeethIfReady(
  log: QuestLog,
  next: TeethQuestProgress,
  toast?: string,
): QuestEventResult {
  if (teethObjectivesMet(next) && next.status === "active") {
    let out = withTeethQuest(log, { ...next, status: "complete" });
    const ensured = ensureAshwoodAfterTeeth(out);
    out = ensured.log;
    return {
      log: out,
      toast: ensured.started ? ASHWOOD_START_TOAST : TEETH_COMPLETE_LINE,
      completedId: TEETH_QUEST_ID,
      startedAshwood: ensured.started,
    };
  }
  return { log: withTeethQuest(log, next), toast };
}

function finishAshwoodIfReady(
  log: QuestLog,
  next: AshwoodQuestProgress,
  toast?: string,
): QuestEventResult {
  if (ashwoodObjectivesMet(next) && next.status === "active") {
    let out = withAshwoodQuest(log, { ...next, status: "complete" });
    const ensured = ensureHollowAfterAshwood(out);
    out = ensured.log;
    return {
      log: out,
      toast: ensured.started ? HOLLOW_START_TOAST : ASHWOOD_COMPLETE_LINE,
      completedId: ASHWOOD_QUEST_ID,
      startedHollow: ensured.started,
    };
  }
  return { log: withAshwoodQuest(log, next), toast };
}

function finishHollowIfReady(
  log: QuestLog,
  next: HollowQuestProgress,
  toast?: string,
): QuestEventResult {
  if (hollowObjectivesMet(next) && next.status === "active") {
    let out = withHollowQuest(log, { ...next, status: "complete" });
    const ensured = ensureGateWatchAfterHollow(out);
    out = ensured.log;
    return {
      log: out,
      toast: ensured.started ? GATE_START_TOAST : HOLLOW_COMPLETE_LINE,
      completedId: HOLLOW_QUEST_ID,
      startedGateWatch: ensured.started,
    };
  }
  return { log: withHollowQuest(log, next), toast };
}

/** Apply Identify near-field on a Needle Rat (or any beast if already looking). */
export function applyIdentify(
  log: QuestLog,
  kindId: EnemyKindId,
  continentId?: ContinentId,
): QuestEventResult | null {
  const green = getGreenGateQuest(log);
  if (
    green &&
    green.status === "active" &&
    !green.identifiedFox &&
    kindId === "gorse-fox" &&
    continentId === "verdant-spine"
  ) {
    return {
      log: withGreenGateQuest(log, {
        ...green,
        gateReached: true,
        identifiedFox: true,
      }),
      toast: "Identified: Gorse Fox / F",
    };
  }

  const ashveil = getAshveilQuest(log);
  if (
    ashveil &&
    ashveil.status === "active" &&
    !ashveil.identifiedEmber &&
    kindId === "ashveil-ember"
  ) {
    return {
      log: withAshveilQuest(log, {
        ...ashveil,
        reachedChamber: true,
        identifiedEmber: true,
      }),
      toast: "Identified: Ashveil Ember / E",
    };
  }

  const watch = getWatchlineQuest(log);
  if (
    watch &&
    watch.status === "active" &&
    !watch.houndDone &&
    kindId === "bark-hound"
  ) {
    return {
      log: withWatchlineQuest(log, { ...watch, houndDone: true }),
      toast: "Identified: Bark Hound / F",
    };
  }

  const hollow = getHollowQuest(log);
  if (
    hollow &&
    hollow.status === "active" &&
    hollow.enteredHollow &&
    !hollow.identifiedWisp &&
    kindId === "shade-wisp"
  ) {
    return finishHollowIfReady(
      log,
      { ...hollow, identifiedWisp: true },
      "Identified: Shade Wisp / F",
    );
  }

  const teeth = getTeethQuest(log);
  if (teeth && teeth.status === "active" && !teeth.identifiedRat) {
    if (
      kindId === "needle-rat" ||
      kindId === "briar-mite" ||
      kindId === "bark-hound"
    ) {
      const next: TeethQuestProgress = { ...teeth, identifiedRat: true };
      const toast =
        kindId === "needle-rat"
          ? "Identified: Needle Rat / F"
          : `Identified: ${kindId === "bark-hound" ? "Bark Hound" : "Briar Mite"} / F`;
      return finishTeethIfReady(log, next, toast);
    }
  }

  const ash = getAshwoodQuest(log);
  if (
    ash &&
    ash.status === "active" &&
    !ash.wrongPreyDone &&
    ash.cairnsVisited.length >= 1 &&
    (kindId === "needle-rat" || kindId === "bark-hound")
  ) {
    const label = kindId === "needle-rat" ? "Needle Rat" : "Bark Hound";
    return finishAshwoodIfReady(
      log,
      { ...ash, wrongPreyDone: true },
      `Wrong prey Identified: ${label}`,
    );
  }

  return null;
}

export function applyEnemyKill(
  log: QuestLog,
  kindId: EnemyKindId,
  continentId?: ContinentId,
): QuestEventResult | null {
  const green = getGreenGateQuest(log);
  if (
    green &&
    green.status === "active" &&
    kindId === "gorse-fox" &&
    continentId === "verdant-spine" &&
    !green.foxKilled
  ) {
    return {
      log: withGreenGateQuest(log, {
        ...green,
        gateReached: true,
        identifiedFox: true,
        foxKilled: true,
      }),
      toast: "Gorse Fox 1/1 — Return to Rook",
    };
  }

  const wharf = getWharfQuest(log);
  if (
    wharf &&
    wharf.status === "active" &&
    kindId === "bark-hound" &&
    continentId === "nightglass-coast" &&
    !wharf.houndDone
  ) {
    return {
      log: withWharfQuest(log, { ...wharf, houndDone: true }),
      toast: "Bark Hound 1/1 — Return to Rook",
    };
  }

  const ashveil = getAshveilQuest(log);
  if (
    ashveil &&
    ashveil.status === "active" &&
    kindId === "ashveil-ember" &&
    !ashveil.emberKilled
  ) {
    return {
      log: withAshveilQuest(log, {
        ...ashveil,
        reachedChamber: true,
        identifiedEmber: true,
        emberKilled: true,
      }),
      toast: "Ashveil Ember 1/1 — Return to Rook",
    };
  }

  const watch = getWatchlineQuest(log);
  if (
    watch &&
    watch.status === "active" &&
    !watch.houndDone &&
    kindId === "bark-hound"
  ) {
    return {
      log: withWatchlineQuest(log, { ...watch, houndDone: true }),
      toast: "Bark Hound driven off",
    };
  }

  const hollow = getHollowQuest(log);
  if (hollow && hollow.status === "active" && kindId === "shade-wisp") {
    let next = { ...hollow };
    let toast: string | undefined;
    if (!next.enteredHollow) {
      next = { ...next, enteredHollow: true };
    }
    if (next.wispsKilled < HOLLOW_WISPS_NEEDED) {
      next = { ...next, wispsKilled: next.wispsKilled + 1 };
      toast = `Shade Wisps ${Math.min(next.wispsKilled, HOLLOW_WISPS_NEEDED)}/${HOLLOW_WISPS_NEEDED}`;
    }
    if (
      next.enteredHollow === hollow.enteredHollow &&
      next.wispsKilled === hollow.wispsKilled
    ) {
      return null;
    }
    return finishHollowIfReady(log, next, toast);
  }

  const teeth = getTeethQuest(log);
  if (teeth && teeth.status === "active") {
    if (kindId === "needle-rat" && teeth.ratsKilled < TEETH_RATS_NEEDED) {
      const next = { ...teeth, ratsKilled: teeth.ratsKilled + 1 };
      return finishTeethIfReady(
        log,
        next,
        `Needle Rats ${Math.min(next.ratsKilled, TEETH_RATS_NEEDED)}/${TEETH_RATS_NEEDED}`,
      );
    }
    if (kindId === "bark-hound" && !teeth.houndDone) {
      return finishTeethIfReady(log, { ...teeth, houndDone: true }, "Bark Hound driven off");
    }
  }

  const ash = getAshwoodQuest(log);
  if (
    ash &&
    ash.status === "active" &&
    !ash.wrongPreyDone &&
    ash.cairnsVisited.length >= 1 &&
    (kindId === "needle-rat" || kindId === "bark-hound")
  ) {
    const label = kindId === "needle-rat" ? "Needle Rat" : "Bark Hound";
    return finishAshwoodIfReady(
      log,
      { ...ash, wrongPreyDone: true },
      `Wrong prey cleared: ${label}`,
    );
  }

  return null;
}

/** Mark hollow entered for Hollow Watch (when hollowIndex becomes set). */
export function applyHollowEnter(log: QuestLog): QuestEventResult | null {
  const hollow = getHollowQuest(log);
  if (!hollow || hollow.status !== "active" || hollow.enteredHollow) {
    return null;
  }
  return finishHollowIfReady(
    log,
    { ...hollow, enteredHollow: true },
    "Hollow entered — Seek the shade flicker",
  );
}

/** Mark Mistmere gate reached for Gate Watch (travel or interact). */
export function applyGateReached(log: QuestLog): QuestEventResult | null {
  const gate = getGateWatchQuest(log);
  if (!gate || gate.status !== "active" || gate.gateReached) {
    return null;
  }
  return {
    log: withGateWatchQuest(log, { ...gate, gateReached: true }),
    toast: "Mistmere gate marked — Return to Rook",
  };
}

/** Complete Gate Watch when talking to Rook after the gate is marked. */
export function applyGateWatchRookTalk(log: QuestLog): QuestEventResult | null {
  const gate = getGateWatchQuest(log);
  if (!gate || gate.status !== "active" || !gate.gateReached) {
    return null;
  }
  let out = withGateWatchQuest(log, { ...gate, status: "complete" });
  const ensured = ensureMistmereAfterGate(out);
  out = ensured.log;
  return {
    log: out,
    toast: ensured.started ? MISTMERE_START_TOAST : GATE_COMPLETE_LINE,
    completedId: GATE_QUEST_ID,
    startedMistmere: ensured.started,
  };
}

/** Mark Mistmere continent reached for Mistmere Crossing. */
export function applyMistmereReached(log: QuestLog): QuestEventResult | null {
  const mist = getMistmereQuest(log);
  if (!mist || mist.status !== "active" || mist.reachedMistmere) {
    return null;
  }
  return {
    log: withMistmereQuest(log, { ...mist, reachedMistmere: true }),
    toast: mist.talkedOldReed
      ? "Mistmere underfoot — Return to Rook with Old Reed's word"
      : "Mistmere underfoot — Find Old Reed on the reed-path",
  };
}

/** Talk to Old Reed on Mistmere (reed-path guide). */
export function applyMistmereOldReedTalk(log: QuestLog): QuestEventResult | null {
  const mist = getMistmereQuest(log);
  if (!mist || mist.status !== "active" || mist.talkedOldReed) {
    return null;
  }
  const next: MistmereQuestProgress = {
    ...mist,
    reachedMistmere: true,
    talkedOldReed: true,
  };
  return {
    log: withMistmereQuest(log, next),
    toast: "Old Reed: Fog eats footsteps — follow the reed-path. Carry word back to Rook.",
  };
}

/** Complete Mistmere Crossing when talking to Rook after Old Reed. */
export function applyMistmereRookTalk(log: QuestLog): QuestEventResult | null {
  const mist = getMistmereQuest(log);
  if (!mist || mist.status !== "active") return null;
  if (!mistmereObjectivesMet(mist)) return null;
  let out = withMistmereQuest(log, { ...mist, status: "complete" });
  const ensured = ensureWatchlineAfterMistmere(out);
  out = ensured.log;
  return {
    log: out,
    toast: ensured.started ? WATCHLINE_START_TOAST : MISTMERE_COMPLETE_LINE,
    completedId: MISTMERE_QUEST_ID,
    startedWatchline: ensured.started,
  };
}

/** Talk to Cress Ledger at the Thornreach depot (Old Reed's word). */
export function applyWatchlineCressTalk(log: QuestLog): QuestEventResult | null {
  const watch = getWatchlineQuest(log);
  if (!watch || watch.status !== "active" || watch.talkedCress) {
    return null;
  }
  const next: WatchlineQuestProgress = { ...watch, talkedCress: true };
  return {
    log: withWatchlineQuest(log, next),
    toast: "Cress: Old Reed's word is in the ledger. Recheck the first cairn.",
  };
}

/** Complete Watchline Holds when talking to Rook after the line is set. */
export function applyWatchlineRookTalk(log: QuestLog): QuestEventResult | null {
  const watch = getWatchlineQuest(log);
  if (!watch || watch.status !== "active") return null;
  if (!watchlineObjectivesMet(watch)) return null;
  let out = withWatchlineQuest(log, { ...watch, status: "complete" });
  const ensured = ensureAshveilAfterWatchline(out);
  out = ensured.log;
  return {
    log: out,
    toast: ensured.started ? ASHVEIL_START_TOAST : WATCHLINE_COMPLETE_LINE,
    completedId: WATCHLINE_QUEST_ID,
    startedAshveil: ensured.started,
  };
}

/** Mark Ashveil chamber reached (stand the violet-marked deep room). */
export function applyAshveilChamberReach(log: QuestLog): QuestEventResult | null {
  const q = getAshveilQuest(log);
  if (!q || q.status !== "active" || q.reachedChamber) {
    return null;
  }
  return {
    log: withAshveilQuest(log, { ...q, reachedChamber: true }),
    toast: "Ashveil chamber — Name the Ember before you strike",
  };
}

/** Complete Ashveil Under the Watchline when talking to Rook after the Ember falls. */
export function applyAshveilRookTalk(log: QuestLog): QuestEventResult | null {
  const q = getAshveilQuest(log);
  if (!q || q.status !== "active") return null;
  if (!ashveilObjectivesMet(q)) return null;
  let out = withAshveilQuest(log, { ...q, status: "complete" });
  const ensured = ensureChoirCountsAfterAshveil(out);
  out = ensured.log;
  return {
    log: out,
    toast: ensured.started ? CHOIR_COUNTS_START_TOAST : ASHVEIL_COMPLETE_LINE,
    completedId: ASHVEIL_QUEST_ID,
    startedChoirCounts: ensured.started,
  };
}

/** Mark Mistmere reached for The Choir Counts (gate, ship, or stand). */
export function applyChoirCountsMistmereReached(
  log: QuestLog,
): QuestEventResult | null {
  const q = getChoirCountsQuest(log);
  if (!q || q.status !== "active" || q.reachedMistmere) {
    return null;
  }
  return {
    log: withChoirCountsQuest(log, { ...q, reachedMistmere: true }),
    toast: q.talkedOldReed
      ? "Mistmere underfoot — Board Mistmere Pier for the Choir"
      : "Mistmere underfoot — Ask Old Reed what the fog carried",
  };
}

/** Talk to Old Reed on Mistmere during The Choir Counts. */
export function applyChoirCountsOldReedTalk(
  log: QuestLog,
): QuestEventResult | null {
  const q = getChoirCountsQuest(log);
  if (!q || q.status !== "active" || q.talkedOldReed) {
    return null;
  }
  const next: ChoirCountsQuestProgress = {
    ...q,
    reachedMistmere: true,
    talkedOldReed: true,
  };
  return {
    log: withChoirCountsQuest(log, next),
    toast: "Old Reed: The fog carried a drowned count. Take the pier to the Choir.",
  };
}

/** Mark Sunken Choir / Choir Landing reached (sail or arrival). */
export function applyChoirCountsChoirReached(
  log: QuestLog,
): QuestEventResult | null {
  const q = getChoirCountsQuest(log);
  if (!q || q.status !== "active" || q.reachedChoir) {
    return null;
  }
  return {
    log: withChoirCountsQuest(log, { ...q, reachedChoir: true }),
    toast: q.talkedChoirKeeper
      ? "Choir Landing — Return to Rook with the rumor"
      : "Choir Landing — Talk to the Choir Keeper",
  };
}

/** Talk to Choir Keeper at Choir Landing. */
export function applyChoirCountsChoirKeeperTalk(
  log: QuestLog,
): QuestEventResult | null {
  const q = getChoirCountsQuest(log);
  if (!q || q.status !== "active" || q.talkedChoirKeeper) {
    return null;
  }
  const next: ChoirCountsQuestProgress = {
    ...q,
    reachedChoir: true,
    talkedChoirKeeper: true,
  };
  return {
    log: withChoirCountsQuest(log, next),
    toast:
      "Choir Keeper: The drowned hymn still counts. Carry the rumor home to Rook.",
  };
}

/** Complete The Choir Counts when talking to Rook after the Choir's rumor. */
export function applyChoirCountsRookTalk(log: QuestLog): QuestEventResult | null {
  const q = getChoirCountsQuest(log);
  if (!q || q.status !== "active") return null;
  if (!choirCountsObjectivesMet(q)) return null;
  let out = withChoirCountsQuest(log, { ...q, status: "complete" });
  const ensured = ensureNightglassAfterChoir(out);
  out = ensured.log;
  return {
    log: out,
    toast: ensured.started ? WHARF_START_TOAST : CHOIR_COUNTS_COMPLETE_LINE,
    completedId: CHOIR_COUNTS_QUEST_ID,
    startedWharf: ensured.started,
  };
}

/** Talk to Cress Ledger — enter the Choir rumor in the depot ledger (flag only). */
export function applyWharfCressTalk(log: QuestLog): QuestEventResult | null {
  const q = getWharfQuest(log);
  if (!q || q.status !== "active" || q.talkedCress) {
    return null;
  }
  const next: WharfQuestProgress = { ...q, talkedCress: true };
  return {
    log: withWharfQuest(log, next),
    toast:
      "Cress: The Choir's rumor is in the ledger. Take its mark to Nightglass — ask Vesper what the shore has learned.",
  };
}

/** Mark Nightglass Coast reached (gate, ship, or stand). */
export function applyWharfNightglassReached(
  log: QuestLog,
): QuestEventResult | null {
  const q = getWharfQuest(log);
  if (!q || q.status !== "active" || q.reachedNightglass) {
    return null;
  }
  return {
    log: withWharfQuest(log, { ...q, reachedNightglass: true }),
    toast: q.talkedVesper
      ? "Nightglass underfoot — Return to Rook when the shore answers"
      : "Nightglass underfoot — Talk to Captain Vesper at the Wharf",
  };
}

/** Talk to Captain Vesper (nightglass-pilot) at Nightglass Wharf. */
export function applyWharfVesperTalk(log: QuestLog): QuestEventResult | null {
  const q = getWharfQuest(log);
  if (!q || q.status !== "active" || q.talkedVesper) {
    return null;
  }
  const next: WharfQuestProgress = {
    ...q,
    reachedNightglass: true,
    talkedVesper: true,
  };
  return {
    log: withWharfQuest(log, next),
    toast:
      "Captain Vesper: The shore kept the count. A bark-hound hunts the strand — quiet it, then carry word home to Rook.",
  };
}

/** Complete The Wharf Answers when talking to Rook after the shore answers. */
export function applyWharfRookTalk(log: QuestLog): QuestEventResult | null {
  const q = getWharfQuest(log);
  if (!q || q.status !== "active") return null;
  if (!wharfObjectivesMet(q)) return null;
  let out = withWharfQuest(log, { ...q, status: "complete" });
  const ensured = ensureGreenGateAfterWharf(out);
  out = ensured.log;
  return {
    log: out,
    toast: ensured.started ? GREEN_GATE_START_TOAST : WHARF_COMPLETE_LINE,
    completedId: WHARF_QUEST_ID,
    startedGreenGate: ensured.started,
  };
}

/** Mark Verdant Spine gate reached (travel, stand, or arrival). */
export function applyGreenGateReached(log: QuestLog): QuestEventResult | null {
  const q = getGreenGateQuest(log);
  if (!q || q.status !== "active" || q.gateReached) {
    return null;
  }
  return {
    log: withGreenGateQuest(log, { ...q, gateReached: true }),
    toast: q.identifiedFox
      ? "Verdant Spine gate marked — Return to Rook with its measure"
      : "Verdant Spine gate marked — Name what hunts beyond it",
  };
}

/** Complete The Green Gate Keeps when talking to Rook after the fox is measured. */
export function applyGreenGateRookTalk(log: QuestLog): QuestEventResult | null {
  const q = getGreenGateQuest(log);
  if (!q || q.status !== "active") return null;
  if (!greenGateObjectivesMet(q)) return null;
  return {
    log: withGreenGateQuest(log, { ...q, status: "complete" }),
    toast: GREEN_GATE_COMPLETE_LINE,
    completedId: GREEN_GATE_QUEST_ID,
  };
}

/** Inspect an Ashwood Watch cairn (E interact). */
export function applyCairnInspect(
  log: QuestLog,
  cairnId: string,
): QuestEventResult | null {
  const watch = getWatchlineQuest(log);
  if (watch && watch.status === "active") {
    if (!ASHWOOD_CAIRN_IDS.includes(cairnId)) return null;
    if (cairnId !== WATCHLINE_CAIRN_ID) {
      return {
        log,
        toast: "Recheck the first cairn — West Watch on the ashwood edge.",
      };
    }
    if (watch.cairnInspected) {
      return {
        log,
        toast: "West Watch is already marked on the line.",
      };
    }
    const next: WatchlineQuestProgress = { ...watch, cairnInspected: true };
    return {
      log: withWatchlineQuest(log, next),
      toast: watchlineObjectivesMet(next)
        ? "West Watch marked — Return to Rook"
        : "West Watch marked — Identify or clear 1 Bark Hound",
    };
  }

  const ash = getAshwoodQuest(log);
  if (!ash || ash.status !== "active") return null;
  if (!ASHWOOD_CAIRN_IDS.includes(cairnId)) return null;
  if (ash.cairnsVisited.includes(cairnId)) {
    return {
      log,
      toast: "Cairn already marked on the watch.",
    };
  }
  const visited = [...ash.cairnsVisited, cairnId];
  const n = Math.min(visited.length, ASHWOOD_CAIRNS_NEEDED);
  const toast = `Watch cairn marked ${n}/${ASHWOOD_CAIRNS_NEEDED}`;
  return finishAshwoodIfReady(log, { ...ash, cairnsVisited: visited }, toast);
}

/** Rook line while sticky quests are active / complete. */
export function rookQuestLine(log: QuestLog | undefined): string | null {
  const green = getGreenGateQuest(log);
  if (green) {
    if (green.status === "complete") {
      return GREEN_GATE_COMPLETE_LINE.replace(/^Rook:\s*/, "");
    }
    if (!green.gateReached) {
      return "Nightglass answered, and the ledger holds. Take the green gate on Thornreach — Verdant Spine — name what hunts beyond it, and bring its measure home.";
    }
    if (!green.identifiedFox) {
      return "The green gate is marked. Identify a Gorse Fox on Verdant Spine — Name and Rank — then bring me its measure.";
    }
    if (!green.foxKilled) {
      return "The fox is named. Defeat one Gorse Fox on Verdant Spine, then bring me its measure.";
    }
    return "The green gate kept. Survive. Learn. Progress — the far road knows your footing when you tell me.";
  }

  const wharf = getWharfQuest(log);
  if (wharf) {
    if (wharf.status === "complete") {
      return WHARF_COMPLETE_LINE.replace(/^Rook:\s*/, "");
    }
    if (!wharf.talkedCress) {
      return "The water kept count. Cress will put the rumor in the ledger; take its mark to Nightglass and ask Vesper what the shore has learned.";
    }
    if (!wharf.talkedVesper) {
      if (!wharf.reachedNightglass) {
        return "The ledger holds the Choir's rumor. Cross the Mistmere gate or a coastal dock to Nightglass — Captain Vesper waits at Nightglass Wharf.";
      }
      return "You stand on Nightglass. Ask Captain Vesper at the Wharf what the shore has learned.";
    }
    if (!wharf.houndDone) {
      return "Vesper spoke. Defeat one Bark Hound on the Nightglass Coast, then bring me what the shore learned.";
    }
    return "Nightglass answered. Survive. Learn. Progress — the ledger holds when you tell me.";
  }

  const choir = getChoirCountsQuest(log);
  if (choir) {
    if (choir.status === "complete") {
      return CHOIR_COUNTS_COMPLETE_LINE.replace(/^Rook:\s*/, "");
    }
    if (!choir.reachedMistmere) {
      return "The Ember is quiet, but its memory reached the water. Cross the Mistmere gate, ask Old Reed what the fog carried, then take the Choir's rumor home.";
    }
    if (!choir.talkedOldReed) {
      return "You stand on Mistmere. Ask Old Reed — fog guide of the reed-path — what the fog carried.";
    }
    if (!choir.reachedChoir) {
      return "Old Reed spoke. Board Mistmere Pier and sail to the Sunken Choir — the Choir Keeper waits at Choir Landing.";
    }
    if (!choir.talkedChoirKeeper) {
      return "You reached the Choir. Talk to the Choir Keeper at Choir Landing, then bring the rumor home.";
    }
    return "The Choir kept count. Survive. Learn. Progress — the rumor ends when you tell me.";
  }

  const ashveil = getAshveilQuest(log);
  if (ashveil) {
    if (ashveil.status === "complete") {
      return ASHVEIL_COMPLETE_LINE.replace(/^Rook:\s*/, "");
    }
    if (!ashveil.reachedChamber) {
      return "The line holds above. Follow its memory below — the Ashveil chamber waits in the nearest Thornreach hollow. Name the Ember before you strike.";
    }
    if (!ashveil.identifiedEmber) {
      return "You found the deep chamber. Identify the Ashveil Ember — Name and Rank — before you swing wild.";
    }
    if (!ashveil.emberKilled) {
      return "The Ember is named. Quiet it, then bring me its quiet.";
    }
    return "The Ember is quiet. Survive. Learn. Progress — the road's memory ends when you tell me.";
  }

  const watch = getWatchlineQuest(log);
  if (watch) {
    if (watch.status === "complete") {
      return WATCHLIN