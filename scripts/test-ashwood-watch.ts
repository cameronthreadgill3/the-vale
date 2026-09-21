/** Pure-function checks for Teeth -> Ashwood Watch (no DOM). */
import {
  ASHWOOD_QUEST_ID,
  ASHWOOD_QUEST_TITLE,
  TEETH_QUEST_ID,
  applyCairnIdentify,
  applyEnemyKill,
  applyIdentify,
  applyRookTalk,
  emptyAshwoodQuest,
  emptyTeethQuest,
  ensureAshwoodUnlocked,
  getAshwoodQuest,
  isAshwoodActive,
  isTeethActive,
  rookQuestLine,
  sanitizeQuestLog,
  withAshwoodQuest,
  withTeethQuest,
  activeQuestHud,
} from "../src/game/quests.ts";

function assert(cond: unknown, msg: string): void {
  if (!cond) throw new Error(msg);
}

const teethDone = {
  id: TEETH_QUEST_ID,
  status: "complete" as const,
  identifiedRat: true,
  ratsKilled: 3,
  houndDone: true,
};

function run(): void {
  let log = withTeethQuest({}, emptyTeethQuest());
  assert(isTeethActive(log), "teeth starts active");
  assert(!isAshwoodActive(log), "ashwood locked while teeth active");

  const id = applyIdentify(log, "needle-rat");
  assert(id?.toast?.includes("Needle Rat"), "identify toast");
  log = id!.log;

  for (let i = 0; i < 3; i++) {
    const k = applyEnemyKill(log, "needle-rat");
    assert(k, `rat kill ${i}`);
    log = k!.log;
  }
  const hound = applyEnemyKill(log, "bark-hound");
  assert(hound?.completedId === TEETH_QUEST_ID, "teeth completes on hound");
  assert(getAshwoodQuest(hound!.log)?.status === "active", "ashwood unlocks");
  log = hound!.log;
  assert(!isTeethActive(log), "teeth no longer active");
  assert(isAshwoodActive(log), "ashwood active after teeth");

  const hud0 = activeQuestHud(log);
  assert(hud0?.title === ASHWOOD_QUEST_TITLE, "HUD switches to Ashwood Watch");

  assert(
    applyCairnIdentify(log, "cairn-west") === null,
    "cairns locked until Rook accept",
  );

  const accept = applyRookTalk(log);
  assert(accept?.log[ASHWOOD_QUEST_ID]?.accepted, "Rook accept");
  assert(!accept?.completedId, "accept is not payoff");
  log = accept!.log;

  const c1 = applyCairnIdentify(log, "cairn-west");
  assert(c1?.toast?.includes("1/2"), "first cairn");
  log = c1!.log;
  const c2 = applyCairnIdentify(log, "cairn-north");
  assert(c2?.toast?.toLowerCase().includes("wrong prey"), "second cairn");
  log = c2!.log;
  assert(applyCairnIdentify(log, "cairn-west") === null, "no double identify");

  const prey = applyEnemyKill(log, "bark-hound");
  assert(prey && !prey.completedId, "wrong prey does not auto-complete");
  log = prey!.log;

  const payoff = applyRookTalk(log);
  assert(payoff?.completedId === ASHWOOD_QUEST_ID, "Rook payoff completes");
  assert(payoff?.rewards?.gold === 36, "ashwood rewards");
  log = payoff!.log;
  assert(!isAshwoodActive(log), "ashwood complete");
  assert(rookQuestLine(log)?.includes("watch holds"), "Rook complete line");

  const legacy = sanitizeQuestLog(
    withTeethQuest({}, teethDone),
  );
  const unlocked = ensureAshwoodUnlocked(legacy);
  assert(isAshwoodActive(unlocked), "legacy teeth-complete unlocks watch");

  const dropped = sanitizeQuestLog(
    withAshwoodQuest(withTeethQuest({}, emptyTeethQuest()), emptyAshwoodQuest()),
  );
  assert(!dropped[ASHWOOD_QUEST_ID], "ashwood stripped if teeth incomplete");

  const lucasFree = JSON.stringify(log);
  assert(!/lucas/i.test(lucasFree), "no Lucas transplant in quest log");

  console.log("ashwood-watch tests ok");
}

run();
