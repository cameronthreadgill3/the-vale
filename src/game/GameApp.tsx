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
