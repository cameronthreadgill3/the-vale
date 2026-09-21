import { useEffect, useState } from "react";
import { type ValeClass } from "@/game/classes";
import { type ContinentId } from "@/game/continents";
import type { ValeCharacter } from "@/game/character";
import type { SkillId } from "@/game/skills";
import type { ShopDef, ShipDock } from "@/game/folk";
import { ContinentMapPanel } from "@/game/ui/ContinentMapPanel";
import { SkillsPanel, type SkillRow } from "@/game/ui/SkillsPanel";
import { DialogueOverlay } from "@/game/ui/DialogueOverlay";
import { ShopPanel } from "@/game/ui/ShopPanel";
import { VoyagePanel } from "@/game/ui/VoyagePanel";
import { useGameCanvas } from "@/game/useGameCanvas";
import { MobileControls, useShowMobileChrome } from "@/game/ui/MobileControls";
import { GameShellHud } from "@/game/ui/GameShellHud";
import { STARTER_TIP, STARTER_TIP_MS } from "@/game/wayfinding";
import type { EnemyKindId } from "@/game/enemies";
import type { TeethQuestProgress } from "@/game/quests";

export function GameShell({
  character,
  cls,
  skills,
  skillsOpen,
  mapOpen,
  skillTick,
  arrivedFrom,
  shipSpawn,
  toast,
  continentName,
  inHollow,
  hollowIndex,
  dialogue,
  shop,
  voyageDock,
  onToggleSkills,
  onToggleMap,
  onTrain,
  onResetPath,
  onTravel,
  onEnterHollow,
  onExitHollow,
  onPassivePrimary,
  onOpenFolk,
  onOpenShop,
  onOpenShip,
  onCloseDialogue,
  onCloseShop,
  onCloseVoyage,
  onBuy,
  onSell,
  onSail,
  onCombatReward,
  onEnemyKill,
  onIdentify,
  onVitals,
  onPlayerDeath,
  teethQuest,
}: {
  character: ValeCharacter;
  cls: ValeClass;
  skills: SkillRow[];
  skillsOpen: boolean;
  mapOpen: boolean;
  skillTick: number;
  arrivedFrom: ContinentId | null;
  shipSpawn: { x: number; y: number } | null;
  toast: string | null;
  continentName: string;
  inHollow: boolean;
  hollowIndex: number | null;
  dialogue: { name: string; line: string; hasShop: boolean; shopId?: string } | null;
  shop: ShopDef | null;
  voyageDock: ShipDock | null;
  onToggleSkills: () => void;
  onToggleMap: () => void;
  onTrain: (skill: SkillId) => void;
  onResetPath: () => void;
  onTravel: (target: ContinentId, from: ContinentId) => void;
  onEnterHollow: (index: number, returnTile: { x: number; y: number }) => void;
  onExitHollow: () => void;
  onPassivePrimary: (amount: number) => void;
  onOpenFolk: (folkId: string) => void;
  onOpenShop: (shopId: string) => void;
  onOpenShip: (dockId: string) => void;
  onCloseDialogue: () => void;
  onCloseShop: () => void;
  onCloseVoyage: () => void;
  onBuy: (itemId: string, price: number) => void;
  onSell: (itemId: string, price: number) => void;
  onSail: (dest: ContinentId) => void;
  onCombatReward: (
    combatXp: number,
    skill: SkillId,
    skillXp: number,
    gold: number,
  ) => void;
  onEnemyKill: (kindId: EnemyKindId) => void;
  onIdentify: (kindId: EnemyKindId) => void;
  onVitals: (hp: number, mana: number) => void;
  onPlayerDeath: () => void;
  teethQuest: TeethQuestProgress | null;
}) {
  const overlayOpen = Boolean(dialogue || shop || voyageDock);
  const showMobile = useShowMobileChrome();
  const [starterTip, setStarterTip] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setStarterTip(false), STARTER_TIP_MS);
    return () => window.clearTimeout(t);
  }, []);
  const { canvasRef, keysRef, interactRequestRef, hud, prompt } = useGameCanvas({
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
  });

  const locationLabel = inHollow
    ? `${continentName} | Hollow ${(hollowIndex ?? 0) + 1}`
    : continentName;

  return (
    <div className="game-root relative h-full w-full select-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="game-canvas block h-full w-full touch-none"
        tabIndex={0}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-2 p-4 sm:p-5">
        <GameShellHud cls={cls} character={character} hud={hud} locationLabel={locationLabel} teethQuest={teethQuest} />
        <div className="flex flex-wrap gap-2">
          {!showMobile && (
          <div className="w-fit rounded border border-[#2a2e24] bg-[#161812]/80 px-3 py-1.5 text-xs text-[#a8b09a] backdrop-blur-sm">
            Move <span className="text-[#e8e6d9]">WASD</span> /{" "}
            <span className="text-[#e8e6d9]">Arrows</span>
            {" | "}
            <span className="text-[#e8e6d9]">Space</span>/<span className="text-[#e8e6d9]">Click</span> attack
            {" | "}
            <span className="text-[#e8e6d9]">E</span> talk/shop/board
            {" | "}
            <span className="text-[#e8e6d9]">M</span> map
            {" | "}
            <span className="text-[#e8e6d9]">K</span> skills
            {" | "}
            <span className="text-[#e8e6d9]">1-7</span> train
          </div>
          )}
          <button
            type="button"
            className="pointer-events-auto rounded border border-[#2a2e24] bg-[#161812]/90 px-3 py-1.5 text-xs text-[#e8e6d9] backdrop-blur-sm hover:border-[#c9a227]/50"
            onClick={onToggleMap}
          >
            {mapOpen ? "Hide map" : "Map (M)"}
          </button>
          <button
            type="button"
            className="pointer-events-auto rounded border border-[#2a2e24] bg-[#161812]/90 px-3 py-1.5 text-xs text-[#e8e6d9] backdrop-blur-sm hover:border-[#c9a227]/50"
            onClick={onToggleSkills}
          >
            {skillsOpen ? "Hide skills" : "Skills (K)"}
          </button>
          <button
            type="button"
            className="pointer-events-auto rounded border border-[#2a2e24] bg-[#161812]/90 px-3 py-1.5 text-xs text-[#a8b09a] backdrop-blur-sm hover:border-[#c9a227]/50"
            onClick={onResetPath}
          >
            Change path
          </button>
        </div>
      </div>

      {prompt && !overlayOpen && (
        <div className={`pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 rounded border border-[#c9a227]/50 bg-[#161812]/95 px-4 py-2 text-center text-sm text-[#e8e6d9] shadow-lg backdrop-blur-md ${showMobile ? "bottom-40" : "bottom-24"}`}>
          {prompt.kind === "gate" && (
            <>
              <span className="text-[#e8e6d9]">Use gate</span>
              {" → "}
              <span className="text-[#c9a227]">{prompt.name}</span>
              <div className="mt-0.5 text-xs text-[#a8b09a]">
                Walk in or press <span className="text-[#e8e6d9]">E</span>
              </div>
            </>
          )}
          {prompt.kind === "hollow" && (
            <>
              <span className="text-[#e8e6d9]">Enter hollow</span>
              <span className="text-[#c9a227]"> · {(prompt.index + 1).toString()}</span>
              <div className="mt-0.5 text-xs text-[#a8b09a]">
                Press <span className="text-[#e8e6d9]">E</span> or walk in
              </div>
            </>
          )}
          {prompt.kind === "exit" && (
            <>
              <span className="text-[#e8e6d9]">Exit hollow</span>
              <div className="mt-0.5 text-xs text-[#a8b09a]">
                Press <span className="text-[#e8e6d9]">E</span> or walk onto the exit
              </div>
            </>
          )}
          {prompt.kind === "folk" && (
            <>
              <span className="text-[#e8e6d9]">
                {prompt.hasShop ? "Talk / Shop" : "Talk"}
              </span>
              {" · "}
              <span className="text-[#c9a227]">{prompt.name}</span>
              <div className="mt-0.5 text-xs text-[#a8b09a]">
                Press <span className="text-[#e8e6d9]">E</span>
              </div>
            </>
          )}
          {prompt.kind === "shop" && (
            <>
              <span className="text-[#e8e6d9]">Shop</span>
              {" · "}
              <span className="text-[#c9a227]">{prompt.name}</span>
              <div className="mt-0.5 text-xs text-[#a8b09a]">
                Press <span className="text-[#e8e6d9]">E</span>
              </div>
            </>
          )}
          {prompt.kind === "ship" && (
            <>
              <span className="text-[#e8e6d9]">Board ship</span>
              {" · "}
              <span className="text-[#7ab8c9]">{prompt.name}</span>
              <div className="mt-0.5 text-xs text-[#a8b09a]">
                Press <span className="text-[#e8e6d9]">E</span>
              </div>
            </>
          )}
        </div>
      )}

      {starterTip && !overlayOpen && (
        <button
          type="button"
          onClick={() => setStarterTip(false)}
          className="absolute left-1/2 top-20 z-20 w-[min(92vw,28rem)] -translate-x-1/2 rounded border border-[#c9a227]/55 bg-[#161812]/95 px-3 py-2 text-left text-xs text-[#e8e6d9] shadow-lg backdrop-blur-md sm:text-sm"
        >
          <div className="font-display text-[11px] tracking-wide text-[#c9a227] sm:text-xs">
            Thornreach — first steps
          </div>
          <div className="mt-1 text-[#c8c4b0]">{STARTER_TIP}</div>
          <div className="mt-1 text-[10px] text-[#8a9080]">
            Tap to dismiss · follow the yellow arrow to Rook</div>
        </button>
      )}

      {toast && (
        <div className="pointer-events-none absolute left-1/2 top-1/3 z-20 -translate-x-1/2 rounded border border-[#2a2e24] bg-[#0c0d0b]/90 px-4 py-2 font-display text-sm tracking-wide text-[#c9a227] shadow-xl">
          {toast}
        </div>
      )}

      {mapOpen && (
        <ContinentMapPanel character={character} onClose={onToggleMap} />
      )}

      {skillsOpen && (
        <SkillsPanel
          cls={cls}
          skills={skills}
          skillTick={skillTick}
          onTrain={onTrain}
          onClose={onToggleSkills}
        />
      )}

      {dialogue && (
        <DialogueOverlay
          name={dialogue.name}
          line={dialogue.line}
          hasShop={dialogue.hasShop}
          onTalkClose={onCloseDialogue}
          onOpenShop={
            dialogue.shopId
              ? () => onOpenShop(dialogue.shopId!)
              : undefined
          }
        />
      )}

      {shop && (
        <ShopPanel
          shop={shop}
          character={character}
          onBuy={onBuy}
          onSell={onSell}
          onClose={onCloseShop}
        />
      )}

      {voyageDock && (
        <VoyagePanel
          dock={voyageDock}
          currentContinent={character.continentId}
          discovered={character.discoveredContinents}
          onSail={onSail}
          onClose={onCloseVoyage}
        />
      )}

      {showMobile && !overlayOpen && !skillsOpen && !mapOpen && (
        <MobileControls
          keysRef={keysRef}
          interactRequestRef={interactRequestRef}
          onToggleSkills={onToggleSkills}
          onToggleMap={onToggleMap}
        />
      )}
    </div>
  );
}
