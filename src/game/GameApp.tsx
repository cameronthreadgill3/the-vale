import { useCallback, useEffect, useState, useRef } from "react";
import { getClass, type ClassId } from "@/game/classes";
import { getContinent, type ContinentId } from "@/game/continents";
import {
  awardSkillXp,
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
  TEETH_QUEST_ID,
  ASHWOOD_QUEST_ID,
  HOLLOW_QUEST_ID,
  emptyTeethQuest,
  getTeethQuest,
  getAshwoodQuest,
  getHollowQuest,
  applyIdentify,
  applyEnemyKill,
  applyCairnInspect,
  applyHollowEnter,
  withTeethQuest,
  ensureAshwoodAfterTeeth,
  ensureHollowAfterAshwood,
  rookQuestLine,
  loadQuestLog,
  saveQuestLog,
  clearQuestLog,
} from "@/game/quests";
import type { EnemyKindId } from "@/game/enemies";
import {
  SKILLS,
  SKILL_IDS,
  skillSnapshot,
  type SkillId,
} from "@/game/skills";
import { isItemId } from "@/game/items";
import {
  getFolk,
  getShop,
  getDock,
  dockSpawnForContinent,
  folkOnContinent,
} from "@/game/folk";
import { maxHpFor, LOW_HP_RATIO, LOW_HP_TOAST } from "@/game/combat";
import { canCarry, formatDeathToast, toastForCarryFail } from "@/game/backpack";
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
  const lowHpWarnedRef = useRef(false);
  const [dialogue, setDialogue] = useState<{
    name: string;
    line: string;
    hasShop: boolean;
    hasBank?: boolean;
    shopId?: string;
    bankId?: string;
  } | null>(null);
  const [activeShopId, setActiveShopId] = useState<string | null>(null);
  const [activeDockId, setActiveDockId] = useState<string | null>(null);
  const [bankOpen, setBankOpen] = useState(false);
  const [packOpen, setPackOpen] = useState(false);
  const [premiumUnlocking, setPremiumUnlocking] = useState(false);

  const pickClass = useCallback((id: ClassId) => {
    const created = createCharacter(id);
    saveQuestLog(withTeethQuest(loadQuestLog(), emptyTeethQuest()));
    setCharacter(created);
    setArrivedFrom(null);
    setShipSpawn(null);
    setWorldEpoch(0);
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
    setWorldEpoch(0);
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
    (target: ContinentId, from: ContinentId) => {
      setCharacter((prev) => (prev ? travelToContinent(prev, target) : prev));
      setArrivedFrom(from);
      setShipSpawn(null);
      setMapOpen(false);
      setDialogue(null);
      setActiveShopId(null);
      setActiveDockId(null);
      setBankOpen(false);
      setPackOpen(false);
      const dest = getContinent(target);
      if (folkOnContinent(target).length === 0) {
        showToast(`${dest.name} — ${dest.blurb}`);
      } else {
        showToast(`Gate opens onto ${dest.name}`);
      }
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
    if (folkId === "rook" && character) {
      const hook = rookQuestLine(loadQuestLog());
      if (hook) line = hook;
    }
    setDialogue({
      name: folk.name,
      line,
      hasShop: Boolean(folk.shopId),
      hasBank: Boolean(folk.bankId),
      shopId: folk.shopId,
      bankId: folk.bankId,
    });
    setCharacter((prev) => (prev ? markFolkMet(prev, folkId) : prev));
  }, [character]);

  const openShop = useCallback((shopId: string) => {
    setDialogue(null);
    setActiveDockId(null);
    setBankOpen(false);
    setActiveShopId(shopId);
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
        return depositItem(prev, itemId, 1) ?? prev;
      });
    },
    [],
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
        return result.character;
      });
    },
    [showToast],
  );

  const handleDepositGold = useCallback((amount: number) => {
    setCharacter((prev) => (prev ? depositGold(prev, amount) : prev));
  }, []);

  const handleWithdrawGold = useCallback((amount: number) => {
    setCharacter((prev) => (prev ? withdrawGold(prev, amount) : prev));
  }, []);

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
      setCharacter((prev) => (prev ? travelToContinent(prev, dest) : prev));
      setArrivedFrom(null);
      setShipSpawn(dockSpawnForContinent(dest));
      setActiveDockId(null);
      setMapOpen(false);
      const c = getContinent(dest);
      if (folkOnContinent(dest).length === 0) {
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
          showToast(HOLLOW_COMPLETE_LINE);
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
        const result = applyIdentify(loadQuestLog(), kindId);
        if (!result) return prev;
        return persistQuestResult(prev, result);
      });
    },
    [persistQuestResult],
  );

  const handleEnemyKill = useCallback(
    (kindId: EnemyKindId) => {
      setCharacter((prev) => {
        if (!prev) return prev;
        const result = applyEnemyKill(loadQuestLog(), kindId);
        if (!result) return prev;
        return persistQuestResult(prev, result);
      });
    },
    [persistQuestResult],
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
    (combatXpGain: number, skill: SkillId, skillXpGain: number, goldGain: number) => {
      setCharacter((prev) => {
        if (!prev) return prev;
        let next = awardCombatXp(prev, combatXpGain);
        next = { ...next, skillXp: { ...next.skillXp } };
        awardSkillXp(next, skill, skillXpGain);
        next = setGold(next, next.gold + goldGain);
        return { ...next, skillXp: { ...next.skillXp } };
      });
      setSkillTick((t) => t + 1);
    },
    [],
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
    let toastMsg = "You wake at the continent spawn...";
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
    setMapOpen(false);
    setSkillsOpen(false);
    setWorldEpoch((e) => e + 1);
    showToast(toastMsg, 4200);
  }, [showToast]);

  if (!character) {
    return <ClassSelectOverlay onPick={pickClass} />;
  }

  const cls = getClass(character.classId);
  const skills = skillRowsFrom(character);
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
      skillsOpen={skillsOpen}
      mapOpen={mapOpen}
      skillTick={skillTick}
      arrivedFrom={arrivedFrom}
      shipSpawn={shipSpawn}
      toast={toast}
      continentName={continent.name}
      inHollow={inHollow}
      hollowIndex={character.hollowIndex}
      dialogue={dialogue}
      shop={shop}
      bankOpen={bankOpen}
      packOpen={packOpen}
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
      onCombatReward={handleCombatReward}
      onEnemyKill={handleEnemyKill}
      onIdentify={handleIdentify}
      onInspectCairn={handleInspectCairn}
      teethQuest={getTeethQuest(loadQuestLog())}
      ashwoodQuest={getAshwoodQuest(loadQuestLog())}
      hollowQuest={getHollowQuest(loadQuestLog())}
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
