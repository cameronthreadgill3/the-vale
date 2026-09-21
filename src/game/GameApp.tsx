import { useCallback, useEffect, useState, useRef } from "react";
import { getClass, type ClassId } from "@/game/classes";
import { getContinent, type ContinentId } from "@/game/continents";
import {
  awardSkillXp,
  awardProfessionXp,
  clearCharacter,
  createCharacter,
  clearHollowReturn,
  enterHollow,
  exitHollow,
  loadCharacter,
  travelToContinent,
  markFolkMet,
  removeInventoryItem,
  setGold,
  awardCombatXp,
  setVitals,
  applyDeath,
  setQuickSlot,
  tryAddInventoryItem,
  equipItem,
  unequipSlot,
  unlockPremiumBackpack,
  depositItem,
  withdrawItem,
  depositGold,
  withdrawGold,
  type ValeCharacter,
} from "@/game/character";
import {
  TEETH_START_TOAST,
  TEETH_REWARDS,
  TEETH_COMPLETE_LINE,
  ASHWOOD_START_TOAST,
  ASHWOOD_REWARDS,
  ASHWOOD_COMPLETE_LINE,
  HOLLOW_START_TOAST,
  HOLLOW_REWARDS,
  HOLLOW_COMPLETE_LINE,
  GATE_START_TOAST,
  GATE_REWARDS,
  GATE_COMPLETE_LINE,
  MISTMERE_START_TOAST,
  MISTMERE_REWARDS,
  MISTMERE_COMPLETE_LINE,
  WATCHLINE_START_TOAST,
  WATCHLINE_REWARDS,
  WATCHLINE_COMPLETE_LINE,
  ASHVEIL_START_TOAST,
  ASHVEIL_REWARDS,
  ASHVEIL_COMPLETE_LINE,
  CHOIR_COUNTS_START_TOAST,
  CHOIR_COUNTS_REWARDS,
  CHOIR_COUNTS_COMPLETE_LINE,
  WHARF_START_TOAST,
  WHARF_REWARDS,
  WHARF_COMPLETE_LINE,
  GREEN_GATE_START_TOAST,
  GREEN_GATE_REWARDS,
  GREEN_GATE_COMPLETE_LINE,
  SPINE_START_TOAST,
  SPINE_REWARDS,
  SPINE_COMPLETE_LINE,
  PALE_START_TOAST,
  PALE_REWARDS,
  PALE_COMPLETE_LINE,
  TEETH_QUEST_ID,
  ASHWOOD_QUEST_ID,
  HOLLOW_QUEST_ID,
  GATE_QUEST_ID,
  MISTMERE_QUEST_ID,
  WATCHLINE_QUEST_ID,
  ASHVEIL_QUEST_ID,
  CHOIR_COUNTS_QUEST_ID,
  WHARF_QUEST_ID,
  GREEN_GATE_QUEST_ID,
  SPINE_QUEST_ID,
  PALE_QUEST_ID,
  CRESS_FOLK_ID,
  OLD_REED_FOLK_ID,
  CHOIR_KEEPER_FOLK_ID,
  VESPER_FOLK_ID,
  emptyTeethQuest,
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
  applyIdentify,
  applyEnemyKill,
  applyCairnInspect,
  applyHollowEnter,
  applyGateReached,
  applyGateWatchRookTalk,
  applyMistmereReached,
  applyMistmereOldReedTalk,
  applyMistmereRookTalk,
  applyWatchlineCressTalk,
  applyWatchlineRookTalk,
  applyAshveilRookTalk,
  applyChoirCountsMistmereReached,
  applyChoirCountsOldReedTalk,
  applyChoirCountsChoirReached,
  applyChoirCountsChoirKeeperTalk,
  applyChoirCountsRookTalk,
  applyWharfCressTalk,
  applyWharfNightglassReached,
  applyWharfVesperTalk,
  applyWharfRookTalk,
  applyGreenGateReached,
  applyGreenGateRookTalk,
  applySpineReached,
  applySpineRookTalk,
  applyPaleReached,
  applyPaleRookTalk,
  withTeethQuest,
  ensureAshwoodAfterTeeth,
  ensureHollowAfterAshwood,
  ensureGateWatchAfterHollow,
  ensureMistmereAfterGate,
  ensureWatchlineAfterMistmere,
  ensureAshveilAfterWatchline,
  ensureChoirCountsAfterAshveil,
  ensureNightglassAfterChoir,
  ensureGreenGateAfterWharf,
  ensureSpineAfterGreenGate,
  ensurePaleAfterSpine,
  rookQuestLine,
  loadQuestLog,
  saveQuestLog,
  clearQuestLog,
  setQuestUiHandler,
} from "@/game/quests";
import {
  ASHVEIL_EMBER_DEFEAT_TOAST,
  isHollowBoss,
  type EnemyKindId,
} from "@/game/enemies";
import {
  SKILLS,
  SKILL_IDS,
  skillSnapshot,
  type SkillId,
} from "@/game/skills";
import { getItem, isItemId, type EquipSlot, type ItemId } from "@/game/items";
import {
  PROFESSIONS,
  getCraftRecipe,
  getProfessionNode,
  isNodeReady,
  markNodeUsed,
  professionName,
  professionSnapshot,
} from "@/game/professions";
import {
  getFolk,
  getShop,
  getDock,
  dockSpawnForContinent,
  folkOnContinent,
} from "@/game/folk";
import {
  canAffordFare,
  fareFailToast,
  farePaidToast,
  quoteGateFare,
  quoteShipFare,
} from "@/game/travelFares";
import { maxHpFor, LOW_HP_RATIO, LOW_HP_TOAST } from "@/game/combat";
import {
  canCarry,
  formatBankToast,
  formatDeathToast,
  toastForCarryFail,
  DEATH_TOAST_MS,
} from "@/game/backpack";
import { formatPickupToast } from "@/game/loot";
import { clearBodyMarker } from "@/game/bodyMarker";
import {
  consumePremiumQuery,
  isPremiumDemoAllowed,
  startPremiumCheckout,
  verifyPremiumSession,
} from "@/game/premium";
import { ClassSelectOverlay } from "@/game/ui/ClassSelectOverlay";
import { GameShell } from "@/game/GameShell";

const TRAIN_SKILL_XP = 18;

function skillRowsFrom(character: ValeCharacter) {
  return SKILL_IDS.map((id) => {
    const def = SKILLS.find((s) => s.id === id)!;
    const snap = skillSnapshot(character.skillXp[id]);
    return { id, name: def.name, hotkey: def.hotkey, ...snap };
  });
}

function professionRowsFrom(character: ValeCharacter) {
  return PROFESSIONS.map((p) => {
    const xp = character.professionXp?.[p.id] ?? 0;
    return { id: p.id, name: p.name, blurb: p.blurb, ...professionSnapshot(xp) };
  });
}

export function GameApp() {
  const [character, setCharacter] = useState<ValeCharacter | null>(() =>
    loadCharacter(),
  );
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [skillTick, setSkillTick] = useState(0);
  const [arrivedFrom, setArrivedFrom] = useState<ContinentId | null>(null);
  const [shipSpawn, setShipSpawn] = useState<{ x: number; y: number } | null>(
    null,
  );
  /** Bumps GameShell remount on death so deadLock / spawn reset even on same continent. */
  const [worldEpoch, setWorldEpoch] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [lootToast, setLootToast] = useState<string | null>(null);
  const lootToastGen = useRef(0);
  const lowHpWarnedRef = useRef(false);
  const [dialogue, setDialogue] = useState<{
    name: string;
    line: string;
    hasShop: boolean;
    hasBank?: boolean;
    hasCraft?: boolean;
    shopId?: string;
    bankId?: string;
    craftId?: string;
  } | null>(null);
  const [activeShopId, setActiveShopId] = useState<string | null>(null);
  const [activeDockId, setActiveDockId] = useState<string | null>(null);
  const [bankOpen, setBankOpen] = useState(false);
  const [packOpen, setPackOpen] = useState(false);
  const [premiumUnlocking, setPremiumUnlocking] = useState(false);
  const [craftOpen, setCraftOpen] = useState(false);

  const pickClass = useCallback((id: ClassId) => {
    const created = createCharacter(id);
    saveQuestLog(withTeethQuest(loadQuestLog(), emptyTeethQuest()));
    setCharacter(created);
    setArrivedFrom(null);
    setShipSpawn(null);
    setWorldEpoch(0);
    clearBodyMarker();
    setToast("First Story · Thornvale — Survive · Learn · Progress");
    window.setTimeout(() => setToast((t) =>
      t === "First Story · Thornvale — Survive · Learn · Progress" ? null : t
    ), 2800);
    window.setTimeout(() => {
      setToast(TEETH_START_TOAST);
      window.setTimeout(() => setToast((t) => (t === TEETH_START_TOAST ? null : t)), 3600);
    }, 3000);
  }, []);

  const resetPath = useCallback(() => {
    clearCharacter();
    clearQuestLog();
    setCharacter(null);
    setSkillsOpen(false);
    setMapOpen(false);
    setArrivedFrom(null);
    setShipSpawn(null);
    setDialogue(null);
    setActiveShopId(null);
    setActiveDockId(null);
    setBankOpen(false);
    setPackOpen(false);
    setCraftOpen(false);
    setWorldEpoch(0);
    clearBodyMarker();
  }, []);

  const toggleSkills = useCallback(() => {
    setMapOpen(false);
    setSkillsOpen((o) => !o);
  }, []);

  const toggleMap = useCallback(() => {
    setSkillsOpen(false);
    setMapOpen((o) => !o);
  }, []);

  const showToast = useCallback((msg: string, ms = 2200) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), ms);
  }, []);

  const showLootToast = useCallback((msg: string, ms = 2400) => {
    lootToastGen.current += 1;
    const gen = lootToastGen.current;
    setLootToast(msg);
    window.setTimeout(() => {
      if (lootToastGen.current === gen) setLootToast(null);
    }, ms);
  }, []);

  useEffect(() => {
    setQuestUiHandler((toast) => {
      if (toast) showToast(toast, 2800);
      else setSkillTick((t) => t + 1);
    });
    return () => setQuestUiHandler(null);
  }, [showToast]);

  const trainSkill = useCallback((skill: SkillId) => {
    setCharacter((prev) => {
      if (!prev) return prev;
      const before = prev.skillXp[skill];
      const next: ValeCharacter = {
        ...prev,
        skillXp: { ...prev.skillXp },
      };
      awardSkillXp(next, skill, TRAIN_SKILL_XP);
      const gained = next.skillXp[skill] - before;
      const beforeLvl = skillSnapshot(before).level;
      const afterLvl = skillSnapshot(next.skillXp[skill]).level;
      const label = SKILLS.find((s) => s.id === skill)?.name ?? skill;
      queueMicrotask(() => {
        if (afterLvl > beforeLvl) {
          showToast(`${label} reached level ${afterLvl}`);
        } else {
          showToast(`${label} +${gained} XP`);
        }
      });
      return { ...next, skillXp: { ...next.skillXp } };
    });
    setSkillTick((t) => t + 1);
  }, [showToast]);

  const assignQuickSlot = useCallback((index: number, skill: SkillId) => {
    setCharacter((prev) => (prev ? setQuickSlot(prev, index, skill) : prev));
    const label = SKILLS.find((s) => s.id === skill)?.name ?? skill;
    showToast(`${label} → slot ${index + 1}`);
  }, [showToast]);

  const goContinent = useCallback(
    (target: ContinentId, from: ContinentId): boolean => {
      let blockedQuote: ReturnType<typeof quoteGateFare> | null = null;
      let paid = 0;
      let firstCrossing = false;
      let travelled = false;
      setCharacter((prev) => {
        if (!prev) return prev;
        const quote = quoteGateFare(
          prev.continentId,
          target,
          prev.discoveredContinents,
        );
        if (!canAffordFare(prev.gold, quote)) {
          blockedQuote = quote;
          return prev;
        }
        paid = quote.gold;
        firstCrossing = quote.firstCrossing;
        let next = prev;
        if (paid > 0) next = setGold(next, next.gold - paid);
        travelled = true;
        return travelToContinent(next, target);
      });
      if (blockedQuote) {
        showToast(fareFailToast(blockedQuote));
        return false;
      }
      if (!travelled) return false;
      setArrivedFrom(from);
      setShipSpawn(null);
      setMapOpen(false);
      setDialogue(null);
      setActiveShopId(null);
      setActiveDockId(null);
      setBankOpen(false);
      setPackOpen(false);
      setCraftOpen(false);
      if (target === "mistmere") {
        const gateResult = applyGateReached(loadQuestLog());
        if (gateResult) {
          saveQuestLog(gateResult.log);
          if (gateResult.toast) {
            showToast(gateResult.toast);
            window.setTimeout(
              () => setToast((t) => (t === gateResult.toast ? null : t)),
              2800,
            );
            return true;
          }
        }
        const mistResult = applyMistmereReached(loadQuestLog());
        if (mistResult) {
          saveQuestLog(mistResult.log);
          if (mistResult.toast) {
            showToast(mistResult.toast);
            window.setTimeout(
              () => setToast((t) => (t === mistResult.toast ? null : t)),
              2800,
            );
            return true;
          }
        }
        const choirMist = applyChoirCountsMistmereReached(loadQuestLog());
        if (choirMist) {
          saveQuestLog(choirMist.log);
          if (choirMist.toast) {
            showToast(choirMist.toast);
            window.setTimeout(
              () => setToast((t) => (t === choirMist.toast ? null : t)),
              2800,
            );
            return true;
          }
        }
      }
      if (target === "sunken-choir") {
        const choirLand = applyChoirCountsChoirReached(loadQuestLog());
        if (choirLand) {
          saveQuestLog(choirLand.log);
          if (choirLand.toast) {
            showToast(choirLand.toast);
            window.setTimeout(
              () => setToast((t) => (t === choirLand.toast ? null : t)),
              2800,
            );
            return true;
          }
        }
      }
      if (target === "nightglass-coast") {
        const night = applyWharfNightglassReached(loadQuestLog());
        if (night) {
          saveQuestLog(night.log);
          if (night.toast) {
            showToast(night.toast);
            window.setTimeout(
              () => setToast((t) => (t === night.toast ? null : t)),
              2800,
            );
            return true;
          }
        }
      }
      if (target === "verdant-spine") {
        const green = applyGreenGateReached(loadQuestLog());
        if (green) {
          saveQuestLog(green.log);
          if (green.toast) {
            showToast(green.toast);
            window.setTimeout(
              () => setToast((t) => (t === green.toast ? null : t)),
              2800,
            );
            return true;
          }
        }
        const spine = applySpineReached(loadQuestLog());
        if (spine) {
          saveQuestLog(spine.log);
          if (spine.toast) {
            showToast(spine.toast);
            window.setTimeout(
              () => setToast((t) => (t === spine.toast ? null : t)),
              2800,
            );
            return true;
          }
        }
      }
      if (target === "pale-wastes") {
        const pale = applyPaleReached(loadQuestLog());
        if (pale) {
          saveQuestLog(pale.log);
          if (pale.toast) {
            showToast(pale.toast);
            window.setTimeout(
              () => setToast((t) => (t === pale.toast ? null : t)),
              2800,
            );
            return true;
          }
        }
      }
      const dest = getContinent(target);
      if (paid > 0 || firstCrossing) {
        showToast(farePaidToast("gate", dest.name, paid));
      } else if (folkOnContinent(target).length === 0) {
        showToast(`${dest.name} — ${dest.blurb}`);
      } else {
        showToast(`Gate opens onto ${dest.name}`);
      }
      return true;
    },
    [showToast],
  );

  const goHollow = useCallback(
    (index: number, returnTile: { x: number; y: number }) => {
      setCharacter((prev) =>
        prev ? enterHollow(prev, index, returnTile) : prev,
      );
      setArrivedFrom(null);
      setShipSpawn(null);
      setDialogue(null);
      setActiveShopId(null);
      setActiveDockId(null);
      showToast(`Descending into Hollow ${index + 1}`);
    },
    [showToast],
  );

  const leaveHollow = useCallback(() => {
    setCharacter((prev) => (prev ? exitHollow(prev) : prev));
    setArrivedFrom(null);
    setShipSpawn(null);
    showToast("Returning to the overworld");
  }, [showToast]);

  const openFolk = useCallback((folkId: string) => {
    const folk = getFolk(folkId);
    if (!folk) return;
    setActiveShopId(null);
    setActiveDockId(null);
    setBankOpen(false);
    setPackOpen(false);
    let line = folk.line;
    if (folkId === OLD_REED_FOLK_ID) {
      const choirReed = applyChoirCountsOldReedTalk(loadQuestLog());
      if (choirReed) {
        saveQuestLog(choirReed.log);
        if (choirReed.toast) {
          line = choirReed.toast.replace(/^Old Reed:\s*/, "");
          queueMicrotask(() => showToast(choirReed.toast!));
        }
      } else {
        const reed = applyMistmereOldReedTalk(loadQuestLog());
        if (reed) {
          saveQuestLog(reed.log);
          if (reed.toast) {
            line = reed.toast.replace(/^Old Reed:\s*/, "");
            queueMicrotask(() => showToast(reed.toast!));
          }
        }
      }
    }
    if (folkId === CHOIR_KEEPER_FOLK_ID) {
      const keeper = applyChoirCountsChoirKeeperTalk(loadQuestLog());
      if (keeper) {
        saveQuestLog(keeper.log);
        if (keeper.toast) {
          line = keeper.toast.replace(/^Choir Keeper:\s*/, "");
          queueMicrotask(() => showToast(keeper.toast!));
        }
      }
    }
    if (folkId === VESPER_FOLK_ID) {
      const vesper = applyWharfVesperTalk(loadQuestLog());
      if (vesper) {
        saveQuestLog(vesper.log);
        if (vesper.toast) {
          line = vesper.toast.replace(/^Captain Vesper:\s*/, "");
          queueMicrotask(() => showToast(vesper.toast!));
        }
      }
    }
    if (folkId === CRESS_FOLK_ID) {
      const cress =
        applyWatchlineCressTalk(loadQuestLog()) ??
        applyWharfCressTalk(loadQuestLog());
      if (cress) {
        saveQuestLog(cress.log);
        if (cress.toast) {
          line = cress.toast.replace(/^Cress:\s*/, "");
          queueMicrotask(() => showToast(cress.toast!));
        }
      }
    }
    if (folkId === "rook" && character) {
      const turnIn =
        applyPaleRookTalk(loadQuestLog()) ??
        applySpineRookTalk(loadQuestLog()) ??
        applyGreenGateRookTalk(loadQuestLog()) ??
        applyWharfRookTalk(loadQuestLog()) ??
        applyChoirCountsRookTalk(loadQuestLog()) ??
        applyAshveilRookTalk(loadQuestLog()) ??
        applyWatchlineRookTalk(loadQuestLog()) ??
        applyMistmereRookTalk(loadQuestLog()) ??
        applyGateWatchRookTalk(loadQuestLog());
      if (turnIn) {
        saveQuestLog(turnIn.log);
        setCharacter((prev) => {
          if (!prev) return prev;
          let next: ValeCharacter = {
            ...prev,
            skillXp: { ...prev.skillXp },
          };
          if (turnIn.completedId === PALE_QUEST_ID) {
            next = awardCombatXp(next, PALE_REWARDS.combatXp);
            next = { ...next, skillXp: { ...next.skillXp } };
            awardSkillXp(next, PALE_REWARDS.skill, PALE_REWARDS.skillXp);
            next = setGold(next, next.gold + PALE_REWARDS.gold);
            next = { ...next, skillXp: { ...next.skillXp } };
            queueMicrotask(() => {
              showToast(PALE_COMPLETE_LINE);
              setSkillTick((t) => t + 1);
            });
          } else if (turnIn.completedId === SPINE_QUEST_ID) {
            next = awardCombatXp(next, SPINE_REWARDS.combatXp);
            next = { ...next, skillXp: { ...next.skillXp } };
            awardSkillXp(next, SPINE_REWARDS.skill, SPINE_REWARDS.skillXp);
            next = setGold(next, next.gold + SPINE_REWARDS.gold);
            next = { ...next, skillXp: { ...next.skillXp } };
            queueMicrotask(() => {
              showToast(
                turnIn.startedPale ? PALE_START_TOAST : SPINE_COMPLETE_LINE,
              );
              setSkillTick((t) => t + 1);
            });
          } else if (turnIn.completedId === GREEN_GATE_QUEST_ID) {
            next = awardCombatXp(next, GREEN_GATE_REWARDS.combatXp);
            next = { ...next, skillXp: { ...next.skillXp } };
            awardSkillXp(next, GREEN_GATE_REWARDS.skill, GREEN_GATE_REWARDS.skillXp);
            next = setGold(next, next.gold + GREEN_GATE_REWARDS.gold);
            next = { ...next, skillXp: { ...next.skillXp } };
            queueMicrotask(() => {
              showToast(
                turnIn.startedSpine
                  ? SPINE_START_TOAST
                  : GREEN_GATE_COMPLETE_LINE,
              );
              setSkillTick((t) => t + 1);
            });
          } else if (turnIn.completedId === WHARF_QUEST_ID) {
            next = awardCombatXp(next, WHARF_REWARDS.combatXp);
            next = { ...next, skillXp: { ...next.skillXp } };
            awardSkillXp(next, WHARF_REWARDS.skill, WHARF_REWARDS.skillXp);
            next = setGold(next, next.gold + WHARF_REWARDS.gold);
            next = { ...next, skillXp: { ...next.skillXp } };
            queueMicrotask(() => {
              showToast(
                turnIn.startedGreenGate
                  ? GREEN_GATE_START_TOAST
                  : WHARF_COMPLETE_LINE,
              );
              setSkillTick((t) => t + 1);
            });
          } else if (turnIn.completedId === CHOIR_COUNTS_QUEST_ID) {
            next = awardCombatXp(next, CHOIR_COUNTS_REWARDS.combatXp);
            next = { ...next, skillXp: { ...next.skillXp } };
            awardSkillXp(
              next,
              CHOIR_COUNTS_REWARDS.skill,
              CHOIR_COUNTS_REWARDS.skillXp,
            );
            next = setGold(next, next.gold + CHOIR_COUNTS_REWARDS.gold);
            next = { ...next, skillXp: { ...next.skillXp } };
            queueMicrotask(() => {
              showToast(
                turnIn.startedWharf
                  ? WHARF_START_TOAST
                  : CHOIR_COUNTS_COMPLETE_LINE,
              );
              setSkillTick((t) => t + 1);
            });
          } else if (turnIn.completedId === ASHVEIL_QUEST_ID) {
            next = awardCombatXp(next, ASHVEIL_REWARDS.combatXp);
            next = { ...next, skillXp: { ...next.skillXp } };
            awardSkillXp(next, ASHVEIL_REWARDS.skill, ASHVEIL_REWARDS.skillXp);
            next = setGold(next, next.gold + ASHVEIL_REWARDS.gold);
            next = { ...next, skillXp: { ...next.skillXp } };
            queueMicrotask(() => {
              showToast(
                turnIn.startedChoirCounts
                  ? CHOIR_COUNTS_START_TOAST
                  : ASHVEIL_COMPLETE_LINE,
              );
              setSkillTick((t) => t + 1);
            });
          } else if (turnIn.completedId === WATCHLINE_QUEST_ID) {
            next = awardCombatXp(next, WATCHLINE_REWARDS.combatXp);
            next = { ...next, skillXp: { ...next.skillXp } };
            awardSkillXp(next, WATCHLINE_REWARDS.skill, WATCHLINE_REWARDS.skillXp);
            next = setGold(next, next.gold + WATCHLINE_REWARDS.gold);
            next = { ...next, skillXp: { ...next.skillXp } };
            queueMicrotask(() => {
              showToast(
                turnIn.startedAshveil
                  ? ASHVEIL_START_TOAST
                  : WATCHLINE_COMPLETE_LINE,
              );
              setSkillTick((t) => t + 1);
            });
          } else if (turnIn.completedId === MISTMERE_QUEST_ID) {
            next = awardCombatXp(next, MISTMERE_REWARDS.combatXp);
            next = { ...next, skillXp: { ...next.skillXp } };
            awardSkillXp(next, MISTMERE_REWARDS.skill, MISTMERE_REWARDS.skillXp);
            next = setGold(next, next.gold + MISTMERE_REWARDS.gold);
            next = { ...next, skillXp: { ...next.skillXp } };
            queueMicrotask(() => {
              showToast(
                turnIn.startedWatchline
                  ? WATCHLINE_START_TOAST
                  : MISTMERE_COMPLETE_LINE,
              );
              setSkillTick((t) => t + 1);
            });
          } else if (turnIn.completedId === GATE_QUEST_ID) {
            next = awardCombatXp(next, GATE_REWARDS.combatXp);
            next = { ...next, skillXp: { ...next.skillXp } };
            awardSkillXp(next, GATE_REWARDS.skill, GATE_REWARDS.skillXp);
            next = setGold(next, next.gold + GATE_REWARDS.gold);
            next = { ...next, skillXp: { ...next.skillXp } };
            queueMicrotask(() => {
              showToast(
                turnIn.startedMistmere
                  ? MISTMERE_START_TOAST
                  : GATE_COMPLETE_LINE,
              );
              setSkillTick((t) => t + 1);
            });
          } else if (turnIn.toast) {
            queueMicrotask(() => showToast(turnIn.toast!));
          }
          return next;
        });
      }
      const hook = rookQuestLine(loadQuestLog());
      if (hook) line = hook;
    }
    setDialogue({
      name: folk.name,
      line,
      hasShop: Boolean(folk.shopId),
      hasBank: Boolean(folk.bankId),
      hasCraft: Boolean(folk.craftId),
      shopId: folk.shopId,
      bankId: folk.bankId,
      craftId: folk.craftId,
    });
    setCharacter((prev) => (prev ? markFolkMet(prev, folkId) : prev));
  }, [character, showToast]);

  const openShop = useCallback((shopId: string) => {
    setDialogue(null);
    setActiveDockId(null);
    setBankOpen(false);
    setCraftOpen(false);
    setActiveShopId(shopId);
  }, []);

  const openCraft = useCallback(() => {
    setDialogue(null);
    setActiveShopId(null);
    setActiveDockId(null);
    setBankOpen(false);
    setPackOpen(false);
    setCraftOpen(true);
  }, []);

  const openShip = useCallback((dockId: string) => {
    setDialogue(null);
    setActiveShopId(null);
    setBankOpen(false);
    setActiveDockId(dockId);
  }, []);

  const openBank = useCallback(() => {
    setDialogue(null);
    setActiveShopId(null);
    setActiveDockId(null);
    setPackOpen(false);
    setBankOpen(true);
  }, []);

  const handleDepositItem = useCallback(
    (itemId: string) => {
      if (!isItemId(itemId)) return;
      setCharacter((prev) => {
        if (!prev) return prev;
        const next = depositItem(prev, itemId, 1);
        if (!next) return prev;
        const line = formatBankToast("Deposited", 0, itemId, 1);
        if (line) queueMicrotask(() => showToast(line));
        return next;
      });
    },
    [showToast],
  );

  const handleWithdrawItem = useCallback(
    (itemId: string) => {
      if (!isItemId(itemId)) return;
      setCharacter((prev) => {
        if (!prev) return prev;
        const result = withdrawItem(prev, itemId, 1);
        if (!result.ok) {
          if (result.reason !== "missing") {
            queueMicrotask(() => showToast(toastForCarryFail(result.reason)));
          }
          return prev;
        }
        const line = formatBankToast("Withdrew", 0, itemId, 1);
        if (line) queueMicrotask(() => showToast(line));
        return result.character;
      });
    },
    [showToast],
  );

  const handleDepositGold = useCallback(
    (amount: number) => {
      setCharacter((prev) => {
        if (!prev) return prev;
        const next = depositGold(prev, amount);
        const amt = next.bankGold - prev.bankGold;
        const line = amt > 0 ? formatBankToast("Deposited", amt) : null;
        if (line) queueMicrotask(() => showToast(line));
        return next;
      });
    },
    [showToast],
  );

  const handleWithdrawGold = useCallback(
    (amount: number) => {
      setCharacter((prev) => {
        if (!prev) return prev;
        const next = withdrawGold(prev, amount);
        const amt = prev.bankGold - next.bankGold;
        const line = amt > 0 ? formatBankToast("Withdrew", amt) : null;
        if (line) queueMicrotask(() => showToast(line));
        return next;
      });
    },
    [showToast],
  );

  const grantPremium = useCallback(
    (msg: string) => {
      setCharacter((prev) => (prev ? unlockPremiumBackpack(prev) : prev));
      showToast(msg, 2800);
    },
    [showToast],
  );

  const handleUnlockDemo = useCallback(() => {
    if (!isPremiumDemoAllowed()) {
      showToast("Demo unlock is disabled when Stripe is configured.");
      return;
    }
    grantPremium("Premium Backpack unlocked (demo).");
  }, [grantPremium, showToast]);

  const handleUnlockStripe = useCallback(() => {
    setPremiumUnlocking(true);
    void (async () => {
      const result = await startPremiumCheckout();
      setPremiumUnlocking(false);
      if (!result.ok) {
        showToast(result.error, 3200);
        return;
      }
      if (result.demo) {
        grantPremium("Premium Backpack unlocked (demo checkout).");
        return;
      }
      window.location.assign(result.url);
    })();
  }, [grantPremium, showToast]);

  useEffect(() => {
    const q = consumePremiumQuery();
    if (q.status === "cancel") {
      showToast("Premium checkout canceled.");
      return;
    }
    if (q.status !== "success") return;
    void (async () => {
      if (q.sessionId && (await verifyPremiumSession(q.sessionId))) {
        grantPremium("Premium Backpack unlocked.");
        return;
      }
      if (isPremiumDemoAllowed()) {
        grantPremium("Premium Backpack unlocked (demo).");
        return;
      }
      showToast("Could not verify Premium checkout.");
    })();
  }, [grantPremium, showToast]);

  const buyItem = useCallback(
    (itemId: string, price: number) => {
      if (!isItemId(itemId)) return;
      setCharacter((prev) => {
        if (!prev || prev.gold < price) return prev;
        const carry = canCarry(
          prev.inventory,
          prev.premiumBackpack,
          itemId,
          1,
        );
        if (!carry.ok) {
          queueMicrotask(() => showToast(toastForCarryFail(carry.reason)));
          return prev;
        }
        let next = setGold(prev, prev.gold - price);
        const added = tryAddInventoryItem(next, itemId, 1);
        if (!added.ok) {
          queueMicrotask(() => showToast(toastForCarryFail(added.reason)));
          return prev;
        }
        queueMicrotask(() => showToast(`Bought for ${price}g`));
        return added.character;
      });
    },
    [showToast],
  );

  const sellItem = useCallback(
    (itemId: string, price: number) => {
      if (!isItemId(itemId)) return;
      setCharacter((prev) => {
        if (!prev) return prev;
        const removed = removeInventoryItem(prev, itemId, 1);
        if (!removed) return prev;
        return setGold(removed, removed.gold + price);
      });
      showToast(`Sold for ${price}g`);
    },
    [showToast],
  );

  const sailTo = useCallback(
    (dest: ContinentId) => {
      let blockedQuote: ReturnType<typeof quoteShipFare> | null = null;
      let paid = 0;
      let firstCrossing = false;
      let travelled = false;
      setCharacter((prev) => {
        if (!prev) return prev;
        const quote = quoteShipFare(
          prev.continentId,
          dest,
          prev.discoveredContinents,
        );
        if (!canAffordFare(prev.gold, quote)) {
          blockedQuote = quote;
          return prev;
        }
        paid = quote.gold;
        firstCrossing = quote.firstCrossing;
        let next = prev;
        if (paid > 0) next = setGold(next, next.gold - paid);
        travelled = true;
        return travelToContinent(next, dest);
      });
      if (blockedQuote) {
        showToast(fareFailToast(blockedQuote));
        return;
      }
      if (!travelled) return;
      setArrivedFrom(null);
      setShipSpawn(dockSpawnForContinent(dest));
      setActiveDockId(null);
      setMapOpen(false);
      if (dest === "mistmere") {
        const mistResult = applyMistmereReached(loadQuestLog());
        if (mistResult) {
          saveQuestLog(mistResult.log);
          if (mistResult.toast) {
            showToast(mistResult.toast);
            return;
          }
        }
        const choirMist = applyChoirCountsMistmereReached(loadQuestLog());
        if (choirMist) {
          saveQuestLog(choirMist.log);
          if (choirMist.toast) {
            showToast(choirMist.toast);
            return;
          }
        }
      }
      if (dest === "sunken-choir") {
        const choirLand = applyChoirCountsChoirReached(loadQuestLog());
        if (choirLand) {
          saveQuestLog(choirLand.log);
          if (choirLand.toast) {
            showToast(choirLand.toast);
            return;
          }
        }
      }
      if (dest === "nightglass-coast") {
        const night = applyWharfNightglassReached(loadQuestLog());
        if (night) {
          saveQuestLog(night.log);
          if (night.toast) {
            showToast(night.toast);
            return;
          }
        }
      }
      if (dest === "verdant-spine") {
        const green = applyGreenGateReached(loadQuestLog());
        if (green) {
          saveQuestLog(green.log);
          if (green.toast) {
            showToast(green.toast);
            return;
          }
        }
        const spine = applySpineReached(loadQuestLog());
        if (spine) {
          saveQuestLog(spine.log);
          if (spine.toast) {
            showToast(spine.toast);
            return;
          }
        }
      }
      if (dest === "pale-wastes") {
        const pale = applyPaleReached(loadQuestLog());
        if (pale) {
          saveQuestLog(pale.log);
          if (pale.toast) {
            showToast(pale.toast);
            return;
          }
        }
      }
      const c = getContinent(dest);
      if (paid > 0 || firstCrossing) {
        showToast(farePaidToast("ship", c.name, paid));
      } else if (folkOnContinent(dest).length === 0) {
        showToast(`Sailing to ${c.name} — ${c.blurb}`);
      } else {
        showToast(`Sailing to ${c.name}`);
      }
    },
    [showToast],
  );

  useEffect(() => {
    if (!character) return;
    if (character.hollowIndex === null && character.hollowReturn) {
      setCharacter(clearHollowReturn(character));
    }
  }, [character]);

  // Sticky starter hunt: attach if missing on an existing Thornreach save.
  useEffect(() => {
    if (!character) return;
    if (getTeethQuest(loadQuestLog())) return;
    if (character.continentId !== "thornreach") return;
    saveQuestLog(withTeethQuest(loadQuestLog(), emptyTeethQuest()));
    setToast(TEETH_START_TOAST);
    window.setTimeout(() => setToast((t) => (t === TEETH_START_TOAST ? null : t)), 3600);
  }, [character]);

  // Quest 2: auto-start Ashwood Watch once Teeth is complete.
  useEffect(() => {
    if (!character) return;
    const ensured = ensureAshwoodAfterTeeth(loadQuestLog());
    if (!ensured.started) return;
    saveQuestLog(ensured.log);
    setToast(ASHWOOD_START_TOAST);
    window.setTimeout(() => setToast((t) => (t === ASHWOOD_START_TOAST ? null : t)), 3600);
  }, [character]);

  // Quest 3: auto-start Hollow Watch once Ashwood Watch is complete.
  useEffect(() => {
    if (!character) return;
    const ensured = ensureHollowAfterAshwood(loadQuestLog());
    if (!ensured.started) return;
    saveQuestLog(ensured.log);
    setToast(HOLLOW_START_TOAST);
    window.setTimeout(() => setToast((t) => (t === HOLLOW_START_TOAST ? null : t)), 3600);
  }, [character]);

  // Quest 4: auto-start Gate Watch once Hollow Watch is complete.
  useEffect(() => {
    if (!character) return;
    const ensured = ensureGateWatchAfterHollow(loadQuestLog());
    if (!ensured.started) return;
    saveQuestLog(ensured.log);
    setToast(GATE_START_TOAST);
    window.setTimeout(() => setToast((t) => (t === GATE_START_TOAST ? null : t)), 3600);
  }, [character]);

  // Quest 5: auto-start Mistmere Crossing once Gate Watch is complete.
  useEffect(() => {
    if (!character) return;
    const ensured = ensureMistmereAfterGate(loadQuestLog());
    if (!ensured.started) return;
    saveQuestLog(ensured.log);
    setToast(MISTMERE_START_TOAST);
    window.setTimeout(() => setToast((t) => (t === MISTMERE_START_TOAST ? null : t)), 3600);
  }, [character]);

  // Quest 6: auto-start The Watchline Holds once Mistmere Crossing is complete.
  useEffect(() => {
    if (!character) return;
    const ensured = ensureWatchlineAfterMistmere(loadQuestLog());
    if (!ensured.started) return;
    saveQuestLog(ensured.log);
    setToast(WATCHLINE_START_TOAST);
    window.setTimeout(() => setToast((t) => (t === WATCHLINE_START_TOAST ? null : t)), 3600);
  }, [character]);

  // Quest 7: auto-start Ashveil Under the Watchline once Watchline Holds is complete.
  useEffect(() => {
    if (!character) return;
    const ensured = ensureAshveilAfterWatchline(loadQuestLog());
    if (!ensured.started) return;
    saveQuestLog(ensured.log);
    setToast(ASHVEIL_START_TOAST);
    window.setTimeout(() => setToast((t) => (t === ASHVEIL_START_TOAST ? null : t)), 3600);
  }, [character]);

  // Quest 8: auto-start The Choir Counts once Ashveil Under the Watchline is complete.
  useEffect(() => {
    if (!character) return;
    const ensured = ensureChoirCountsAfterAshveil(loadQuestLog());
    if (!ensured.started) return;
    saveQuestLog(ensured.log);
    setToast(CHOIR_COUNTS_START_TOAST);
    window.setTimeout(
      () => setToast((t) => (t === CHOIR_COUNTS_START_TOAST ? null : t)),
      3600,
    );
  }, [character]);

  // Quest 9: auto-start The Wharf Answers once The Choir Counts is complete.
  useEffect(() => {
    if (!character) return;
    const ensured = ensureNightglassAfterChoir(loadQuestLog());
    if (!ensured.started) return;
    saveQuestLog(ensured.log);
    setToast(WHARF_START_TOAST);
    window.setTimeout(
      () => setToast((t) => (t === WHARF_START_TOAST ? null : t)),
      3600,
    );
  }, [character]);

  // Quest 10: auto-start The Green Gate Keeps once The Wharf Answers is complete.
  useEffect(() => {
    if (!character) return;
    const ensured = ensureGreenGateAfterWharf(loadQuestLog());
    if (!ensured.started) return;
    saveQuestLog(ensured.log);
    setToast(GREEN_GATE_START_TOAST);
    window.setTimeout(
      () => setToast((t) => (t === GREEN_GATE_START_TOAST ? null : t)),
      3600,
    );
  }, [character]);

  // Quest 11: auto-start The Spine Remembers once The Green Gate Keeps is complete.
  useEffect(() => {
    if (!character) return;
    const ensured = ensureSpineAfterGreenGate(loadQuestLog());
    if (!ensured.started) return;
    saveQuestLog(ensured.log);
    setToast(SPINE_START_TOAST);
    window.setTimeout(
      () => setToast((t) => (t === SPINE_START_TOAST ? null : t)),
      3600,
    );
  }, [character]);

  // Quest 12: auto-start The Pale Gate Opens once The Spine Remembers is complete.
  useEffect(() => {
    if (!character) return;
    const ensured = ensurePaleAfterSpine(loadQuestLog());
    if (!ensured.started) return;
    saveQuestLog(ensured.log);
    setToast(PALE_START_TOAST);
    window.setTimeout(
      () => setToast((t) => (t === PALE_START_TOAST ? null : t)),
      3600,
    );
  }, [character]);

  // Mistmere Crossing: mark arrival whenever the walker stands on Mistmere.
  useEffect(() => {
    if (!character) return;
    if (character.continentId !== "mistmere") return;
    const result = applyMistmereReached(loadQuestLog());
    if (!result) return;
    saveQuestLog(result.log);
    if (result.toast) {
      setToast(result.toast);
      window.setTimeout(() => setToast((t) => (t === result.toast ? null : t)), 2800);
    }
  }, [character]);

  // The Choir Counts: mark Mistmere arrival.
  useEffect(() => {
    if (!character) return;
    if (character.continentId !== "mistmere") return;
    const result = applyChoirCountsMistmereReached(loadQuestLog());
    if (!result) return;
    saveQuestLog(result.log);
    if (result.toast) {
      setToast(result.toast);
      window.setTimeout(() => setToast((t) => (t === result.toast ? null : t)), 2800);
    }
  }, [character]);

  // The Choir Counts: mark Sunken Choir / Choir Landing arrival.
  useEffect(() => {
    if (!character) return;
    if (character.continentId !== "sunken-choir") return;
    const result = applyChoirCountsChoirReached(loadQuestLog());
    if (!result) return;
    saveQuestLog(result.log);
    if (result.toast) {
      setToast(result.toast);
      window.setTimeout(() => setToast((t) => (t === result.toast ? null : t)), 2800);
    }
  }, [character]);

  // The Wharf Answers: mark Nightglass Coast arrival.
  useEffect(() => {
    if (!character) return;
    if (character.continentId !== "nightglass-coast") return;
    const result = applyWharfNightglassReached(loadQuestLog());
    if (!result) return;
    saveQuestLog(result.log);
    if (result.toast) {
      setToast(result.toast);
      window.setTimeout(() => setToast((t) => (t === result.toast ? null : t)), 2800);
    }
  }, [character]);

  // The Green Gate Keeps / The Spine Remembers: mark Verdant Spine arrival / gate.
  useEffect(() => {
    if (!character) return;
    if (character.continentId !== "verdant-spine") return;
    const green = applyGreenGateReached(loadQuestLog());
    if (green) {
      saveQuestLog(green.log);
      if (green.toast) {
        setToast(green.toast);
        window.setTimeout(() => setToast((t) => (t === green.toast ? null : t)), 2800);
      }
      return;
    }
    const spine = applySpineReached(loadQuestLog());
    if (!spine) return;
    saveQuestLog(spine.log);
    if (spine.toast) {
      setToast(spine.toast);
      window.setTimeout(() => setToast((t) => (t === spine.toast ? null : t)), 2800);
    }
  }, [character]);

  // The Pale Gate Opens: mark Pale Wastes arrival.
  useEffect(() => {
    if (!character) return;
    if (character.continentId !== "pale-wastes") return;
    const pale = applyPaleReached(loadQuestLog());
    if (!pale) return;
    saveQuestLog(pale.log);
    if (pale.toast) {
      setToast(pale.toast);
      window.setTimeout(() => setToast((t) => (t === pale.toast ? null : t)), 2800);
    }
  }, [character]);

  // Hollow Watch: mark enter when hollowIndex is set on Thornreach.
  useEffect(() => {
    if (!character) return;
    if (character.continentId !== "thornreach") return;
    if (character.hollowIndex === null) return;
    const result = applyHollowEnter(loadQuestLog());
    if (!result) return;
    saveQuestLog(result.log);
    if (result.toast) {
      setToast(result.toast);
      window.setTimeout(() => setToast((t) => (t === result.toast ? null : t)), 2800);
    }
  }, [character]);

  const persistQuestResult = useCallback(
    (
      prev: ValeCharacter,
      result: NonNullable<ReturnType<typeof applyIdentify>>,
    ): ValeCharacter => {
      saveQuestLog(result.log);
      let next: ValeCharacter = {
        ...prev,
        skillXp: { ...prev.skillXp },
      };
      if (result.completedId === TEETH_QUEST_ID) {
        next = awardCombatXp(next, TEETH_REWARDS.combatXp);
        next = { ...next, skillXp: { ...next.skillXp } };
        awardSkillXp(next, TEETH_REWARDS.skill, TEETH_REWARDS.skillXp);
        next = setGold(next, next.gold + TEETH_REWARDS.gold);
        next = { ...next, skillXp: { ...next.skillXp } };
        queueMicrotask(() => {
          showToast(result.startedAshwood ? ASHWOOD_START_TOAST : TEETH_COMPLETE_LINE);
          setSkillTick((t) => t + 1);
        });
      } else if (result.completedId === ASHWOOD_QUEST_ID) {
        next = awardCombatXp(next, ASHWOOD_REWARDS.combatXp);
        next = { ...next, skillXp: { ...next.skillXp } };
        awardSkillXp(next, ASHWOOD_REWARDS.skill, ASHWOOD_REWARDS.skillXp);
        next = setGold(next, next.gold + ASHWOOD_REWARDS.gold);
        next = { ...next, skillXp: { ...next.skillXp } };
        queueMicrotask(() => {
          showToast(result.startedHollow ? HOLLOW_START_TOAST : ASHWOOD_COMPLETE_LINE);
          setSkillTick((t) => t + 1);
        });
      } else if (result.completedId === HOLLOW_QUEST_ID) {
        next = awardCombatXp(next, HOLLOW_REWARDS.combatXp);
        next = { ...next, skillXp: { ...next.skillXp } };
        awardSkillXp(next, HOLLOW_REWARDS.skill, HOLLOW_REWARDS.skillXp);
        next = setGold(next, next.gold + HOLLOW_REWARDS.gold);
        next = { ...next, skillXp: { ...next.skillXp } };
        queueMicrotask(() => {
          showToast(result.startedGateWatch ? GATE_START_TOAST : HOLLOW_COMPLETE_LINE);
          setSkillTick((t) => t + 1);
        });
      } else if (result.completedId === GATE_QUEST_ID) {
        next = awardCombatXp(next, GATE_REWARDS.combatXp);
        next = { ...next, skillXp: { ...next.skillXp } };
        awardSkillXp(next, GATE_REWARDS.skill, GATE_REWARDS.skillXp);
        next = setGold(next, next.gold + GATE_REWARDS.gold);
        next = { ...next, skillXp: { ...next.skillXp } };
        queueMicrotask(() => {
          showToast(
            result.startedMistmere ? MISTMERE_START_TOAST : GATE_COMPLETE_LINE,
          );
          setSkillTick((t) => t + 1);
        });
      } else if (result.completedId === MISTMERE_QUEST_ID) {
        next = awardCombatXp(next, MISTMERE_REWARDS.combatXp);
        next = { ...next, skillXp: { ...next.skillXp } };
        awardSkillXp(next, MISTMERE_REWARDS.skill, MISTMERE_REWARDS.skillXp);
        next = setGold(next, next.gold + MISTMERE_REWARDS.gold);
        next = { ...next, skillXp: { ...next.skillXp } };
        queueMicrotask(() => {
          showToast(
            result.startedWatchline ? WATCHLINE_START_TOAST : MISTMERE_COMPLETE_LINE,
          );
          setSkillTick((t) => t + 1);
        });
      } else if (result.completedId === WATCHLINE_QUEST_ID) {
        next = awardCombatXp(next, WATCHLINE_REWARDS.combatXp);
        next = { ...next, skillXp: { ...next.skillXp } };
        awardSkillXp(next, WATCHLINE_REWARDS.skill, WATCHLINE_REWARDS.skillXp);
        next = setGold(next, next.gold + WATCHLINE_REWARDS.gold);
        next = { ...next, skillXp: { ...next.skillXp } };
        queueMicrotask(() => {
          showToast(
            result.startedAshveil ? ASHVEIL_START_TOAST : WATCHLINE_COMPLETE_LINE,
          );
          setSkillTick((t) => t + 1);
        });
      } else if (result.completedId === ASHVEIL_QUEST_ID) {
        next = awardCombatXp(next, ASHVEIL_REWARDS.combatXp);
        next = { ...next, skillXp: { ...next.skillXp } };
        awardSkillXp(next, ASHVEIL_REWARDS.skill, ASHVEIL_REWARDS.skillXp);
        next = setGold(next, next.gold + ASHVEIL_REWARDS.gold);
        next = { ...next, skillXp: { ...next.skillXp } };
        queueMicrotask(() => {
          showToast(
            result.startedChoirCounts
              ? CHOIR_COUNTS_START_TOAST
              : ASHVEIL_COMPLETE_LINE,
          );
          setSkillTick((t) => t + 1);
        });
      } else if (result.completedId === CHOIR_COUNTS_QUEST_ID) {
        next = awardCombatXp(next, CHOIR_COUNTS_REWARDS.combatXp);
        next = { ...next, skillXp: { ...next.skillXp } };
        awardSkillXp(
          next,
          CHOIR_COUNTS_REWARDS.skill,
          CHOIR_COUNTS_REWARDS.skillXp,
        );
        next = setGold(next, next.gold + CHOIR_COUNTS_REWARDS.gold);
        next = { ...next, skillXp: { ...next.skillXp } };
        queueMicrotask(() => {
          showToast(
            result.startedWharf ? WHARF_START_TOAST : CHOIR_COUNTS_COMPLETE_LINE,
          );
          setSkillTick((t) => t + 1);
        });
      } else if (result.completedId === WHARF_QUEST_ID) {
        next = awardCombatXp(next, WHARF_REWARDS.combatXp);
        next = { ...next, skillXp: { ...next.skillXp } };
        awardSkillXp(next, WHARF_REWARDS.skill, WHARF_REWARDS.skillXp);
        next = setGold(next, next.gold + WHARF_REWARDS.gold);
        next = { ...next, skillXp: { ...next.skillXp } };
        queueMicrotask(() => {
          showToast(
            result.startedGreenGate
              ? GREEN_GATE_START_TOAST
              : WHARF_COMPLETE_LINE,
          );
          setSkillTick((t) => t + 1);
        });
      } else if (result.completedId === GREEN_GATE_QUEST_ID) {
        next = awardCombatXp(next, GREEN_GATE_REWARDS.combatXp);
        next = { ...next, skillXp: { ...next.skillXp } };
        awardSkillXp(next, GREEN_GATE_REWARDS.skill, GREEN_GATE_REWARDS.skillXp);
        next = setGold(next, next.gold + GREEN_GATE_REWARDS.gold);
        next = { ...next, skillXp: { ...next.skillXp } };
        queueMicrotask(() => {
          showToast(
            result.startedSpine ? SPINE_START_TOAST : GREEN_GATE_COMPLETE_LINE,
          );
          setSkillTick((t) => t + 1);
        });
      } else if (result.completedId === SPINE_QUEST_ID) {
        next = awardCombatXp(next, SPINE_REWARDS.combatXp);
        next = { ...next, skillXp: { ...next.skillXp } };
        awardSkillXp(next, SPINE_REWARDS.skill, SPINE_REWARDS.skillXp);
        next = setGold(next, next.gold + SPINE_REWARDS.gold);
        next = { ...next, skillXp: { ...next.skillXp } };
        queueMicrotask(() => {
          showToast(
            result.startedPale ? PALE_START_TOAST : SPINE_COMPLETE_LINE,
          );
          setSkillTick((t) => t + 1);
        });
      } else if (result.completedId === PALE_QUEST_ID) {
        next = awardCombatXp(next, PALE_REWARDS.combatXp);
        next = { ...next, skillXp: { ...next.skillXp } };
        awardSkillXp(next, PALE_REWARDS.skill, PALE_REWARDS.skillXp);
        next = setGold(next, next.gold + PALE_REWARDS.gold);
        next = { ...next, skillXp: { ...next.skillXp } };
        queueMicrotask(() => {
          showToast(PALE_COMPLETE_LINE);
          setSkillTick((t) => t + 1);
        });
      } else if (result.toast) {
        queueMicrotask(() => showToast(result.toast!));
      }
      return next;
    },
    [showToast],
  );

  const handleIdentify = useCallback(
    (kindId: EnemyKindId) => {
      setCharacter((prev) => {
        if (!prev) return prev;
        const result = applyIdentify(loadQuestLog(), kindId, prev.continentId);
        if (!result) return prev;
        return persistQuestResult(prev, result);
      });
    },
    [persistQuestResult],
  );

  const handleEnemyKill = useCallback(
    (kindId: EnemyKindId) => {
      if (isHollowBoss(kindId)) {
        queueMicrotask(() => showToast(ASHVEIL_EMBER_DEFEAT_TOAST));
      }
      setCharacter((prev) => {
        if (!prev) return prev;
        const result = applyEnemyKill(loadQuestLog(), kindId, prev.continentId);
        if (!result) return prev;
        return persistQuestResult(prev, result);
      });
    },
    [persistQuestResult, showToast],
  );

  const handleWorkNode = useCallback(
    (nodeId: string) => {
      const node = getProfessionNode(nodeId);
      if (!node) return;
      if (!isNodeReady(nodeId)) {
        showToast(`${node.name} is still regrowing`);
        return;
      }
      setCharacter((prev) => {
        if (!prev) return prev;
        const added = tryAddInventoryItem(prev, node.itemId, 1);
        if (!added.ok) {
          queueMicrotask(() => showToast(toastForCarryFail(added.reason)));
          return prev;
        }
        markNodeUsed(nodeId);
        const before = added.character.professionXp?.[node.professionId] ?? 0;
        const next = awardProfessionXp(added.character, node.professionId, node.xp);
        const after = next.professionXp[node.professionId];
        const beforeLvl = professionSnapshot(before).level;
        const afterLvl = professionSnapshot(after).level;
        const item = getItem(node.itemId);
        queueMicrotask(() => {
          if (afterLvl > beforeLvl) {
            showToast(
              `${item.name} · ${professionName(node.professionId)} reached level ${afterLvl}`,
            );
          } else {
            showToast(`${node.verb} ${item.name} · +${node.xp} ${professionName(node.professionId)} XP`);
          }
          setSkillTick((t) => t + 1);
        });
        return next;
      });
    },
    [showToast],
  );

  const handleCraft = useCallback(
    (recipeId: string) => {
      const recipe = getCraftRecipe(recipeId);
      if (!recipe) return;
      setCharacter((prev) => {
        if (!prev) return prev;
        let working = prev;
        for (const ing of recipe.ingredients) {
          const removed = removeInventoryItem(working, ing.itemId, ing.qty);
          if (!removed) {
            queueMicrotask(() => showToast("Missing materials"));
            return prev;
          }
          working = removed;
        }
        const added = tryAddInventoryItem(working, recipe.resultId, recipe.resultQty);
        if (!added.ok) {
          queueMicrotask(() => showToast(toastForCarryFail(added.reason)));
          return prev;
        }
        const before = added.character.professionXp?.crafting ?? 0;
        const next = awardProfessionXp(added.character, "crafting", recipe.xp);
        const afterLvl = professionSnapshot(next.professionXp.crafting).level;
        const beforeLvl = professionSnapshot(before).level;
        const result = getItem(recipe.resultId);
        queueMicrotask(() => {
          if (afterLvl > beforeLvl) {
            showToast(`Crafting reached level ${afterLvl}`);
          } else {
            showToast(`Crafted ${result.name} · +${recipe.xp} Crafting XP`);
          }
          setSkillTick((t) => t + 1);
        });
        return next;
      });
    },
    [showToast],
  );

  const handleInspectCairn = useCallback(
    (cairnId: string) => {
      setCharacter((prev) => {
        if (!prev) return prev;
        const result = applyCairnInspect(loadQuestLog(), cairnId);
        if (!result) return prev;
        return persistQuestResult(prev, result);
      });
    },
    [persistQuestResult],
  );

  const handleCombatReward = useCallback(
    (
      combatXpGain: number,
      skill: SkillId,
      skillXpGain: number,
      goldGain: number,
      loot?: ItemId[],
    ) => {
      setCharacter((prev) => {
        if (!prev) return prev;
        let next = awardCombatXp(prev, combatXpGain);
        next = { ...next, skillXp: { ...next.skillXp } };
        awardSkillXp(next, skill, skillXpGain);
        next = setGold(next, next.gold + goldGain);
        let leftover = false;
        let leftoverReason: "weight" | "slots" | null = null;
        const taken: ItemId[] = [];
        if (loot && loot.length > 0) {
          for (const id of loot) {
            const added = tryAddInventoryItem(next, id, 1);
            if (added.ok) {
              next = added.character;
              taken.push(id);
            } else {
              leftover = true;
              leftoverReason = added.reason;
            }
          }
        }
        const pickupLine = formatPickupToast(goldGain, taken);
        const leftoverMsg = leftover
          ? leftoverReason
            ? toastForCarryFail(leftoverReason)
            : "Pack too heavy — loot left behind"
          : null;
        queueMicrotask(() => {
          if (pickupLine) showLootToast(pickupLine);
          if (leftoverMsg) showToast(leftoverMsg);
        });
        return { ...next, skillXp: { ...next.skillXp } };
      });
      setSkillTick((t) => t + 1);
    },
    [showLootToast, showToast],
  );

  const handleEquip = useCallback(
    (itemId: string) => {
      if (!isItemId(itemId)) return;
      setCharacter((prev) => {
        if (!prev) return prev;
        const next = equipItem(prev, itemId);
        if (!next) {
          queueMicrotask(() => showToast("Cannot equip that"));
          return prev;
        }
        return next;
      });
    },
    [showToast],
  );

  const handleUnequip = useCallback(
    (slot: EquipSlot) => {
      setCharacter((prev) => {
        if (!prev) return prev;
        const next = unequipSlot(prev, slot);
        if (!next) {
          queueMicrotask(() => showToast(toastForCarryFail("slots")));
          return prev;
        }
        return next;
      });
    },
    [showToast],
  );

  const handleVitals = useCallback((hp: number, mana: number) => {
    setCharacter((prev) => {
      if (!prev) return prev;
      const next = setVitals(prev, hp, mana);
      const maxHp = maxHpFor(next);
      if (maxHp > 0 && hp / maxHp <= LOW_HP_RATIO) {
        if (!lowHpWarnedRef.current) {
          lowHpWarnedRef.current = true;
          queueMicrotask(() => showToast(LOW_HP_TOAST));
        }
      } else if (maxHp > 0 && hp / maxHp >= 0.5) {
        lowHpWarnedRef.current = false;
      }
      return next;
    });
  }, [showToast]);

  const handlePlayerDeath = useCallback(() => {
    lowHpWarnedRef.current = false;
    let toastMsg = formatDeathToast(0, []);
    setCharacter((prev) => {
      if (!prev) return prev;
      const result = applyDeath(prev);
      toastMsg = formatDeathToast(result.goldLost, result.itemsLost);
      return result.character;
    });
    setArrivedFrom(null);
    setShipSpawn(null);
    setDialogue(null);
    setActiveShopId(null);
    setActiveDockId(null);
    setBankOpen(false);
    setPackOpen(false);
    setCraftOpen(false);
    setMapOpen(false);
    setSkillsOpen(false);
    setWorldEpoch((e) => e + 1);
    showToast(toastMsg, DEATH_TOAST_MS);
  }, [showToast]);

  if (!character) {
    return <ClassSelectOverlay onPick={pickClass} />;
  }

  const cls = getClass(character.classId);
  const skills = skillRowsFrom(character);
  const professions = professionRowsFrom(character);
  const continent = getContinent(character.continentId);
  const inHollow = character.hollowIndex !== null;
  const locationKey = `${character.continentId}:${character.hollowIndex ?? "over"}:${shipSpawn ? "ship" : "gate"}:${worldEpoch}`;
  const shop = activeShopId ? (getShop(activeShopId) ?? null) : null;
  const voyageDock = activeDockId ? (getDock(activeDockId) ?? null) : null;

  return (
    <GameShell
      key={locationKey}
      character={character}
      cls={cls}
      skills={skills}
      professions={professions}
      skillsOpen={skillsOpen}
      mapOpen={mapOpen}
      skillTick={skillTick}
      arrivedFrom={arrivedFrom}
      shipSpawn={shipSpawn}
      toast={toast}
      lootToast={lootToast}
      continentName={continent.name}
      inHollow={inHollow}
      hollowIndex={character.hollowIndex}
      dialogue={dialogue}
      shop={shop}
      bankOpen={bankOpen}
      packOpen={packOpen}
      craftOpen={craftOpen}
      premiumUnlocking={premiumUnlocking}
      voyageDock={voyageDock}
      onToggleSkills={toggleSkills}
      onToggleMap={toggleMap}
      onTrain={trainSkill}
      onAssignQuickSlot={assignQuickSlot}
      onResetPath={resetPath}
      onTravel={goContinent}
      onEnterHollow={goHollow}
      onExitHollow={leaveHollow}
      onOpenFolk={openFolk}
      onOpenShop={openShop}
      onOpenShip={openShip}
      onCloseDialogue={() => setDialogue(null)}
      onCloseShop={() => setActiveShopId(null)}
      onOpenBank={openBank}
      onCloseBank={() => setBankOpen(false)}
      onDepositItem={handleDepositItem}
      onWithdrawItem={handleWithdrawItem}
      onDepositGold={handleDepositGold}
      onWithdrawGold={handleWithdrawGold}
      onTogglePack={() => {
        setBankOpen(false);
        setPackOpen((o) => !o);
      }}
      onUnlockPremiumDemo={handleUnlockDemo}
      onUnlockPremiumStripe={handleUnlockStripe}
      onCloseVoyage={() => setActiveDockId(null)}
      onBuy={buyItem}
      onSell={sellItem}
      onSail={sailTo}
      onEquip={handleEquip}
      onUnequip={handleUnequip}
      onCombatReward={handleCombatReward}
      onEnemyKill={handleEnemyKill}
      onIdentify={handleIdentify}
      onInspectCairn={handleInspectCairn}
      onWorkNode={handleWorkNode}
      onOpenCraft={openCraft}
      onCloseCraft={() => setCraftOpen(false)}
      onCraft={handleCraft}
      teethQuest={getTeethQuest(loadQuestLog())}
      ashwoodQuest={getAshwoodQuest(loadQuestLog())}
      hollowQuest={getHollowQuest(loadQuestLog())}
      gateWatchQuest={getGateWatchQuest(loadQuestLog())}
      mistmereQuest={getMistmereQuest(loadQuestLog())}
      watchlineQuest={getWatchlineQuest(loadQuestLog())}
      ashveilQuest={getAshveilQuest(loadQuestLog())}
      choirCountsQuest={getChoirCountsQuest(loadQuestLog())}
      wharfQuest={getWharfQuest(loadQuestLog())}
      greenGateQuest={getGreenGateQuest(loadQuestLog())}
      spineQuest={getSpineQuest(loadQuestLog())}
      paleQuest={getPaleQuest(loadQuestLog())}
      onVitals={handleVitals}
      onPlayerDeath={handlePlayerDeath}
      onPassivePrimary={(amount) => {
        setCharacter((prev) => {
          if (!prev) return prev;
          const next: ValeCharacter = {
            ...prev,
            skillXp: { ...prev.skillXp },
          };
          awardSkillXp(next, cls.primarySkill, amount);
          return { ...next, skillXp: { ...next.skillXp } };
        });
        setSkillTick((t) => t + 1);
      }}
    />
  );
}
