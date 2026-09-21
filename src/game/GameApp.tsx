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
  TEETH_QUEST_ID,
  ASHWOOD_QUEST_ID,
  HOLLOW_QUEST_ID,
  GATE_QUEST_ID,
  emptyTeethQuest,
  getTeethQuest,
  getAshwoodQuest,
  getHollowQuest,
  getGateWatchQuest,
  applyIdentify,
  applyEnemyKill,
  applyCairnInspect,
  applyHollowEnter,
  applyGateReached,
  applyGateWatchRookTalk,
  withTeethQuest,
  ensureAshwoodAfterTeeth,
  ensureHollowAfterAshwood,
  ensureGateWatchAfterHollow,
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
import { isItemId, type EquipSlot, type ItemId } from "@/game/items";
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
            return;
          }
        }
      }
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
      const turnIn = applyGateWatchRookTalk(loadQuestLog());
      if (turnIn) {
        saveQuestLog(turnIn.log);
        setCharacter((prev) => {
          if (!prev) return prev;
          let next: ValeCharacter = {
            ...prev,
            skillXp: { ...prev.skillXp },
          };
          if (turnIn.completedId === GATE_QUEST_ID) {
            next = awardCombatXp(next, GATE_REWARDS.combatXp);
            next = { ...next, skillXp: { ...next.skillXp } };
            awardSkillXp(next, GATE_REWARDS.skill, GATE_REWARDS.skillXp);
            next = setGold(next, next.gold + GATE_REWARDS.gold);
            next = { ...next, skillXp: { ...next.skillXp } };
            queueMicrotask(() => {
              showToast(GATE_COMPLETE_LINE);
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
      shopId: folk.shopId,
      bankId: folk.bankId,
    });
    setCharacter((prev) => (prev ? markFolkMet(prev, folkId) : prev));
  }, [character, showToast]);

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
