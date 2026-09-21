import { useEffect, useState } from "react";
import { type ValeClass } from "@/game/classes";
import { type ContinentId } from "@/game/continents";
import type { ValeCharacter } from "@/game/character";
import { defaultQuickSlots, type SkillId } from "@/game/skills";
import { getDock, type ShopDef, type ShipDock } from "@/game/folk";
import {
  farePromptSuffix,
  quoteGateFare,
  shipDockFareSuffix,
} from "@/game/travelFares";
import { ContinentMapPanel } from "@/game/ui/ContinentMapPanel";
import { SkillsPanel, type ProfessionRow, type SkillRow } from "@/game/ui/SkillsPanel";
import { CraftPanel } from "@/game/ui/CraftPanel";
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
import type { TeethQuestProgress, AshwoodQuestProgress, HollowQuestProgress, GateWatchQuestProgress, MistmereQuestProgress, WatchlineQuestProgress, AshveilQuestProgress, ChoirCountsQuestProgress, WharfQuestProgress, GreenGateQuestProgress, SpineQuestProgress, PaleQuestProgress, AshenQuestProgress, EmbercoilQuestProgress, CoilQuestProgress, ChoirRemembersQuestProgress, EdgeRemembersQuestProgress, WharfRemembersQuestProgress } from "@/game/quests";
import type { ItemId, EquipSlot } from "@/game/items";

export function GameShell({
  character,
  cls,
  skills,
  professions,
  skillsOpen,
  mapOpen,
  skillTick,
  arrivedFrom,
  shipSpawn,
  toast,
  lootToast,
  continentName,
  inHollow,
  hollowIndex,
  dialogue,
  shop,
  bankOpen,
  packOpen,
  craftOpen,
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
  gateWatchQuest,
  mistmereQuest,
  watchlineQuest,
  ashveilQuest,
  choirCountsQuest,
  wharfQuest,
  greenGateQuest,
  spineQuest,
  paleQuest,
  ashenQuest,
  embercoilQuest,
  coilQuest,
  choirRemembersQuest,
  edgeRemembersQuest,
  wharfRemembersQuest,
  onInspectCairn,
  onWorkNode,
  onOpenCraft,
  onCloseCraft,
  onCraft,
}: {
  character: ValeCharacter;
  cls: ValeClass;
  skills: SkillRow[];
  professions: ProfessionRow[];
  skillsOpen: boolean;
  mapOpen: boolean;
  skillTick: number;
  arrivedFrom: ContinentId | null;
  shipSpawn: { x: number; y: number } | null;
  toast: string | null;
  lootToast: string | null;
  continentName: string;
  inHollow: boolean;
  hollowIndex: number | null;
  dialogue: { name: string; line: string; hasShop: boolean; hasBank?: boolean; hasCraft?: boolean; shopId?: string; bankId?: string; craftId?: string } | null;
  shop: ShopDef | null;
  bankOpen: boolean;
  packOpen: boolean;
  craftOpen: boolean;
  premiumUnlocking: boolean;
  voyageDock: ShipDock | null;
  onToggleSkills: () => void;
  onToggleMap: () => void;
  onTrain: (skill: SkillId) => void;
  onAssignQuickSlot: (index: number, skill: SkillId) => void;
  onResetPath: () => void;
  onTravel: (target: ContinentId, from: ContinentId) => boolean;
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
  gateWatchQuest: GateWatchQuestProgress | null;
  mistmereQuest: MistmereQuestProgress | null;
  watchlineQuest: WatchlineQuestProgress | null;
  ashveilQuest: AshveilQuestProgress | null;
  choirCountsQuest: ChoirCountsQuestProgress | null;
  wharfQuest: WharfQuestProgress | null;
  greenGateQuest: GreenGateQuestProgress | null;
  spineQuest: SpineQuestProgress | null;
  paleQuest: PaleQuestProgress | null;
  ashenQuest: AshenQuestProgress | null;
  embercoilQuest: EmbercoilQuestProgress | null;
  coilQuest: CoilQuestProgress | null;
  choirRemembersQuest: ChoirRemembersQuestProgress | null;
  edgeRemembersQuest: EdgeRemembersQuestProgress | null;
  wharfRemembersQuest: WharfRemembersQuestProgress | null;
  onInspectCairn: (cairnId: string) => void;
  onWorkNode: (nodeId: string) => void;
  onOpenCraft: () => void;
  onCloseCraft: () => void;
  onCraft: (recipeId: string) => void;
}) {
  // Pack is HUD chrome like Skills — do not pause E / movement while it is open.
  const overlayOpen = Boolean(dialogue || shop || voyageDock || bankOpen || craftOpen);
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
    onWorkNode,
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
          gateWatchQuest={gateWatchQuest}
          mistmereQuest={mistmereQuest}
          watchlineQuest={watchlineQuest}
          ashveilQuest={ashveilQuest}
          choirCountsQuest={choirCountsQuest}
          wharfQuest={wharfQuest}
          greenGateQuest={greenGateQuest}
          spineQuest={spineQuest}
          paleQuest={paleQuest}
          ashenQuest={ashenQuest}
          embercoilQuest={embercoilQuest}
          coilQuest={coilQuest}
          choirRemembersQuest={choirRemembersQuest}
          edgeRemembersQuest={edgeRemembersQuest}
          wharfRemembersQuest={wharfRemembersQuest}
          onOpenPack={onTogglePack}
        />
        <div className="flex flex-wrap gap-2">
          {!showMobile && (
          <div className="vale-surface w-fit px-3 py-1.5 text-xs text-[#a8b09a]">
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
            className="vale-ghost-btn pointer-events-auto px-3 py-1.5 text-xs text-[#a8b09a]"
            onClick={onResetPath}
          >
            Change path
          </button>
        </div>
      </div>

      {prompt && !overlayOpen && (
        <div className="vale-text-screen pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 px-4 py-2.5 text-center text-sm text-[#e8e6d9] bottom-40">
          {prompt.kind === "gate" && (
            <>
              <span className="text-[#e8e6d9]">Use gate</span>
              {" → "}
              <span className="text-[#c9a227]">{prompt.name}</span>
              <span className="text-[#c9a227]">
                {farePromptSuffix(
                  quoteGateFare(
                    character.continentId,
                    prompt.target,
                    character.discoveredContinents,
                  ),
                )}
              </span>
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
                  ? "Talk / Open bank"
                  : prompt.hasCraft
                    ? "Talk / Craft"
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
              <span className="text-[#7ab8c9]">
                {shipDockFareSuffix(
                  character.continentId,
                  getDock(prompt.dockId)?.destinations ?? [],
                  character.discoveredContinents,
                )}
              </span>
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
          {prompt.kind === "profession" && (
            <>
              <span className="text-[#e8e6d9]">{prompt.verb}</span>
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
          className="vale-text-screen absolute left-1/2 top-20 z-20 w-[min(92vw,28rem)] -translate-x-1/2 px-3.5 py-2.5 text-left text-xs text-[#e8e6d9] sm:text-sm"
        >
          <div className="font-display text-[11px] tracking-wide text-[#c9a227] sm:text-xs">
            Thornreach — first steps
          </div>
          <div className="mt-1.5 text-[13px] leading-[1.6] text-[#d4d0bc] sm:text-sm">{STARTER_TIP}</div>
          <div className="mt-1.5 text-[10px] text-[#8a9080]">
            Tap to dismiss · follow the yellow arrow to Rook</div>
        </button>
      )}

      {toast && (
        <div
          role="status"
          className="vale-toast pointer-events-none absolute left-1/2 top-[28%] z-20 w-[min(92vw,22rem)] -translate-x-1/2 whitespace-pre-line px-4 py-2.5 text-center text-sm leading-relaxed text-[#e8e6d9] sm:px-5"
        >
          {toast}
        </div>
      )}

      {lootToast && (
        <div
          role="status"
          className="vale-toast pointer-events-none absolute left-1/2 top-1/3 z-20 w-[min(92vw,20rem)] -translate-x-1/2 px-4 py-2 text-center text-sm leading-relaxed tracking-wide text-[#e8d090] sm:px-5"
        >
          {lootToast}
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
            professions={professions}
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
          hasCraft={dialogue.hasCraft}
          onTalkClose={onCloseDialogue}
          onOpenShop={
            dialogue.shopId
              ? () => onOpenShop(dialogue.shopId!)
              : undefined
          }
          onOpenBank={dialogue.hasBank ? onOpenBank : undefined}
          onOpenCraft={dialogue.hasCraft ? onOpenCraft : undefined}
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

      {craftOpen && (
        <CraftPanel
          character={character}
          onCraft={onCraft}
          onClose={onCloseCraft}
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
          gold={character.gold}
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
