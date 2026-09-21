/** Sticky quests - First Story Accession hunts on Thornreach. */

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

/** Depot clerk — Cress Ledger in folk.ts. */
export const CRESS_FOLK_ID = "cress-ledger" as const;
/** First Ashwood Watch cairn (West Watch) — recheck on the ashwood edge. */
export const WATCHLINE_CAIRN_ID = "cairn-west" as const;

export type QuestId =
  | typeof TEETH_QUEST_ID
  | typeof ASHWOOD_QUEST_ID
  | typeof HOLLOW_QUEST_ID
  | typeof GATE_QUEST_ID
  | typeof MISTMERE_QUEST_ID
  | typeof WATCHLINE_QUEST_ID;

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

export type QuestLog = {
  [TEETH_QUEST_ID]?: TeethQuestProgress;
  [ASHWOOD_QUEST_ID]?: AshwoodQuestProgress;
  [HOLLOW_QUEST_ID]?: HollowQuestProgress;
  [GATE_QUEST_ID]?: GateWatchQuestProgress;
  [MISTMERE_QUEST_ID]?: MistmereQuestProgress;
  [WATCHLINE_QUEST_ID]?: WatchlineQuestProgress;
};

export const TEETH_RATS_NEEDED = 3;
export const ASHWOOD_CAIRNS_NEEDED = 3;
export const HOLLOW_WISPS_NEEDED = 2;

export const TEETH_QUEST_TITLE = "Teeth in the Grass";
export const ASHWOOD_QUEST_TITLE = "Ashwood Watch";
export const HOLLOW_QUEST_TITLE = "Hollow Watch";
export const GATE_QUEST_TITLE = "Gate Watch";
export const MISTMERE_QUEST_TITLE = "Mistmere Crossing";
export const WATCHLINE_QUEST_TITLE = "The Watchline Holds";

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
): QuestEventResult | null {
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
): QuestEventResult | null {
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
  return {
    log: withWatchlineQuest(log, { ...watch, status: "complete" }),
    toast: WATCHLINE_COMPLETE_LINE,
    completedId: WATCHLINE_QUEST_ID,
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
  const watch = getWatchlineQuest(log);
  if (watch) {
    if (watch.status === "complete") {
      return WATCHLINE_COMPLETE_LINE.replace(/^Rook:\s*/, "");
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
