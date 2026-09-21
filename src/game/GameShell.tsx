import { useEffect, useState } from "react";
import { type ValeClass } from "@/game/classes";
import { type ContinentId } from "@/game/continents";
import type { ValeCharacter } from "@/game/character";
import { defaultQuickSlots, type SkillId } from "@/game/skills";
import type { ShopDef, ShipDock } from "@/game/folk";
import { ContinentMapPanel } from "@/game/ui/ContinentMapPanel";
import { SkillsPanel, type SkillRow } from "@/game/ui/SkillsPanel";
import { DialogueOverlay } from "@/game/ui/DialogueOverlay";
import { ShopPanel } from "@/game/ui/ShopPanel";
import { BankPanel } from "@/game/ui/BankPanel";
import { PackPanel } from "@/game/ui/PackPanel";
import { VoyagePanel } from "@/game/ui/VoyagePanel";
import { useGameCanvas } from "@/game/useGameCanvas";
import { MobileControls, useShowMobileChrome } from "@/game/ui/MobileControls";
import { QuickSkillCluster } from "@/game/ui/QuickSkillCluster";
import { CornerTabs } from "@/game/ui/CornerTabs";
import { GameShellHud } from "@/game/ui/GameShellHud";
import { STARTER_TIP, STARTER_TIP_MS } from "@/game/wayfinding";
import type { EnemyKindId } from "@/game/enemies";
import type { TeethQuestProgress, AshwoodQuestProgress, HollowQuestProgress } from "@/game/quests";
import type { ItemId, EquipSlot } from "@/game/items";

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
  bankOpen,
  packOpen,
  premiumUnlocking,
  voyageDock,
  onToggleSkills,
  onToggleMap,
  onTrain,
  onAssignQuickSlot,
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
  onOpenBank,
  onCloseBank,
  onDepositItem,
  onWithdrawItem,
  onDepositGold,
  onWithdrawGold,
  onTogglePack,
  onUnlockPremiumDemo,
  onUnlockPremiumStripe,
  onCloseVoyage,
  onBuy,
  onSell,
  onSail,
  onEquip,
  onUnequip,
  onCombatReward,
  onEnemyKill,
  onIdentify,
  onVitals,
  onPlayerDeath,
  teethQuest,
  ashwoodQuest,
  hollowQuest,
  onInspectCairn,
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
  dialogue: { name: string; line: string; hasShop: boolean; hasBank?: boolean; shopId?: string; bankId?: string } | null;
  shop: ShopDef | null;
  bankOpen: boolean;
  packOpen: boolean;
  premiumUnlocking: boolean;
  voyageDock: ShipDock | null;
  onToggleSkills: () => void;
  onToggleMap: () => void;
  onTrain: (skill: SkillId) => void;
  onAssignQuickSlot: (index: number, skill: SkillId) => void;
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
  onOpenBank: () => void;
  onCloseBank: () => void;
  onDepositItem: (itemId: string) => void;
  onWithdrawItem: (itemId: string) => void;
  onDepositGold: (amount: number) => void;
  onWithdrawGold: (amount: number) => void;
  onTogglePack: () => void;
  onUnlockPremiumDemo: () => void;
  onUnlockPremiumStripe: () => void;
  onCloseVoyage: () => void;
  onBuy: (itemId: string, price: number) => void;
  onSell: (itemId: string, price: number) => void;
  onSail: (dest: ContinentId) => void;
  onEquip: (itemId: string) => void;
  onUnequip: (slot: EquipSlot) => void;
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
  teethQuest: TeethQuestProgress | null;
  ashwoodQuest: AshwoodQuestProgress | null;
  hollowQuest: HollowQuestProgress | null;
  onInspectCairn: (cairnId: string) => void;
}) {
  // Pack is HUD chrome like Skills — do not pause E / movement while it is open.
  const overlayOpen = Boolean(dialogue || shop || voyageDock || bankOpen);
  const showMobile = useShowMobileChrome();
  const [starterTip, setStarterTip] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setStarterTip(false), STARTER_TIP_MS);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.code !== "KeyB" && e.code !== "KeyI") || e.repeat) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      e.preventDefault();
      onTogglePack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onTogglePack]);
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
    onInspectCairn,
  });

  const locationLabel = inHollow
    ? `${continentName} | Hollow ${(hollowIndex ?? 0) + 1}`
    : continentName;
  const quickSlots = character.quickSlots ?? defaultQuickSlots(cls.id);

  return (
    <div className="game-root relative h-full w-full select-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="game-canvas block h-full w-full touch-none"
        tabIndex={0}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-2 p-4 sm:p-5">
        <GameShellHud
          cls={cls}
          character={character}
          hud={hud}
          locationLabel={locationLabel}
          teethQuest={teethQuest}
          ashwoodQuest={ashwoodQuest}
          hollowQuest={hollowQuest}
          onOpenPack={onTogglePack}
        />
        <div className="flex flex-wrap gap-2">
          {!showMobile && (
          <div className="w-fit rounded border border-[#2a2e24] bg-[#161812]/80 px-3 py-1.5 text-xs text-[#a8b09a] backdrop-blur-sm">
            Move <span className="text-[#e8e6d9]">WASD</span> /{" "}
            <span className="text-[#e8e6d9]">Arrows</span>
            {" | "}
            <span className="text-[#e8e6d9]">Space</span>/<span className="text-[#e8e6d9]">Click</span> attack
            {" | "}
            <span className="text-[#e8e6d9]">E</span> talk/shop/bank
            {" | "}
            <span className="text-[#e8e6d9]">B</span>/<span className="text-[#e8e6d9]">I</span> pack
            {" | "}
            <span className="text-[#e8e6d9]">M</span> map
            {" | "}
            <span className="text-[#e8e6d9]">K</span> skills
            {" | "}
            <span className="text-[#e8e6d9]">1-3</span> quick skills
          </div>
          )}
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
        <div className={`pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 rounded border border-[#c9a227]/50 bg-[#161812]/95 px-4 py-2 text-center text-sm text-[#e8e6d9] shadow-lg backdrop-blur-md bottom-40`}>
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
                {prompt.hasBank
                  ? "Talk / Bank"
                  : prompt.hasShop
                    ? "Talk / Shop"
                    : "Talk"}
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
              <span className="text-[#e8e6d9]">Enter shop</span>
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
          {prompt.kind === "cairn" && (
            <>
              <span className="text-[#e8e6d9]">Inspect cairn</span>
              {" · "}
              <span className="text-[#c9a227]">{prompt.name}</span>
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

      <CornerTabs
        skillsOpen={skillsOpen}
        mapOpen={mapOpen}
        onToggleSkills={onToggleSkills}
        onToggleMap={onToggleMap}
        skillsPanel={
          <SkillsPanel
            cls={cls}
            skills={skills}
            skillTick={skillTick}
            quickSlots={quickSlots}
            onTrain={onTrain}
            onAssignQuickSlot={onAssignQuickSlot}
            onClose={onToggleSkills}
          />
        }
        mapPanel={
          <ContinentMapPanel character={character} onClose={onToggleMap} />
        }
      />

      {dialogue && (
        <DialogueOverlay
          name={dialogue.name}
          line={dialogue.line}
          hasShop={dialogue.hasShop}
          hasBank={dialogue.hasBank}
          onTalkClose={onCloseDialogue}
          onOpenShop={
            dialogue.shopId
              ? () => onOpenShop(dialogue.shopId!)
              : undefined
          }
          onOpenBank={dialogue.hasBank ? onOpenBank : undefined}
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

      {bankOpen && (
        <BankPanel
          character={character}
          onDepositItem={onDepositItem}
          onWithdrawItem={onWithdrawItem}
          onDepositGold={onDepositGold}
          onWithdrawGold={onWithdrawGold}
          onClose={onCloseBank}
        />
      )}

      {packOpen && (
        <PackPanel
          character={character}
          unlocking={premiumUnlocking}
          onUnlockDemo={onUnlockPremiumDemo}
          onUnlockStripe={onUnlockPremiumStripe}
          onEquip={onEquip}
          onUnequip={onUnequip}
          onClose={onTogglePack}
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

      {!overlayOpen && (
        <QuickSkillCluster
          keysRef={keysRef}
          interactRequestRef={interactRequestRef}
          quickSlots={quickSlots}
          skills={skills}
          onTrain={onTrain}
          showInteract={showMobile}
        />
      )}

      {showMobile && !overlayOpen && (
        <MobileControls keysRef={keysRef} />
      )}
    </div>
  );
}
