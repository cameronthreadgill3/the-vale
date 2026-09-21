import { useEffect, useRef, useState } from "react";
import { type ValeClass } from "@/game/classes";
import { type ContinentId } from "@/game/continents";
import type { ValeCharacter } from "@/game/character";
import type { SkillId } from "@/game/skills";
import { levelFromXp, progressInLevel, xpToNext } from "@/game/xp";
import { maxHpFor, maxManaFor } from "@/game/combat";
import { carriedWeight, maxSlotsFor, maxWeightFor } from "@/game/backpack";
import { type PromptState, type HudState } from "@/game/canvasConstants";
import { useGameLoopEffect } from "@/game/gameLoop";
import type { EnemyKindId } from "@/game/enemies";
import type { ItemId } from "@/game/items";

export function useGameCanvas(opts: {
  character: ValeCharacter;
  cls: ValeClass;
  arrivedFrom: ContinentId | null;
  shipSpawn: { x: number; y: number } | null;
  overlayOpen: boolean;
  onTrain: (skill: SkillId) => void;
  onToggleSkills: () => void;
  onToggleMap: () => void;
  onTravel: (target: ContinentId, from: ContinentId) => void;
  onEnterHollow: (index: number, returnTile: { x: number; y: number }) => void;
  onExitHollow: () => void;
  onPassivePrimary: (amount: number) => void;
  onOpenFolk: (folkId: string) => void;
  onOpenShop: (shopId: string) => void;
  onOpenShip: (dockId: string) => void;
  onCombatReward: (
    combatXp: number,
    skill: SkillId,
    skillXp: number,
    gold: number,
    loot?: ItemId[],
  ) => void;
  onEnemyKill: (kindId: EnemyKindId) => void;
  onIdentify: (kindId: EnemyKindId) => void;
  onVitals: (hp: number, mana: number) => void;
  onPlayerDeath: () => void;
  onInspectCairn: (cairnId: string) => void;
  onWorkNode: (nodeId: string) => void;
}) {
  const {
    character,
    cls,
    arrivedFrom,
    shipSpawn,
    overlayOpen,
    onTrain,
    onToggleSkills,
    onToggleMap,
    onTravel,
    onEnterHollow,
    onExitHollow,
    onPassivePrimary,
    onOpenFolk,
    onOpenShop,
    onOpenShip,
    onCombatReward,
    onEnemyKill,
    onIdentify,
    onVitals,
    onPlayerDeath,
    onInspectCairn,
    onWorkNode,
  } = opts;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const interactRequestRef = useRef(false);
  const accentRef = useRef(cls);
  const passiveRef = useRef(onPassivePrimary);
  const trainRef = useRef(onTrain);
  const toggleSkillsRef = useRef(onToggleSkills);
  const toggleMapRef = useRef(onToggleMap);
  const travelRef = useRef(onTravel);
  const enterHollowRef = useRef(onEnterHollow);
  const exitHollowRef = useRef(onExitHollow);
  const openFolkRef = useRef(onOpenFolk);
  const openShopRef = useRef(onOpenShop);
  const openShipRef = useRef(onOpenShip);
  const openCairnRef = useRef(onInspectCairn);
  const workNodeRef = useRef(onWorkNode);
  const primaryRef = useRef(cls.primarySkill);
  const passiveAccum = useRef(0);
  const promptRef = useRef<PromptState>(null);
  const interactLock = useRef(false);

  const characterRef = useRef<ValeCharacter>(character);
  const onCombatRewardRef = useRef(onCombatReward);
  const onEnemyKillRef = useRef(onEnemyKill);
  const onIdentifyRef = useRef(onIdentify);
  const onVitalsRef = useRef(onVitals);
  const onPlayerDeathRef = useRef(onPlayerDeath);
  const overlayOpenRef = useRef(overlayOpen);

  accentRef.current = cls;
  passiveRef.current = onPassivePrimary;
  trainRef.current = onTrain;
  toggleSkillsRef.current = onToggleSkills;
  toggleMapRef.current = onToggleMap;
  travelRef.current = onTravel;
  enterHollowRef.current = onEnterHollow;
  exitHollowRef.current = onExitHollow;
  openFolkRef.current = onOpenFolk;
  openShopRef.current = onOpenShop;
  openShipRef.current = onOpenShip;
  openCairnRef.current = onInspectCairn;
  workNodeRef.current = onWorkNode;
  primaryRef.current = cls.primarySkill;
  onCombatRewardRef.current = onCombatReward;
  onEnemyKillRef.current = onEnemyKill;
  onIdentifyRef.current = onIdentify;
  onVitalsRef.current = onVitals;
  onPlayerDeathRef.current = onPlayerDeath;
  overlayOpenRef.current = overlayOpen;
  characterRef.current = character;

  const combatXp = character.combatXp;
  const level = levelFromXp(combatXp);
  const [hud, setHud] = useState<HudState>({
    x: 0,
    y: 0,
    level,
    xp: combatXp,
    progress: progressInLevel(level, combatXp),
    next: xpToNext(level),
    hp: character.hp,
    maxHp: maxHpFor(character),
    mana: character.mana,
    maxMana: maxManaFor(character, cls),
    weight: carriedWeight(character.inventory),
    maxWeight: maxWeightFor(character.premiumBackpack),
    slots: character.inventory.length,
    maxSlots: maxSlotsFor(character.premiumBackpack),
    inSafeZone: false,
  });
  const [prompt, setPrompt] = useState<PromptState>(null);

  useEffect(() => {
    setHud((h) => ({
      ...h,
      hp: character.hp,
      maxHp: maxHpFor(character),
      mana: character.mana,
      maxMana: maxManaFor(character, cls),
      weight: carriedWeight(character.inventory),
      maxWeight: maxWeightFor(character.premiumBackpack),
      slots: character.inventory.length,
      maxSlots: maxSlotsFor(character.premiumBackpack),
      level: levelFromXp(character.combatXp),
      xp: character.combatXp,
      progress: progressInLevel(
        levelFromXp(character.combatXp),
        character.combatXp,
      ),
      next: xpToNext(levelFromXp(character.combatXp)),
    }));
  }, [character, cls]);

  useGameLoopEffect({
    canvasRef,
    keysRef,
    interactRequestRef,
    accentRef,
    passiveRef,
    trainRef,
    toggleSkillsRef,
    toggleMapRef,
    travelRef,
    enterHollowRef,
    exitHollowRef,
    openFolkRef,
    openShopRef,
    openShipRef,
    openCairnRef,
    workNodeRef,
    passiveAccum,
    promptRef,
    interactLock,
    character,
    arrivedFrom,
    shipSpawn,
    combatXp,
    setHud,
    setPrompt,
    characterRef,
    onCombatReward: onCombatRewardRef,
    onEnemyKill: onEnemyKillRef,
    onIdentify: onIdentifyRef,
    onVitals: onVitalsRef,
    onPlayerDeath: onPlayerDeathRef,
    overlayOpenRef,
  });
  return { canvasRef, keysRef, interactRequestRef, hud, prompt };
}
