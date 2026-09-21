/** Sticky quests - First Story Accession hunts on Thornreach. */

import type { EnemyKindId } from "@/game/enemies";
import type { SkillId } from "@/game/skills";
import { getActiveQuestKey, GUEST_QUEST_KEY } from "@/account/storageScope";
import { ASHWOOD_CAIRN_IDS } from "@/game/cairns";

/** Guest key (offline). Active play uses getActiveQuestKey(). */
export const QUEST_STORAGE_KEY = GUEST_QUEST_KEY;

export const TEETH_QUEST_ID = "teeth-in-the-grass" as const;
export const ASHWOOD_QUEST_ID = "ashwood-watch" as const;

export type QuestId = typeof TEETH_QUEST_ID | typeof ASHWOOD_QUEST_ID;

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

export type QuestLog = {
  [TEETH_QUEST_ID]?: TeethQuestProgress;
  [ASHWOOD_QUEST_ID]?: AshwoodQuestProgress;
};

export const TEETH_RATS_NEEDED = 3;
export const ASHWOOD_CAIRNS_NEEDED = 3;

export const TEETH_QUEST_TITLE = "Teeth in the Grass";
export const ASHWOOD_QUEST_TITLE = "Ashwood Watch";

export const TEETH_START_TOAST =
  "Rook: Ashwood edge has wrong prey - Identify first.";

export const TEETH_COMPLETE_LINE =
  "Rook: Survive. Learn. Progress. The edge will remember your footing.";

export const ASHWOOD_START_TOAST =
  "Rook: Walk the ashwood watch — cairns mark where wrong prey still shows.";

export const ASHWOOD_COMPLETE_LINE =
  "Rook: The watch remembers. Survive. Learn. Progress.";

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

export function isTeethActive(log: QuestLog | undefined): boolean {
  const q = getTeethQuest(log);
  return Boolean(q && q.status === "active");
}

export function isAshwoodActive(log: QuestLog | undefined): boolean {
  const q = getAshwoodQuest(log);
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

export type QuestEventResult = {
  log: QuestLog;
  toast?: string;
  /** Which quest just completed (rewards). */
  completedId?: QuestId;
  /** Ashwood auto-started after Teeth. */
  startedAshwood?: boolean;
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
    return {
      log: withAshwoodQuest(log, { ...next, status: "complete" }),
      toast: ASHWOOD_COMPLETE_LINE,
      completedId: ASHWOOD_QUEST_ID,
    };
  }
  return { log: withAshwoodQuest(log, next), toast };
}

/** Apply Identify near-field on a Needle Rat (or any beast if already looking). */
export function applyIdentify(
  log: QuestLog,
  kindId: EnemyKindId,
): QuestEventResult | null {
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

/** Inspect an Ashwood Watch cairn (E interact). */
export function applyCairnInspect(
  log: QuestLog,
  cairnId: string,
): QuestEventResult | null {
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
  const ash = getAshwoodQuest(log);
  if (ash) {
    if (ash.status === "complete") {
      return ASHWOOD_COMPLETE_LINE.replace(/^Rook:\s*/, "");
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
