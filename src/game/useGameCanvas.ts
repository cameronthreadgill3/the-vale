import { useRef, useState } from "react";
import { type ValeClass } from "@/game/classes";
import { type ContinentId } from "@/game/continents";
import type { ValeCharacter } from "@/game/character";
import type { SkillId } from "@/game/skills";
import { levelFromXp, progressInLevel, xpToNext } from "@/game/xp";
import { type PromptState, type HudState } from "@/game/canvasConstants";
import { useGameLoopEffect } from "@/game/gameLoop";

export function useGameCanvas(opts: {
  character: ValeCharacter;
  cls: ValeClass;
  arrivedFrom: ContinentId | null;
  shipSpawn: { x: number; y: number } | null;
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
}) {
  const {
    character, cls, arrivedFrom, shipSpawn, onTrain, onToggleSkills, onToggleMap,
    onTravel, onEnterHollow, onExitHollow, onPassivePrimary,
    onOpenFolk, onOpenShop, onOpenShip,
  } = opts;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Record<string, boolean>>({});
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
  const primaryRef = useRef(cls.primarySkill);
  const passiveAccum = useRef(0);
  const promptRef = useRef<PromptState>(null);
  const interactLock = useRef(false);
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
  primaryRef.current = cls.primarySkill;
  const combatXp = character.combatXp;
  const level = levelFromXp(combatXp);
  const [hud, setHud] = useState<HudState>({
    x: 0,
    y: 0,
    level,
    xp: combatXp,
    progress: progressInLevel(level, combatXp),
    next: xpToNext(level),
  });
  const [prompt, setPrompt] = useState<PromptState>(null);
  useGameLoopEffect({
    canvasRef,
    keysRef,
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
    passiveAccum,
    promptRef,
    interactLock,
    character,
    arrivedFrom,
    shipSpawn,
    combatXp,
    setHud,
    setPrompt,
  });
  return { canvasRef, hud, prompt };
}
