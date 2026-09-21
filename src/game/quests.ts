/** Sticky quests - First Story Accession hunt on Thornreach. */

import type { EnemyKindId } from "@/game/enemies";
import type { SkillId } from "@/game/skills";

export const TEETH_QUEST_ID = "teeth-in-the-grass" as const;

export type QuestId = typeof TEETH_QUEST_ID;

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

export type QuestLog = {
  [TEETH_QUEST_ID]?: TeethQuestProgress;
};

export const TEETH_RATS_NEEDED = 3;

export const TEETH_QUEST_TITLE = "Teeth in the Grass";

export const TEETH_START_TOAST =
  "Rook: Ashwood edge has wrong prey - Identify first.";

export const TEETH_COMPLETE_LINE =
  "Rook: Survive. Learn. Progress. The edge will remember your footing.";

export const TEETH_REWARDS = {
  gold: 28,
  combatXp: 55,
  skill: "shielding" as SkillId,
  skillXp: 22,
};

export function emptyTeethQuest(): TeethQuestProgress {
  return {
    id: TEETH_QUEST_ID,
    status: "active",
    identifiedRat: false,
    ratsKilled: 0,
    houndDone: false,
  };
}

export function sanitizeQuestLog(raw: unknown): QuestLog {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  const teeth = obj[TEETH_QUEST_ID];
  if (!teeth || typeof teeth !== "object") return {};
  const t = teeth as Record<string, unknown>;
  const status: QuestStatus =
    t.status === "complete" ? "complete" : "active";
  const ratsKilled =
    typeof t.ratsKilled === "number" && Number.isFinite(t.ratsKilled)
      ? Math.max(0, Math.min(99, Math.floor(t.ratsKilled)))
      : 0;
  return {
    [TEETH_QUEST_ID]: {
      id: TEETH_QUEST_ID,
      status,
      identifiedRat: Boolean(t.identifiedRat),
      ratsKilled,
      houndDone: Boolean(t.houndDone),
    },
  };
}

export function getTeethQuest(log: QuestLog | undefined): TeethQuestProgress | null {
  return log?.[TEETH_QUEST_ID] ?? null;
}

export function isTeethActive(log: QuestLog | undefined): boolean {
  const q = getTeethQuest(log);
  return Boolean(q && q.status === "active");
}

export function teethObjectivesMet(q: TeethQuestProgress): boolean {
  return (
    q.identifiedRat &&
    q.ratsKilled >= TEETH_RATS_NEEDED &&
    q.houndDone
  );
}

/** HUD lines for the sticky quest panel (minimal). */
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

export type QuestEventResult = {
  quest: TeethQuestProgress;
  toast?: string;
  completed?: boolean;
};

/** Apply Identify near-field on a Needle Rat (or any beast if already looking). */
export function applyIdentify(
  log: QuestLog,
  kindId: EnemyKindId,
): QuestEventResult | null {
  const q = getTeethQuest(log);
  if (!q || q.status !== "active" || q.identifiedRat) return null;
  if (kindId !== "needle-rat" && kindId !== "briar-mite" && kindId !== "bark-hound") {
    return null;
  }
  const next: TeethQuestProgress = { ...q, identifiedRat: true };
  const toast =
    kindId === "needle-rat"
      ? "Identified: Needle Rat / F"
      : `Identified: ${kindId === "bark-hound" ? "Bark Hound" : "Briar Mite"} / F`;
  return finishIfReady(next, toast);
}

export function applyEnemyKill(
  log: QuestLog,
  kindId: EnemyKindId,
): QuestEventResult | null {
  const q = getTeethQuest(log);
  if (!q || q.status !== "active") return null;
  let next = { ...q };
  let toast: string | undefined;
  if (kindId === "needle-rat" && next.ratsKilled < TEETH_RATS_NEEDED) {
    next = { ...next, ratsKilled: next.ratsKilled + 1 };
    toast = `Needle Rats ${Math.min(next.ratsKilled, TEETH_RATS_NEEDED)}/${TEETH_RATS_NEEDED}`;
  } else if (kindId === "bark-hound" && !next.houndDone) {
    next = { ...next, houndDone: true };
    toast = "Bark Hound driven off";
  } else {
    return null;
  }
  return finishIfReady(next, toast);
}

function finishIfReady(
  next: TeethQuestProgress,
  toast?: string,
): QuestEventResult {
  if (teethObjectivesMet(next) && next.status === "active") {
    return {
      quest: { ...next, status: "complete" },
      toast: TEETH_COMPLETE_LINE,
      completed: true,
    };
  }
  return { quest: next, toast };
}

export function withTeethQuest(
  log: QuestLog | undefined,
  quest: TeethQuestProgress,
): QuestLog {
  return { ...(log ?? {}), [TEETH_QUEST_ID]: quest };
}

/** Rook line while the hunt is sticky. */
export function rookQuestLine(log: QuestLog | undefined): string | null {
  const q = getTeethQuest(log);
  if (!q) return null;
  if (q.status === "complete") {
    return TEETH_COMPLETE_LINE.replace(/^Rook:\s*/, "");
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
